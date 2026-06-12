import yfinance as yf
import pandas as pd
import numpy as np
from tqdm import tqdm
import os
import json
import logging
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from tabulate import tabulate

import matplotlib.pyplot as plt
import requests

# ==========================================
# 1. KONFIGURASI & DATABASE KONGLOMERAT
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_EXCEL = os.path.join(BASE_DIR, "Daftar Saham - 20260427.xlsx") 
BLACKLIST_FILE = os.path.join(BASE_DIR, "blacklist_saham.json")
DB_JSON_FILE = os.path.join(BASE_DIR, "db_scalping.json")

# --- KONFIGURASI TELEGRAM ---
TELEGRAM_BOT_TOKEN = "8451549354:AAFjuU3pXifDSMsRgXKRJSCWxyM2sfIiNbg"
TELEGRAM_CHAT_ID = "8012930236"
SEND_TO_TELEGRAM = True

# --- FITUR SIMULASI PENGUMPUL DATA ---
# Ubah ke False jika ingin langsung jalan menarik data Live saat ini
MODE_SIMULASI = False  
LIST_JAM_SIMULASI = [
    "09:15", "09:45", "10:15", "10:45", "11:15", "11:45", 
    "13:45", "14:15", "14:45", "15:15", "15:45", "16:15"
]

MAX_WORKERS = 8 
MIN_TURNOVER = 500_000_000 
MOMENTUM_MULTIPLIER = 1.5

logging.getLogger('yfinance').setLevel(logging.CRITICAL)

KONGLO_MAP = {
    "INDF": {"Group": "Salim Group", "Owner": "Anthoni Salim"},
    "ICBP": {"Group": "Salim Group", "Owner": "Anthoni Salim"},
    "SIMP": {"Group": "Salim Group", "Owner": "Anthoni Salim"},
    "LSIP": {"Group": "Salim Group", "Owner": "Anthoni Salim"},
    "IMAS": {"Group": "Salim Group", "Owner": "Anthoni Salim"},
    "DNET": {"Group": "Salim Group", "Owner": "Anthoni Salim"},
    "BBCA": {"Group": "Djarum Group", "Owner": "Hartono Brothers"},
    "TOWR": {"Group": "Djarum Group", "Owner": "Hartono Brothers"},
    "BELI": {"Group": "Djarum Group", "Owner": "Hartono Brothers"},
    "ASII": {"Group": "Astra Group", "Owner": "Jardine / Soeryadjaya"},
    "UNTR": {"Group": "Astra Group", "Owner": "Jardine / Soeryadjaya"},
    "AUTO": {"Group": "Astra Group", "Owner": "Jardine / Soeryadjaya"},
    "BSDE": {"Group": "Sinar Mas Group", "Owner": "Widjaja Family"},
    "INKP": {"Group": "Sinar Mas Group", "Owner": "Widjaja Family"},
    "TKIM": {"Group": "Sinar Mas Group", "Owner": "Widjaja Family"},
    "BUMI": {"Group": "Bakrie Group", "Owner": "Aburizal Bakrie"},
    "BRMS": {"Group": "Bakrie Group", "Owner": "Aburizal Bakrie"},
    "ENRG": {"Group": "Bakrie Group", "Owner": "Aburizal Bakrie"},
    "BRPT": {"Group": "Barito Group", "Owner": "Prajogo Pangestu"},
    "TPIA": {"Group": "Barito Group", "Owner": "Prajogo Pangestu"},
    "BREN": {"Group": "Barito Group", "Owner": "Prajogo Pangestu"},
    "LPKR": {"Group": "Lippo Group", "Owner": "Riady Family"},
    "MLPL": {"Group": "Lippo Group", "Owner": "Riady Family"},
    "MNCN": {"Group": "MNC Group", "Owner": "Hary Tanoesoedibjo"},
    "BMTR": {"Group": "MNC Group", "Owner": "Hary Tanoesoedibjo"},
    "SRTG": {"Group": "Saratoga Group", "Owner": "Sandiaga Uno / Edwin Soeryadjaya"},
    "MDKA": {"Group": "Saratoga Group", "Owner": "Sandiaga Uno / Edwin Soeryadjaya"},
    "EMTK": {"Group": "Emtek Group", "Owner": "Sariaatmadja Family"},
    "SCMA": {"Group": "Emtek Group", "Owner": "Sariaatmadja Family"},
    "BUKA": {"Group": "Emtek Group", "Owner": "Sariaatmadja Family"},
    "MAYA": {"Group": "Mayapada Group", "Owner": "Tahir"},
    "SRAJ": {"Group": "Mayapada Group", "Owner": "Tahir"}
}

# ==========================================
# 2. FUNGSI PEMBANTU
# ==========================================
def load_blacklist():
    if os.path.exists(BLACKLIST_FILE):
        try:
            with open(BLACKLIST_FILE, 'r') as f: return set(json.load(f))
        except: return set()
    return set()

def load_db():
    if os.path.exists(DB_JSON_FILE):
        try:
            with open(DB_JSON_FILE, 'r') as f: return json.load(f)
        except: return []
    return []

def save_db(data):
    with open(DB_JSON_FILE, 'w') as f: json.dump(data, f, indent=4)

def check_sweep(df, max_bars=5):
    recent_bars = df.tail(max_bars)
    for i in range(1, len(recent_bars) + 1):
        idx_now = len(df) - i
        if idx_now < 20: continue 
        current = df.iloc[idx_now]
        prev_low = df['Low'].iloc[idx_now-20:idx_now].min()
        body = abs(current['Close'] - current['Open'])
        lower_wick = min(current['Close'], current['Open']) - current['Low']
        if (current['Low'] < prev_low) and (current['Close'] > prev_low) and (lower_wick > body):
            return True, i  
    return False, 0

def track_scalping_signals(db_lama, current_market_prices):
    if not db_lama: return db_lama
    updated_db = []
    for item in db_lama:
        if item.get("Status Akhir") == "RUNNING" and item.get("Sinyal") == "BUY (VALIDATED)":
            ticker = item["Ticker"]
            if ticker in current_market_prices:
                harga_live = current_market_prices[ticker]
                if harga_live <= item["SL"]: item["Status Akhir"] = "HIT SL (RUGI)"
                elif harga_live >= item["TP 2"]: item["Status Akhir"] = "HIT TP 2 (MAX CUAN)"
                elif harga_live >= item["TP 1"]: item["Status Akhir"] = "HIT TP 1 (CUAN)"
        updated_db.append(item)
    return updated_db

def send_telegram_image(df, bot_token, chat_id):
    if df.empty: return
    
    # --- 1. Persiapan Data Waktu & Tanggal (Format Indonesia) ---
    wib_now = datetime.now()
    jam_sekarang = wib_now.strftime('%H:%M:%S')
    tgl_sekarang = wib_now.strftime('%Y-%m-%d')
    
    bulan_indo = {
        "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
        "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
        "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
    }
    hari_indo = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
    hari_ini = hari_indo[wib_now.weekday()]
    t_parts = tgl_sekarang.split('-')
    tgl_indo = f"{t_parts[2]} {bulan_indo[t_parts[1]]} {t_parts[0]}"

    # --- 2. Setup Canvas Futuristic Dark Mode ---
    # Ukuran figur & padding disesuaikan persis dengan screener.py (+0.8)
    fig, ax = plt.subplots(figsize=(12, len(df) * 0.4 + 0.8))
    fig.patch.set_facecolor('#0b0f19') 
    ax.set_facecolor('#0b0f19')
    ax.axis('tight')
    ax.axis('off')
    
    # --- 3. Render Tabel ---
    table = ax.table(cellText=df.values, colLabels=df.columns, loc='center', cellLoc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1.2, 1.6)
    
    # --- 4. Styling Sel Tabel (Header & Body) ---
    for (row, col), cell in table.get_celld().items():
        cell.set_edgecolor('#1e293b') 
        
        if row == 0:
            # Styling Header Cyan
            cell.set_text_props(weight='bold', color='#00e5ff') 
            cell.set_facecolor('#111827')
        else:
            # Styling Baris Data Default (Zebra cross)
            cell.set_text_props(color='#f3f4f6') 
            if row % 2 == 0: 
                cell.set_facecolor('#111827')
            else:
                cell.set_facecolor('#0b0f19')
            
            # --- PERBAIKAN: Highlight HANYA pada sel di kolom "Sinyal" ---
            col_name = df.columns[col]
            if col_name == 'Sinyal' and "BUY" in str(df.iloc[row-1].get('Sinyal', '')):
                cell.set_facecolor('#064e3b') 
                cell.set_text_props(color='#34d399', weight='bold')
                
    # --- 5. Tambah Judul & Footer Widget ---
    # Pad disamakan dengan screener.py (pad=5)
    plt.title("GC Logic - No Liquidity = No Trade, No Confirmation = No Open Position", 
              fontsize=13, weight='bold', color='#ffffff', pad=5)
    
    widget_text = f"Live Scalping Radar   |   {hari_ini}, {tgl_indo}   |   {jam_sekarang} WIB"
    ax.text(
        0.5, -0.01, widget_text, 
        transform=ax.transAxes, 
        color='#00e5ff', fontsize=9, weight='bold',
        ha='center', va='top',
        bbox=dict(facecolor='#111827', edgecolor='#1e293b', boxstyle='round,pad=0.5', alpha=0.9)
    )
            
    # --- 6. Simpan & Kirim ke Telegram ---
    image_path = os.path.join(BASE_DIR, "telegram_table.png")
    # DPI diubah ke 200 agar resolusinya sama persis dengan screener.py
    plt.savefig(image_path, bbox_inches="tight", dpi=200, facecolor=fig.get_facecolor()) 
    plt.close()

    url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
    caption_text = f"🔥 <b>GHANY ALGO SCALPING UPDATE</b>\n📅 <i>{hari_ini}, {tgl_indo} | {jam_sekarang} WIB</i>\n🎯 Total Sinyal: {len(df)} Saham"
    
    try:
        with open(image_path, 'rb') as photo:
            requests.post(url, data={'chat_id': chat_id, 'caption': caption_text, 'parse_mode': 'HTML'}, files={'photo': photo})
    except Exception as e: 
        print(f"Gagal mengirim ke Telegram: {e}")

# ==========================================
# 3. CORE ENGINE
# ==========================================
def get_intraday_analysis(ticker, target_times):
    try:
        time.sleep(np.random.uniform(0.1, 0.4))
        saham_obj = yf.Ticker(ticker)
        base_ticker = ticker.replace(".JK", "")
        konglo_info = KONGLO_MAP.get(base_ticker, {"Group": "Independen", "Owner": "-"})
        nama_group = konglo_info["Group"]
        pemilik = konglo_info["Owner"]
        sector_name = saham_obj.info.get('sector', 'General')

        df_h1 = saham_obj.history(period="1mo", interval="1h", auto_adjust=True)
        df_m15 = saham_obj.history(period="5d", interval="15m", auto_adjust=True)
        
        if df_h1.empty or df_m15.empty or len(df_h1) < 30 or len(df_m15) < 30: return ticker, [], None, "Data Minim"

        live_price = float(df_h1['Close'].iloc[-1])
        if isinstance(df_h1.columns, pd.MultiIndex): df_h1.columns = df_h1.columns.droplevel(1)
        if isinstance(df_m15.columns, pd.MultiIndex): df_m15.columns = df_m15.columns.droplevel(1)

        hasil_ticker = []
        for target_time in target_times:
            df_h1_temp = df_h1.copy(); df_m15_temp = df_m15.copy()
            if target_time:
                try:
                    idx_h1 = df_h1_temp.index.tz_convert('Asia/Jakarta') if df_h1_temp.index.tz is not None else df_h1_temp.index
                    idx_m15 = df_m15_temp.index.tz_convert('Asia/Jakarta') if df_m15_temp.index.tz is not None else df_m15_temp.index
                    df_h1_temp = df_h1_temp[idx_h1.strftime('%H:%M') <= target_time]
                    df_m15_temp = df_m15_temp[idx_m15.strftime('%H:%M') <= target_time]
                except Exception: pass
                
            if df_h1_temp.empty or df_m15_temp.empty or len(df_h1_temp) < 20 or len(df_m15_temp) < 30: continue

            last_volume_h1 = float(df_h1_temp['Volume'].iloc[-1])
            last_price = float(df_h1_temp['Close'].iloc[-1])
            turnover = last_volume_h1 * last_price
            
            if turnover < MIN_TURNOVER: continue

            has_sweep_h1, dist_h1 = check_sweep(df_h1_temp, max_bars=2)
            has_sweep_m15, dist_m15 = check_sweep(df_m15_temp, max_bars=3)

            curr_m15 = df_m15_temp.iloc[-1]
            open_m15 = float(curr_m15['Open']); close_m15 = float(curr_m15['Close']); vol_m15 = float(curr_m15['Volume']) 
            
            body_m15 = abs(close_m15 - open_m15)
            avg_body_m15 = abs(df_m15_temp['Close'] - df_m15_temp['Open']).tail(20).mean()
            avg_vol_m15 = df_m15_temp['Volume'].tail(20).mean()
            
            is_momentum = (close_m15 > open_m15) and (body_m15 > (avg_body_m15 * MOMENTUM_MULTIPLIER)) and (vol_m15 > avg_vol_m15)

            pola = "-"
            score = 99
            if has_sweep_h1 and has_sweep_m15: pola = "DUAL SWEEP"; score = 1
            elif has_sweep_h1: pola = "H1 SWEEP"; score = 2
            elif has_sweep_m15: pola = "M15 SWEEP"; score = 3
            elif is_momentum: pola = "MOMENTUM"; score = 4

            if score > 4: continue

            sinyal = "Tunggu Validasi"
            if last_price > open_m15: sinyal = "BUY (VALIDATED)"

            day_change = ((last_price - df_h1_temp['Close'].iloc[0]) / df_h1_temp['Close'].iloc[0]) * 100
            
            entry_bawah = int((close_m15 + open_m15) / 2)
            if entry_bawah >= int(last_price): entry_bawah = int(last_price * 0.99)
            
            tp1 = int(df_m15_temp['High'].tail(20).max())
            if tp1 <= int(last_price): tp1 = int(last_price * 1.02)
            tp2 = int(df_m15_temp['High'].tail(50).max())
            if tp2 <= tp1: tp2 = int(tp1 * 1.02) 
            stop_loss = int(df_m15_temp['Low'].tail(10).min())
            if stop_loss >= int(last_price): stop_loss = int(last_price * 0.98)

            cuan1 = ((tp1 - last_price) / last_price) * 100
            cuan2 = ((tp2 - last_price) / last_price) * 100
            potensi_risiko = ((stop_loss - last_price) / last_price) * 100

            last_ts = df_m15_temp.index[-1]
            if last_ts.tzinfo is not None: last_ts = last_ts.tz_convert('Asia/Jakarta').tz_localize(None)
            
            waktu_scan_label = target_time if target_time else last_ts.strftime('%H:%M:%S')

            hasil_ticker.append({
                "Waktu Scan": waktu_scan_label,
                "Ticker": base_ticker,
                "Group": nama_group,
                "Pemilik": pemilik,
                "Sector": sector_name,
                "Time": last_ts.strftime('%H:%M'),
                "Pola": pola,
                "Sinyal": sinyal,
                "Status Akhir": "RUNNING",
                "Harga": int(last_price),
                "Chg%": f"{day_change:.2f}%",
                "Area Entry": f"{entry_bawah} - {int(last_price)}",
                "TP 1": tp1, "Cuan 1": f"+{cuan1:.2f}%",
                "TP 2": tp2, "Cuan 2": f"+{cuan2:.2f}%",
                "SL": stop_loss, "Risk": f"{potensi_risiko:.2f}%",
                "Score": score, "ChangeRaw": day_change
            })
        return ticker, hasil_ticker, live_price, None
    except Exception as e: return ticker, [], None, f"Err: {str(e)}"

# ==========================================
# 4. MAIN RUNNER
# ==========================================
if __name__ == "__main__":
    blacklist = load_blacklist()
    wib_now = datetime.now()
    tanggal_sekarang_str = wib_now.strftime('%Y-%m-%d')
    target_times = LIST_JAM_SIMULASI if MODE_SIMULASI else [None]

    print(f"GHANY ALGO SCALPING | MODE: {'SIMULASI (12 Timeframes)' if MODE_SIMULASI else 'LIVE'} | {wib_now.strftime('%d %b %Y')}")
    
    if not os.path.exists(FILE_EXCEL): print(f"ERROR: File '{FILE_EXCEL}' tidak ditemukan."); exit()

    try:
        df_excel = pd.read_excel(FILE_EXCEL)
        col_kode = next(c for c in df_excel.columns if 'kode' in str(c).lower() or 'ticker' in str(c).lower())
        stock_data = df_excel[col_kode].dropna().astype(str).tolist()
        tickers_info = [f"{s.strip().upper()}.JK" for s in stock_data if len(s.strip()) >= 4]
        tickers_info = [t for t in list(set(tickers_info)) if t not in blacklist]
        print(f"Memproses {len(tickers_info)} saham berpotensi...")
    except Exception as e: print(f"Error saat membaca Excel: {e}"); exit()

    results = []; current_market_prices = {}
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(get_intraday_analysis, t, target_times): t for t in tickers_info}
        for f in tqdm(as_completed(futures), total=len(tickers_info), desc="Scanning & Slicing"):
            ticker, list_res, live_price, err = f.result()
            if live_price is not None: current_market_prices[ticker.replace(".JK", "")] = live_price
            if list_res: results.extend(list_res)

    if results:
        df_res = pd.DataFrame(results)
        df_final = df_res.sort_values(by=["Waktu Scan", "Score", "ChangeRaw"], ascending=[True, True, False]).drop(columns=["Score", "ChangeRaw"])
        
        new_records = df_final.to_dict(orient='records')
        for rec in new_records: rec["Tanggal"] = tanggal_sekarang_str

        db_lama = load_db()
        if MODE_SIMULASI:
            db_lama = [item for item in db_lama if item.get("Tanggal") != tanggal_sekarang_str]
        else:
            db_lama = [item for item in db_lama if item.get("Tanggal") == tanggal_sekarang_str]
            current_time_str = wib_now.strftime('%H:%M:%S')
            db_lama = [item for item in db_lama if item.get("Waktu Scan") != current_time_str]
            
        db_combined = db_lama + new_records
        db_final_save = track_scalping_signals(db_combined, current_market_prices)
        save_db(db_final_save)

        print("\n" + "="*160)
        print(f"HASIL SAMPEL DATA SCALPING ({len(results)} Sinyal Ditemukan)")
        print("="*160)
        print(tabulate(df_final, headers='keys', tablefmt='simple', showindex=False, stralign="center", numalign="center"))
        
        # --- BLOK PENGIRIMAN TELEGRAM ---
        # --- BLOK PENGIRIMAN TELEGRAM ---
        if SEND_TO_TELEGRAM and not MODE_SIMULASI:
            print("\nMempersiapkan tabel gambar untuk Telegram...")
            
            # 1. Ambil kolom utama
            df_telegram = df_final[['Waktu Scan', 'Ticker', 'Pola', 'Sinyal', 'Harga']].copy()
            
            # 2. Format ulang kolom TP dan SL agar ada (%) di headernya
            df_telegram['TP 1 (%)'] = df_final['TP 1'].astype(str) + " (" + df_final['Cuan 1'] + ")"
            df_telegram['TP 2 (%)'] = df_final['TP 2'].astype(str) + " (" + df_final['Cuan 2'] + ")"
            df_telegram['SL (%)'] = df_final['SL'].astype(str) + " (" + df_final['Risk'] + ")"
            
            # 3. Hitung otomatis RR Ratio
            def hitung_rr(row):
                try:
                    harga = float(row['Harga'])
                    tp1 = float(row['TP 1'])
                    sl = float(row['SL'])
                    
                    risk = harga - sl
                    reward = tp1 - harga
                    
                    if risk > 0:
                        return f"1 : {round(reward / risk, 1)}"
                    return "-"
                except:
                    return "-"
                    
            df_telegram['RR Ratio'] = df_final.apply(hitung_rr, axis=1)
            
            send_telegram_image(df_telegram, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
            print("✅ Berhasil terkirim ke Telegram GC Saham Bot!")
            
        print(f"Database Web berhasil menabung {len(new_records)} baris data.")
    else:
        print("\nMarket sedang sepi atau saham tidak likuid. Tidak ada sweep atau momentum tervalidasi.")