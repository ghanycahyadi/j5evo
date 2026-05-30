/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Zap, Gauge, DollarSign, CloudLightning} from "lucide-react";

export default function EvCalculator() {
  const [speed, setSpeed] = useState<number>(60); // km/h
  const [wheelSize, setWheelSize] = useState<number>(18);
  const [acOn, setAcOn] = useState<boolean>(true);
  const [temp, setTemp] = useState<number>(31); // Celsius (Standard Indo temperature)

  // JAECOO J5 EV constants
  const BATTERY_KWH = 61.2; // 61.2 kWh capacity
  const BASE_EFFICIENCY = 14.5; // kWh per 100 km at neutral 60km/h index

  // Simple, realistic EV range & costs physics model
  const calculateMetrics = () => {
    let efficiencyModifier = 1.0;

    // AC Climate control impact in Hot Indonesian summer (approx 8-15% increase)
    if (acOn) {
      if (temp > 30) efficiencyModifier += 0.12;
      else efficiencyModifier += 0.08;
    }

    // Wheel size impact (larger wheels = more friction/drag)
    if (wheelSize === 19) {
      efficiencyModifier += 0.04;
    }

    // Speed drag curve impact
    if (speed < 40) {
      // lower speeds but stop & go friction
      efficiencyModifier += 0.05;
    } else if (speed > 80 && speed <= 100) {
      // Wind aerodynamics resistance
      efficiencyModifier += 0.22;
    } else if (speed > 100) {
      efficiencyModifier += 0.42;
    }

    const netEfficiency = BASE_EFFICIENCY * efficiencyModifier; // kWh / 100km
    const estimatedRange = Math.round((BATTERY_KWH / netEfficiency) * 100);

    // Cost calculations
    // Indonesian PLN Tariff for Home Charging 3.500 VA+ is approx Rp 1.699 per kWh
    const plnRateKey = 1699;
    const chargeProgressCost = Math.round(BATTERY_KWH * plnRateKey);

    // Gasoline premium equivalency challenge
    // Gasoline SUV uses approx 1 Litre premium fuel / 11 km
    // Pertamax price today: Rp 13.500/litre
    const benzCostPerKm = 13500 / 11;
    const evCostPerKm = (plnRateKey * netEfficiency) / 100;
    const costSavingPer10K_KM = Math.round((benzCostPerKm - evCostPerKm) * 10000);

    return {
      range: estimatedRange,
      efficiency: parseFloat(netEfficiency.toFixed(1)),
      fullChargeCost: chargeProgressCost,
      saving: costSavingPer10K_KM,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="bg-gradient-to-br from-[#0c2e2e] to-[#041a1a] text-white rounded-3xl p-6 md:p-8 border border-teal-500/25 shadow-2xl relative overflow-hidden">
      <div className="absolute right-0 top-0 -mr-16 -mt-16 w-52 h-52 bg-teal-500/10 rounded-full blur-3xl"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
        <div>
          <h3 className="font-sans font-bold text-xl md:text-2xl text-teal-100">
            Kalkulator Range & Efisiensi J5 EV
          </h3>
          <p className="text-xs text-teal-400 font-mono">
            Uji interaktif performa & penghematan JAECOO J5 EV berdasarkan kondisi mengemudi Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Speed Slider */}
          <div className="bg-[#0b2424] p-4 rounded-xl border border-teal-900/40">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-teal-200">Kecepatan Rata-rata</label>
              <span className="text-lg font-bold text-cyan-400 font-mono">{speed} km/h</span>
            </div>
            <input
              type="range"
              min="30"
              max="130"
              step="5"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full h-2 bg-teal-950 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-teal-500 font-mono mt-1">
              <span>30 km/h (Macet)</span>
              <span>80 km/h (Tol)</span>
              <span>130 km/h (Maks)</span>
            </div>
          </div>

          {/* AC Climate Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* temperature */}
            <div className="bg-[#0b2424] p-4 rounded-xl border border-teal-900/40">
              <label className="text-xs font-medium text-teal-300 block mb-2">Suhu Udara Luar</label>
              <div className="flex gap-2">
                {[26, 31, 36].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemp(t)}
                    className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition ${
                      temp === t
                        ? "bg-teal-500 text-slate-950"
                        : "bg-teal-950/50 text-teal-400 border border-teal-900/50 hover:bg-teal-900/30"
                    }`}
                  >
                    {t}°C
                  </button>
                ))}
              </div>
            </div>

            {/* AC Switch */}
            <div className="bg-[#0b2424] p-4 rounded-xl border border-teal-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-teal-300 block">Climate Control (AC)</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {acOn ? "Suhu Kabin Dingin" : "AC Dinonaktifkan"}
                </span>
              </div>
              <button
                onClick={() => setAcOn(!acOn)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none focus:outline-none ${
                  acOn ? "bg-cyan-500" : "bg-teal-950 border border-teal-800"
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${
                    acOn ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Wheel Size selector */}
          <div className="bg-[#0b2424] p-4 rounded-xl border border-teal-900/40">
            <span className="text-xs font-medium text-teal-350 block mb-2">Ukuran Velg Kendaraan</span>
            <div className="flex gap-3">
              {[18, 19].map((w) => (
                <button
                  key={w}
                  onClick={() => setWheelSize(w)}
                  className={`flex-1 py-2 rounded-lg font-mono font-bold transition text-xs flex items-center justify-center gap-1.5 ${
                    wheelSize === w
                      ? "bg-teal-500 text-slate-950 shadow-md"
                      : "bg-teal-950/50 text-teal-400 border border-teal-900/50 hover:bg-teal-900/30"
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  {w} Inci Premium Alloys
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Metrics Panel */}
        <div className="bg-slate-950/50 border border-teal-500/20 p-6 rounded-2xl space-y-6">
          <div className="text-center">
            <span className="text-xs text-teal-400 font-mono uppercase tracking-widest block mb-1">
              ESTIMASI RANGE J5 EV
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-300 to-emerald-400 font-sans tracking-tight">
                {metrics.range}
              </span>
              <span className="text-lg font-bold text-teal-300 font-sans">KM</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dari kapasitas baterai 100% penuh <span className="text-cyan-400 font-mono">{BATTERY_KWH} kWh</span>
            </p>
          </div>

          <hr className="border-teal-900/40" />

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-teal-950/20 border border-teal-900/30">
              <CloudLightning className="w-5 h-5 mx-auto text-amber-400 mb-1" />
              <span className="text-[10px] text-slate-400 font-mono block">Konsumsi Energi</span>
              <span className="text-base font-bold text-teal-100 font-mono">
                {metrics.efficiency} <span className="text-[10px] font-normal">kWh/100km</span>
              </span>
            </div>

            <div className="text-center p-3 rounded-lg bg-teal-950/20 border border-teal-900/30">
              <DollarSign className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
              <span className="text-[10px] text-slate-400 font-mono block">Sekali Cas Rumah</span>
              <span className="text-base font-bold text-teal-100 font-mono">
                {metrics.fullChargeCost.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
            <p className="text-xs font-medium text-emerald-300 leading-relaxed text-center">
              🎉 Menggunakan J5 EV menghemat sekitar{" "}
              <strong className="text-emerald-200 font-mono">
                {metrics.saving.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
              </strong>{" "}
              per 10.000 KM jika dibandingkan dengan SUV bensin konvensional!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
