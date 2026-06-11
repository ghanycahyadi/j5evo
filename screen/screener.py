import yfinance as yf
import pandas as pd
import numpy as np
from tqdm import tqdm
import os
import json
import logging
import math
import time 
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from tabulate import tabulate

# ==========================================
# 1. KONFIGURASI BOT & SENSITIVITAS
# ==========================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_EXCEL = os.path.join(SCRIPT_DIR, "Daftar Saham - 20260427.xlsx")
# FILE_EXCEL = os.path.join(os.path.dirname(SCRIPT_DIR), "Daftar Saham - 20260427.xlsx")
BLACKLIST_FILE = os.path.join(SCRIPT_DIR, "blacklist_saham.json")
DB_SCREENER_FILE = os.path.join(SCRIPT_DIR, "db_screener.json")  # File database JSON utama



# --- SETTING ANTI-BLOCK (WAJIB KECIL) ---
MAX_WORKERS = 8  
DELAY_BETWEEN_TICKERS = 0.2 

MOMENTUM_MULTIPLIER = 1.8
MAX_PRIORITY_SCORE = 4  # Loloskan 'Tunggu Validasi' (Score 4) sebagai Watchlist
MAX_RISK_TOLERANCE = -10.0 

logging.getLogger('yfinance').setLevel(logging.CRITICAL)

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

def save_blacklist(blacklist):
    with open(BLACKLIST_FILE, 'w') as f:
        json.dump(list(blacklist), f)

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

# ==========================================
# 3. MESIN ANALISIS SMC (STABLE & ANTI-BLOCK)
# ==========================================
def get_smc_analysis(ticker, waktu_screen_seragam):
    try:
        time.sleep(np.random.uniform(0.5, DELAY_BETWEEN_TICKERS))
        
        saham_obj = yf.Ticker(ticker)
        df = pd.DataFrame()
        
        sektor = "-"
        try:
            sektor = saham_obj.info.get('sector', '-')
        except: pass
        
        for attempt in range(3):
            try:
                df = saham_obj.history(period="1y", interval="1d", auto_adjust=True)
                if not df.empty: break
            except: pass
            time.sleep(5)

        if df.empty or len(df) < 30: 
            return ticker, None, "Data Kosong"
            
        df.dropna(subset=['Open', 'High', 'Low', 'Close'], inplace=True)
        if isinstance(df.columns, pd.MultiIndex): df.columns = df.columns.droplevel(1)
        
        last_price = float(df['Close'].iloc[-1])
        if last_price <= 50: return ticker, None, "Gocap"

        # --- PERHITUNGAN STRUKTUR ---
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

        if trend == 0 or not idm_price:
            return ticker, None, "Sideways"

        # --- TARGET & RISIKO ---
        tp1 = float(df['High'].tail(10).max())
        if tp1 <= last_price: tp1 = last_price * 1.05
        tp2 = struct_h if struct_h > tp1 else tp1 * 1.05
        stop_loss = struct_l 

        cuan1 = ((tp1 - last_price) / last_price) * 100
        risiko_persen = ((stop_loss - last_price) / last_price) * 100

        # --- ANALISIS STATUS & VALIDASI OTOMATIS ---
        status_smc, rekomendasi, score = "HARGA > IDM", "Tunggu Validasi", 5
        last_low = float(df['Low'].iloc[-1])
        last_open = float(df['Open'].iloc[-1])
        prev_close = float(df['Close'].iloc[-2]) if len(df) > 1 else last_price
        
        if trend == 1:
            if last_low < idm_price:
                if last_price > idm_price and last_price > last_open:
                    status_smc = "SWEEP VALIDATED (ENTRY)"
                    rekomendasi = "BUY (VALIDATED)"
                    score = 1  
                else:
                    status_smc = "SWEEP BULLISH"
                    rekomendasi = "Tunggu Validasi"
                    score = 4  
        
        if risiko_persen < MAX_RISK_TOLERANCE:
            rekomendasi, score = "RISIKO TINGGI", 6
        if cuan1 <= 1.0:
            rekomendasi, score = "HARGA DI PUCUK", 6

        change_today = 0
        if len(df) > 1:
            change_today = ((last_price - prev_close) / prev_close) * 100

        waktu_data_terakhir = df.index[-1].strftime('%Y-%m-%d')

        return ticker, {
            "Waktu Screen": waktu_screen_seragam,  # Menggunakan waktu seragam kunci awal
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
            "Status Akhir": "RUNNING" # Status bawaan untuk transaksi baru
        }, None

    except Exception: return ticker, None, "Err"

# ==========================================
# 4. ENGINE TRACKER HISTORIS (TP / SL CHECKER)
# ==========================================
def track_historical_signals(db_lama, current_results):
    """Mengecek posisi aktif (RUNNING) dari hari sebelumnya apakah sudah hit TP/SL berdasarkan data hari ini."""
    if not db_lama:
        return db_lama

    # Buat mapping harga High & Low hari ini untuk mempermudah pengecekan cepat
    current_market = {}
    for res in current_results:
        ticker = res["Ticker"]
        # Kalkulasi balik High & Low live dari data screening hari ini
        current_market[ticker] = {
            "Harga": res["Harga"],
            "Chg": res["Chg(%)"]
        }

    updated_db = []
    for item in db_lama:
        # Kita hanya track item yg bertanda 'RUNNING' dan sinyalnya 'BUY (VALIDATED)'
        if item.get("Status Akhir") == "RUNNING" and item.get("Sinyal") == "BUY (VALIDATED)":
            ticker = item["Ticker"]
            
            # Ambil data pergerakan hari ini jika emiten terdeteksi
            if ticker in current_market:
                harga_live = current_market[ticker]["Harga"]
                sl_level = item["SL"]
                tp1_level = item["TP 1"]
                tp2_level = item["TP 2"]
                
                # Cek Kondisi Eksekusi
                if harga_live <= sl_level:
                    item["Status Akhir"] = "HIT SL (RUGI)"
                elif harga_live >= tp2_level:
                    item["Status Akhir"] = "HIT TP 2 (MAX CUAN)"
                elif harga_live >= tp1_level:
                    item["Status Akhir"] = "HIT TP 1 (CUAN)"
        
        updated_db.append(item)
    
    return updated_db

# ==========================================
# 5. EKSEKUTOR UTAMA
# ==========================================
if __name__ == "__main__":
    blacklist = load_blacklist()
    db_historis = load_db_screener()
    
    # KUNCI WAKTU SCREEN DI AWAL AGAR SAMA RATU UNTUK SEMUA TICKER
    waktu_run_sekarang = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    print(f"GHANY ALGO | SCREEN & TRACKER ACTIVE | {waktu_run_sekarang}")
    
    try:
        df_excel = pd.read_excel(FILE_EXCEL)
        col = next((c for c in df_excel.columns if 'kode' in str(c).lower() or 'ticker' in str(c).lower()), df_excel.columns[1])
        tickers_to_scan = [f"{str(k).strip().upper()}.JK" for k in df_excel[col].dropna() if f"{str(k).strip().upper()}.JK" not in blacklist]
        print(f"🔍 Total scan: {len(tickers_to_scan)} saham...")
    except Exception as e:
        print(f"❌ Error Excel: {e}"); exit()

    all_results, new_errors = [], set()

    # Oper parameter waktu_run_sekarang ke dalam executor loop
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(get_smc_analysis, t, waktu_run_sekarang): t for t in tickers_to_scan}
        for f in tqdm(as_completed(futures), total=len(tickers_to_scan), desc="Scanning"):
            ticker, result, err = f.result()
            if result: all_results.append(result)
            if err == "Data Kosong": new_errors.add(ticker)

    if all_results:
        df = pd.DataFrame(all_results)
        
        # --- INFO SEKTOR TERPANAS ---
        df_sektor_valid = df[df['Sektor'] != "-"]
        if not df_sektor_valid.empty:
            rata_rata_sektor = df_sektor_valid.groupby('Sektor')['Chg(%)'].mean().reset_index()
            sektor_terbaik = rata_rata_sektor.sort_values(by='Chg(%)', ascending=False).iloc[0]
            print("\n" + "="*80)
            print(f"🌟 SEKTOR TERPANAS HARI INI: {sektor_terbaik['Sektor'].upper()} (Rata-rata Kenaikan: {sektor_terbaik['Chg(%)']:.2f}%)")
            print("="*80 + "\n")

        # --- SELEKSI HASIL TERBAIK SESUAI PRIORITAS ---
        df_best = df[df['Score'] <= MAX_PRIORITY_SCORE].sort_values(by=["Score", "Cuan_Raw"], ascending=[True, False])
        
        if not df_best.empty:
            cols_to_drop = ['Score', 'Cuan_Raw', 'Chg(%)'] 
            df_display = df_best.drop(columns=cols_to_drop)
            
            # 1. Cetak Ringkasan Live di Terminal
            print(tabulate(df_display, headers='keys', tablefmt='simple', showindex=False, stralign="center", numalign="center"))
            
            # 2. Ambil data baru dalam format List of Dict
            new_records = df_display.to_dict(orient='records')
            
            # 3. Jalankan Engine Tracker: Update data-data hari lalu berdasarkan pergerakan harga hari ini
            db_terupdate = track_historical_signals(db_historis, all_results)
            
            # 4. Append/Gabungkan data baru hari ini ke dalam database historis
            # Agar data tidak duplikat jika di-run berkali-kali di hari yang sama, kita bisa filter data hari ini
            tanggal_hari_ini = datetime.now().strftime('%Y-%m-%d')
            db_bersih = [item for item in db_terupdate if item["Waktu Candle"] != tanggal_hari_ini]
            
            # Gabungkan log lama + data fresh hari ini
            db_final_save = db_bersih + new_records
            
            # 5. Simpan permanen ke db_screener.json
            save_db_screener(db_final_save)
            print(f"\n💾 Database Terupdate! Total riwayat tersimpan: {len(db_final_save)} data di 'db_screener.json'")
            
        else:
            print("\n☕ Market sedang tidak kondusif untuk pola SMC harian hari ini.")
    else:
        print("\n❌ Gagal menarik data. Pastikan koneksi internet aktif.")
