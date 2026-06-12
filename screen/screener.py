import yfinance as yf
import pandas as pd
import numpy as np
from tqdm import tqdm
import os
import json
import logging
import math
import time 
import requests
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

# ==========================================
# 1. KONFIGURASI BOT & SENSITIVITAS
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_EXCEL = os.path.join(BASE_DIR, "Daftar Saham - 20260427.xlsx") 
BLACKLIST_FILE = os.path.join(BASE_DIR, "blacklist_saham.json")
DB_SCREENER_FILE = os.path.join(BASE_DIR, "db_screener.json")


# --- KONFIGURASI TELEGRAM BOT ---
TELEGRAM_BOT_TOKEN = "8451549354:AAFjuU3pXifDSMsRgXKRJSCWxyM2sfIiNbg"
TELEGRAM_CHAT_ID = "8012930236"

# --- MODE OFFLINE ---
MODE_OFFLINE = False  

# --- FITUR LOOPING MESIN WAKTU ---
MODE_BACKTEST_RANGE = True           
TANGGAL_AWAL_BACKTEST = "2026-06-01"  

# --- SETTING ANTI-BLOCK ---
MAX_WORKERS = 8  
DELAY_BETWEEN_TICKERS = 0.2 
MOMENTUM_MULTIPLIER = 1.8
MAX_PRIORITY_SCORE = 4  
MAX_RISK_TOLERANCE = -10.0 

logging.getLogger('yfinance').setLevel(logging.CRITICAL)

GLOBAL_YF_CACHE = {}
GLOBAL_SECTOR_CACHE = {}

# ==========================================
# 2. SISTEM PENGAMAN DATA & REKAM HISTORIS
# ==========================================
def load_blacklist():
    if os.path.exists(BLACKLIST_FILE):
        try:
            with open(BLACKLIST_FILE, 'r') as f:
                return set(json.load(f))
        except: return set()
    return set()

def load_db_screener():
    if os.path.exists(DB_SCREENER_FILE):
        try:
            with open(DB_SCREENER_FILE, 'r') as f:
                return json.load(f)
        except: return []
    return []

def save_db_screener(data):
    with open(DB_SCREENER_FILE, 'w') as f:
        json.dump(data, f, indent=4)

def safe_int(value):
    if value is None or pd.isna(value) or math.isnan(float(value)): return 0
    return int(float(value))

def send_telegram_photo(image_path, caption_text):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠️ Token Telegram atau Chat ID belum dikonfigurasi. Pesan tidak dikirim.")
        return False
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
    try:
        with open(image_path, 'rb') as photo:
            files = {'photo': photo}
            payload = {'chat_id': TELEGRAM_CHAT_ID, 'caption': caption_text, 'parse_mode': 'HTML'}
            response = requests.post(url, data=payload, files=files, timeout=20)
            if response.status_code == 200:
                print("🚀 Gambar hasil screening berhasil dikirim ke Telegram!")
                return True
            else:
                print(f"❌ Gagal mengirim gambar. Error: {response.text}")
                return False
    except Exception as e:
        print(f"❌ Gagal koneksi ke API Telegram saat mengirim gambar: {e}")
        return False

# ==========================================
# 3. MESIN ANALISIS SMC HISTORIS 
# ==========================================
def get_smc_analysis(ticker, target_date, waktu_screen_seragam, is_backtest_tgl, cache_dict):
    try:
        if is_backtest_tgl and ticker in cache_dict:
            cached_data = cache_dict[ticker].copy()
            cached_data["Waktu Screen"] = waktu_screen_seragam
            return ticker, cached_data, "CACHE_HIT"

        df = pd.DataFrame()
        sektor = "-"
        
        if ticker in GLOBAL_YF_CACHE:
            df = GLOBAL_YF_CACHE[ticker].copy(deep=True)
            sektor = GLOBAL_SECTOR_CACHE.get(ticker, "-")
        else:
            time.sleep(np.random.uniform(0.1, DELAY_BETWEEN_TICKERS))
            saham_obj = yf.Ticker(ticker)
            try:
                sektor = saham_obj.info.get('sector', '-') if hasattr(saham_obj, 'info') else "-"
            except: pass
            
            for attempt in range(3):
                try:
                    df = saham_obj.history(period="1y", interval="1d", auto_adjust=True)
                    if not df.empty: break
                except: pass
                time.sleep(1.5)
            
            if not df.empty:
                GLOBAL_YF_CACHE[ticker] = df.copy(deep=True)
                GLOBAL_SECTOR_CACHE[ticker] = sektor

        if df.empty or len(df) < 30: return ticker, None, "Data Kosong"
            
        df.dropna(subset=['Open', 'High', 'Low', 'Close'], inplace=True)
        if isinstance(df.columns, pd.MultiIndex): df.columns = df.columns.droplevel(1)
        
        df['Tanggal_Str'] = df.index.strftime('%Y-%m-%d')
        df = df[df['Tanggal_Str'] <= target_date]
        df.drop(columns=['Tanggal_Str'], inplace=True)
        
        if df.empty or len(df) < 30: return ticker, None, "Kosong Pasca Slice"

        last_price = float(df['Close'].iloc[-1])
        if last_price <= 50: return ticker, None, "Gocap"

        major_len, minor_len = 10, 2
        df['PH_Major'] = df['High'] == df['High'].rolling(window=major_len*2+1, center=True).max()
        df['PL_Major'] = df['Low'] == df['Low'].rolling(window=major_len*2+1, center=True).min()
        df['PH_Minor'] = df['High'] == df['High'].rolling(window=minor_len*2+1, center=True).max()
        df['PL_Minor'] = df['Low'] == df['Low'].rolling(window=minor_len*2+1, center=True).min()
        
        df['Body'] = abs(df['Close'] - df['Open'])
        is_large_body = df['Body'] > (df['Body'].rolling(window=20).mean() * MOMENTUM_MULTIPLIER)
        bull_mom_active = bool(is_large_body.iloc[-1] and df['Close'].iloc[-1] > df['Open'].iloc[-1])
        
        trend, struct_h, struct_l = 0, float(df['High'].iloc[0]), float(df['Low'].iloc[0])
        idm_price = None

        for i in range(len(df)):
            curr_c, prev_c = float(df['Close'].iloc[i]), (float(df['Close'].iloc[i-1]) if i > 0 else float(df['Close'].iloc[i]))
            if i >= major_len:
                idx = i - major_len
                if df['PH_Major'].iloc[idx]: struct_h = float(df['High'].iloc[idx])
                if df['PL_Major'].iloc[idx]: struct_l = float(df['Low'].iloc[idx])
            if (curr_c > struct_h) and (prev_c <= struct_h): trend = 1
            if (curr_c < struct_l) and (prev_c >= struct_l): trend = -1

        if trend != 0:
            idm_series = df['PL_Minor'] if trend == 1 else df['PH_Minor']
            val_col = 'Low' if trend == 1 else 'High'
            valid_idms = df[idm_series][val_col].dropna()
            idm_price = float(valid_idms.iloc[-1]) if not valid_idms.empty else None

        if trend == 0 or not idm_price: return ticker, None, "Sideways"

        tp1 = float(df['High'].tail(10).max())
        if tp1 <= last_price: tp1 = last_price * 1.05
        tp2 = struct_h if struct_h > tp1 else tp1 * 1.05
        stop_loss = struct_l 

        cuan1 = ((tp1 - last_price) / last_price) * 100
        risiko_persen = ((stop_loss - last_price) / last_price) * 100

        status_smc, rekomendasi, score = "HARGA > IDM", "Tunggu Validasi", 5
        last_low, last_open = float(df['Low'].iloc[-1]), float(df['Open'].iloc[-1])
        prev_close = float(df['Close'].iloc[-2]) if len(df) > 1 else last_price
        
        if trend == 1:
            if last_low < idm_price:
                if last_price > idm_price and last_price > last_open:
                    status_smc, rekomendasi, score = "SWEEP VALIDATED (ENTRY)", "BUY (VALIDATED)", 1  
                else:
                    status_smc, rekomendasi, score = "SWEEP BULLISH", "Tunggu Validasi", 4  
        
        if risiko_persen < MAX_RISK_TOLERANCE: rekomendasi, score = "RISIKO TINGGI", 6
        if cuan1 <= 1.0: rekomendasi, score = "HARGA DI PUCUK", 6

        change_today = ((last_price - prev_close) / prev_close) * 100 if len(df) > 1 else 0
        waktu_data_terakhir = df.index[-1].strftime('%Y-%m-%d')

        return ticker, {
            "Waktu Screen": waktu_screen_seragam,  
            "Waktu Candle": waktu_data_terakhir, 
            "Ticker": ticker.replace(".JK", ""), 
            "Sektor": sektor,    
            "Harga": safe_int(last_price),
            "Chg(%)": change_today, 
            "Pola": status_smc, "Sinyal": rekomendasi,
            "TP 1": safe_int(tp1), "TP 1(%)": f"{cuan1:.2f}%", "Cuan_Raw": cuan1,
            "TP 2": safe_int(tp2), "TP 2(%)": f"{((tp2-last_price)/last_price*100):.2f}%",
            "SL": safe_int(stop_loss), "Risk(%)": f"{risiko_persen:.2f}%",
            "RR Ratio": f"1 : {round(cuan1/abs(risiko_persen),1)}" if risiko_persen < 0 else "-",
            "Momentum": "STRONG BULL" if bull_mom_active else "-", "Score": score,
            "Status Akhir": "RUNNING"
        }, "DOWNLOAD_SUCCESS"

    except Exception: return ticker, None, "Err"

# ==========================================
# 4. ENGINE TRACKER LIVE (EVALUASI AKHIR)
# ==========================================
def track_historical_signals(db_lama, current_results):
    if not db_lama: return db_lama
    current_market = {res["Ticker"]: {"Harga": res["Harga"]} for res in current_results}
    
    updated_db = []
    for item in db_lama:
        if "RUNNING" in str(item.get("Status Akhir", "")) and item.get("Sinyal") == "BUY (VALIDATED)":
            ticker = item["Ticker"]
            if ticker in current_market:
                harga_live = current_market[ticker]["Harga"]
                harga_beli = item["Harga"]
                
                pnl_pct = ((harga_live - harga_beli) / harga_beli) * 100
                
                if harga_live <= item["SL"]: 
                    item["Status Akhir"] = f"HIT SL (RUGI {pnl_pct:.2f}%)"
                elif harga_live >= item["TP 2"]: 
                    item["Status Akhir"] = f"HIT TP 2 (MAX CUAN {pnl_pct:+.2f}%)"
                elif harga_live >= item["TP 1"]: 
                    item["Status Akhir"] = f"HIT TP 1 (CUAN {pnl_pct:+.2f}%)"
                else:
                    item["Status Akhir"] = f"RUNNING ({pnl_pct:+.2f}%)"
        updated_db.append(item)
    return updated_db

# ==========================================
# 5. EKSEKUTOR UTAMA
# ==========================================
if __name__ == "__main__":
    blacklist = load_blacklist()
    db_historis = load_db_screener()
    tanggal_hari_ini = datetime.now().strftime('%Y-%m-%d')
    live_results_for_tracker = []

    if MODE_OFFLINE:
        if db_historis:
            # --- KEMBALI KE PENGATURAN OTOMATIS: MENCARI TANGGAL PALING BARU ---
            tanggal_terakhir_di_db = max([item.get("Waktu Candle", "2000-01-01") for item in db_historis])
            print(f"⚡ Mode Offline Active: Mengambil data tanggal {tanggal_terakhir_di_db} dari database lokal...")
            
            raw_data = [item for item in db_historis if item.get("Waktu Candle") == tanggal_terakhir_di_db]
            for item in raw_data:
                if 'Score' not in item: item['Score'] = 99
                if 'Cuan_Raw' not in item: item['Cuan_Raw'] = 0.0
            
            live_results_for_tracker = raw_data
        else:
            print("⚠️ Database kosong. Ubah MODE_OFFLINE = False untuk download data pertama kali.")
            exit()

    else:
        list_tanggal = []
        if MODE_BACKTEST_RANGE:
            start_date = datetime.strptime(TANGGAL_AWAL_BACKTEST, "%Y-%m-%d")
            delta = datetime.now() - start_date
            list_tanggal = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(delta.days + 1) if (start_date + timedelta(days=i)).weekday() < 5]
        else:
            list_tanggal.append(tanggal_hari_ini)

        try:
            df_excel = pd.read_excel(FILE_EXCEL)
            col = next((c for c in df_excel.columns if 'kode' in str(c).lower() or 'ticker' in str(c).lower()), df_excel.columns[1])
            tickers_to_scan = [f"{str(k).strip().upper()}.JK" for k in df_excel[col].dropna() if f"{str(k).strip().upper()}.JK" not in blacklist]
        except Exception as e:
            print(f"❌ Error Excel: {e}"); exit()

        for idx_tgl, tgl in enumerate(list_tanggal):
            is_hari_terakhir = (idx_tgl == len(list_tanggal) - 1)
            is_backtest_tgl = not is_hari_terakhir
            waktu_screen_seragam = f"{tgl} 16:15:00" if is_backtest_tgl else datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            cache_tanggal_ini = {item["Ticker"]: item for item in db_historis if item.get("Waktu Candle") == tgl}
            if is_backtest_tgl and cache_tanggal_ini:
                print(f"⚡ [{idx_tgl+1}/{len(list_tanggal)}] Tanggal {tgl} -> MENGGUNAKAN DATA CACHE JSON (Instant!)")
            else:
                print(f"🚀 [{idx_tgl+1}/{len(list_tanggal)}] Tanggal {tgl} -> Mendownload Data via Yahoo Finance...")

            all_results = []
            with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
                futures = {executor.submit(get_smc_analysis, t, tgl, waktu_screen_seragam, is_backtest_tgl, cache_tanggal_ini): t for t in tickers_to_scan}
                for f in tqdm(as_completed(futures), total=len(tickers_to_scan), desc=f"Scanning {tgl}", disable=bool(is_backtest_tgl and cache_tanggal_ini)):
                    ticker, result, err = f.result()
                    if result: all_results.append(result)

            if is_hari_terakhir: live_results_for_tracker = all_results

            if all_results:
                df_temp = pd.DataFrame(all_results)
                df_best = df_temp[df_temp['Score'] <= MAX_PRIORITY_SCORE].sort_values(by=["Score", "Cuan_Raw"], ascending=[True, False])
                if not df_best.empty:
                    cols_to_drop = ['Cuan_Raw']
                    new_records = df_best.drop(columns=cols_to_drop, errors='ignore').to_dict(orient='records')
                    db_historis = [item for item in db_historis if item["Waktu Candle"] != tgl] + new_records

        print("\n🔄 Menjalankan Engine Tracker menggunakan harga live hari ini...")
        db_final_save = track_historical_signals(db_historis, live_results_for_tracker)
        save_db_screener(db_final_save)

    # ==========================================
    # 6. DRAW IMAGE TABLE & SEND VIA TELEGRAM (FUTURISTIC DARK MODE)
    # ==========================================
    if live_results_for_tracker:
        df_live = pd.DataFrame(live_results_for_tracker)
        df_live_filtered = df_live[df_live['Score'] <= MAX_PRIORITY_SCORE].sort_values(by=["Score", "Cuan_Raw"], ascending=[True, False])
        
        # --- PERBAIKAN: HAPUS DUPLIKAT SAHAM KEMBAR SEBELUM DIGAMBAR ---
        df_live_filtered = df_live_filtered.drop_duplicates(subset=['Ticker'], keep='last')
        
        waktu_sekarang = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        jam_sekarang = datetime.now().strftime('%H:%M:%S')
        tgl_report = list_tanggal[-1] if not MODE_OFFLINE else df_live_filtered['Waktu Candle'].iloc[0]
        
        bulan_indo = {
            "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
            "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
            "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
        }
        
        tgl_obj = datetime.strptime(tgl_report, "%Y-%m-%d")
        hari_indo = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
        hari_ini = hari_indo[tgl_obj.weekday()]
        
        t_parts = tgl_report.split('-')
        tgl_indo = f"{t_parts[2]} {bulan_indo[t_parts[1]]} {t_parts[0]}"
        
        caption_txt = f"<b>GC Logic Daily Report</b>\n📅 <i>{hari_ini}, {tgl_indo} | {jam_sekarang} WIB</i>"

        if not df_live_filtered.empty:
            df_visual = pd.DataFrame()
            df_visual['Ticker'] = df_live_filtered['Ticker']
            df_visual['Harga'] = df_live_filtered['Harga']
            df_visual['Sinyal'] = df_live_filtered['Sinyal']
            
            df_visual['TP 1 (%)'] = df_live_filtered.apply(lambda r: f"{r.get('TP 1','-')} ({r.get('TP 1(%)','-')})", axis=1)
            df_visual['TP 2 (%)'] = df_live_filtered.apply(lambda r: f"{r.get('TP 2','-')} ({r.get('TP 2(%)','-')})", axis=1)
            df_visual['SL (%)'] = df_live_filtered.apply(lambda r: f"{r.get('SL','-')} ({r.get('Risk(%)','-')})", axis=1)
            df_visual['RR Ratio'] = df_live_filtered['RR Ratio']
            
            entry_ranges = []
            for _, r in df_live_filtered.iterrows():
                if 'Harga' in r and 'SL' in r:
                    floor_entry = int(r['Harga'] * 0.985) if int(r['Harga'] * 0.985) > r['SL'] else int(r['SL'] * 1.01)
                    entry_ranges.append(f"{floor_entry} - {r['Harga']}")
                else:
                    entry_ranges.append("-")
            df_visual['Area Entry'] = entry_ranges
            
            kolom_order = ['Ticker', 'Harga', 'Sinyal', 'Area Entry', 'TP 1 (%)', 'TP 2 (%)', 'SL (%)', 'RR Ratio']
            df_visual = df_visual[kolom_order]
            
            fig, ax = plt.subplots(figsize=(12, len(df_visual) * 0.4 + 0.8))
            
            fig.patch.set_facecolor('#0b0f19') 
            ax.set_facecolor('#0b0f19')
            ax.axis('tight')
            ax.axis('off')
            
            tabel_plot = ax.table(cellText=df_visual.values, colLabels=df_visual.columns, cellLoc='center', loc='center')
            tabel_plot.auto_set_font_size(False)
            tabel_plot.set_fontsize(10)
            tabel_plot.scale(1.2, 1.6)
            
            for (row, col), cell in tabel_plot.get_celld().items():
                cell.set_edgecolor('#1e293b') 
                
                if row == 0:
                    cell.set_text_props(weight='bold', color='#00e5ff') 
                    cell.set_facecolor('#111827')
                else:
                    cell.set_text_props(color='#f3f4f6') 
                    if row % 2 == 0: 
                        cell.set_facecolor('#111827')
                    else:
                        cell.set_facecolor('#0b0f19')
                    
                    if "BUY" in str(df_visual.iloc[row-1]['Sinyal']): 
                        cell.set_facecolor('#064e3b') 
                        cell.set_text_props(color='#34d399', weight='bold') 
            
            plt.title("GC Logic - No Liquidity = No Trade, No Confirmation = No Open Position", 
                      fontsize=13, weight='bold', color='#ffffff', pad=5)
            
            widget_text = f"GC Logic Daily Report   |   {hari_ini}, {tgl_indo}   |   {jam_sekarang} WIB"
            ax.text(
                0.5, -0.01, widget_text, 
                transform=ax.transAxes, 
                color='#00e5ff', fontsize=9, weight='bold',
                ha='center', va='top',
                bbox=dict(facecolor='#111827', edgecolor='#1e293b', boxstyle='round,pad=0.5', alpha=0.9)
            )
            
            temp_img_name = "temp_screener_result.png"
            plt.savefig(temp_img_name, bbox_inches='tight', dpi=200, facecolor=fig.get_facecolor())
            plt.close()
            
            send_telegram_photo(temp_img_name, caption_text=caption_txt)
            
            if os.path.exists(temp_img_name):
                os.remove(temp_img_name)
        else:
            print("😴 Tidak ada data kriteria prioritas untuk di-generate ke gambar.")
    else:
        print("Kosong! Tidak ada hasil untuk digenerate.")