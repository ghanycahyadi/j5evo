import yfinance as yf
import pandas as pd
import numpy as np
from tqdm import tqdm
import os
import json
import logging
import math
import time 
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from tabulate import tabulate

# ==========================================
# 1. KONFIGURASI BOT & SENSITIVITAS
# ==========================================
# FILE_EXCEL = "Daftar Saham - 20260427.xlsx"
# BLACKLIST_FILE = "blacklist_saham.json"
# DB_SCREENER_FILE = "db_screener.json"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Gabungkan folder utama dengan nama file menggunakan os.path.join
FILE_EXCEL = os.path.join(BASE_DIR, "Daftar Saham - 20260427.xlsx")
BLACKLIST_FILE = os.path.join(BASE_DIR, "blacklist_saham.json")
DB_SCREENER_FILE = os.path.join(BASE_DIR, "db_screener.json")


# --- FITUR LOOPING MESIN WAKTU (MULTI-DATE BACKTEST) ---
MODE_BACKTEST_RANGE = False           # Set True untuk generate data dari tanggal awal sampai sekarang
TANGGAL_AWAL_BACKTEST = "2026-06-01"  # Format wajib YYYY-MM-DD

# --- SETTING ANTI-BLOCK (WAJIB KECIL) ---
MAX_WORKERS = 8  
DELAY_BETWEEN_TICKERS = 0.2 

MOMENTUM_MULTIPLIER = 1.8
MAX_PRIORITY_SCORE = 4  
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
# 3. MESIN ANALISIS SMC HISTORIS (WITH SMART CACHE)
# ==========================================
def get_smc_analysis(ticker, target_date, waktu_screen_seragam, is_backtest_tgl, cache_dict):
    try:
        # --- FITUR SMART CACHE CHECK ---
        # Jika data masa lalu (Backtest) sudah ada di JSON, jangan download lagi!
        if is_backtest_tgl and ticker in cache_dict:
            # Berikan penanda kecil kalau ini data dari Cache Lokal
            cached_data = cache_dict[ticker].copy()
            # Sinkronisasi Waktu Screen agar tetap rapi sesuai running saat ini
            cached_data["Waktu Screen"] = waktu_screen_seragam
            return ticker, cached_data, "CACHE_HIT"

        # Jeda napas hanya diaktifkan jika benar-benar mendownload data dari yfinance
        time.sleep(np.random.uniform(0.3, DELAY_BETWEEN_TICKERS))
        
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
            time.sleep(3)

        if df.empty or len(df) < 30: 
            return ticker, None, "Data Kosong"
            
        df.dropna(subset=['Open', 'High', 'Low', 'Close'], inplace=True)
        if isinstance(df.columns, pd.MultiIndex): df.columns = df.columns.droplevel(1)
        
        # --- POTONG DATA JIKA MENGGUNAKAN MODE BACKTEST ---
        if is_backtest_tgl:
            df['Tanggal_Str'] = df.index.strftime('%Y-%m-%d')
            df = df[df['Tanggal_Str'] <= target_date]
            df.drop(columns=['Tanggal_Str'], inplace=True)
            
            if df.empty or len(df) < 30:
                return ticker, None, "Kosong Pasca Slice"

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

        # --- ANALISIS STATUS ---
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

    current_market = {}
    for res in current_results:
        ticker = res["Ticker"]
        current_market[ticker] = {"Harga": res["Harga"]}

    updated_db = []
    for item in db_lama:
        if item.get("Status Akhir") == "RUNNING" and item.get("Sinyal") == "BUY (VALIDATED)":
            ticker = item["Ticker"]
            if ticker in current_market:
                harga_live = current_market[ticker]["Harga"]
                if harga_live <= item["SL"]:
                    item["Status Akhir"] = "HIT SL (RUGI)"
                elif harga_live >= item["TP 2"]:
                    item["Status Akhir"] = "HIT TP 2 (MAX CUAN)"
                elif harga_live >= item["TP 1"]:
                    item["Status Akhir"] = "HIT TP 1 (CUAN)"
        updated_db.append(item)
    return updated_db

# ==========================================
# 5. EKSEKUTOR UTAMA WITH SMART CACHING
# ==========================================
if __name__ == "__main__":
    blacklist = load_blacklist()
    db_historis = load_db_screener()
    
    tanggal_hari_ini = datetime.now().strftime('%Y-%m-%d')
    
    list_tanggal = []
    if MODE_BACKTEST_RANGE:
        start_date = datetime.strptime(TANGGAL_AWAL_BACKTEST, "%Y-%m-%d")
        end_date = datetime.now()
        delta = end_date - start_date
        
        for i in range(delta.days + 1):
            day = start_date + timedelta(days=i)
            if day.weekday() < 5:
                list_tanggal.append(day.strftime('%Y-%m-%d'))
        print(f"📅 Mode Multi-Date Backtest Aktif: {TANGGAL_AWAL_BACKTEST} s/d {tanggal_hari_ini} ({len(list_tanggal)} hari kerja)...")
    else:
        list_tanggal.append(tanggal_hari_ini)

    try:
        df_excel = pd.read_excel(FILE_EXCEL)
        col = next((c for c in df_excel.columns if 'kode' in str(c).lower() or 'ticker' in str(c).lower()), df_excel.columns[1])
        tickers_to_scan = [f"{str(k).strip().upper()}.JK" for k in df_excel[col].dropna() if f"{str(k).strip().upper()}.JK" not in blacklist]
    except Exception as e:
        print(f"❌ Error Excel: {e}"); exit()

    live_results_for_tracker = []

    # ==========================================
    # LOOPING BERJALAN DARI TANGGAL KE TANGGAL
    # ==========================================
    for idx_tgl, tgl in enumerate(list_tanggal):
        is_hari_terakhir = (tgl == tanggal_hari_ini)
        is_backtest_tgl = not is_hari_terakhir
        
        waktu_screen_seragam = f"{tgl} 16:15:00" if is_backtest_tgl else datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # --- MEMBUAT DICTIONARY CACHE LOKAL KHUSUS TANGGAL LOOPING SAAT INI ---
        # Mengelompokkan data JSON lama berdasarkan tanggal agar bisa dicocokkan instan
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

        if is_hari_terakhir:
            live_results_for_tracker = all_results

        if all_results:
            df_temp = pd.DataFrame(all_results)
            df_best = df_temp[df_temp['Score'] <= MAX_PRIORITY_SCORE].sort_values(by=["Score", "Cuan_Raw"], ascending=[True, False])
            
            if not df_best.empty:
                cols_to_drop = ['Score', 'Cuan_Raw', 'Chg(%)']
                new_records = df_best.drop(columns=cols_to_drop).to_dict(orient='records')
                
                # Bersihkan data lama pada tanggal bursa ini agar tidak menumpuk ganda
                db_historis = [item for item in db_historis if item["Waktu Candle"] != tgl]
                db_historis = db_historis + new_records

    # ==========================================
    # FINALISASI: JALANKAN LIVE TRACKER UNTUK DATA LALU
    # ==========================================
    print("\n🔄 Menjalankan Engine Tracker menggunakan harga live hari ini...")
    if not live_results_for_tracker:
        print("⚡ Mengambil data harga penutupan hari ini untuk sinkronisasi tracker...")
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(get_smc_analysis, t, tanggal_hari_ini, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), False, {}): t for t in tickers_to_scan}
            for f in as_completed(futures):
                _, result, _ = f.result()
                if result: live_results_for_tracker.append(result)

    # Update massal status 'RUNNING' hari-hari lalu berdasarkan harga penutupan hari ini
    db_final_save = track_historical_signals(db_historis, live_results_for_tracker)
    
    # Simpan hasil akhir akumulatif ke JSON
    save_db_screener(db_final_save)
    print(f"\n💾 DATABASE REKOR SELESAI! Total data historis tersimpan: {len(db_final_save)} data di 'db_screener.json'")