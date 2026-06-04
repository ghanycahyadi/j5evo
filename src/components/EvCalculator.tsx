/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Zap, 
  Battery, 
  Cpu, 
  Sliders
} from "lucide-react";

import CustomFreeMapRoute from "./CustomFreeMapRoute";

// Spec JAECOO J5 EV
const JAECOO_EV_SPECS = {
  model: "JAECOO J5 EV",
  batteryCapacityKwh: 67.0, // J5 EV LFP Pack
  wltpRangeKm: 420, // Official WLTP specification range
  fastChargeMin: 28, // 10% - 80% time
  fastChargeMaxKw: 130, // Peak DC power support
  motorPowerHp: 204, // ~150 kW pure electric motor
  drivetrain: "FWD (Front Motor)"
};

export default function EvCalculator() {
  // Factors parameters affecting LFP battery consumption
  const [speedStyle, setSpeedStyle] = useState<"eco" | "normal" | "sport">("normal");
  const [cargoLoad, setCargoLoad] = useState<"eco" | "moderate" | "heavy">("moderate");
  const [acIntensity, setAcIntensity] = useState<"low" | "medium" | "high">("medium");
  const [wheelDiameter, setWheelDiameter] = useState<number>(18);
  const [temperatureCelsius, setTemperatureCelsius] = useState<number>(31);
  const [socAtStart, setSocAtStart] = useState<number>(100);
  const [socSafetyLimit, setSocSafetyLimit] = useState<number>(20);
  
  // Power Source Tariff Selection
  const [tariffType, setTariffType] = useState<"home" | "spklu_fast" | "spklu_ultra">("spklu_fast");

  return (
    <div className="bg-zinc-50 rounded-3xl border border-zinc-200 p-4 md:p-8 shadow-xl max-w-6xl mx-auto text-left space-y-8">
      
      {/* HEADER SECTION WITH OFFICIAL SPECS DISPLAY */}
      <div className="relative overflow-hidden bg-radial from-slate-900 via-zinc-950 to-slate-950 rounded-2xl p-6 md:p-8 text-white border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] bg-teal-500/20 text-teal-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono">
              EV Simulator Resmi
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 font-sans">
              JAECOO J5 EV Assistant
            </h1>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed max-w-lg">
              Kalkulator efisiensi &amp; kesiapan perjalanan cerdas untuk JAECOO J5 EV dengan baterai premium LFP 67.0 kWh.
            </p>
          </div>

          {/* JAECOO J5 TRIPLE CORE METRIC SPEC BADGES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-300">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[8px] text-zinc-400 font-mono block leading-none uppercase">Kapasitas Bat</span>
                <span className="text-xs font-black font-mono text-white leading-normal">{JAECOO_EV_SPECS.batteryCapacityKwh} kWh</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-300">
                <Battery className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[8px] text-zinc-400 font-mono block leading-none uppercase">WLTP Range</span>
                <span className="text-xs font-black font-mono text-white leading-normal">{JAECOO_EV_SPECS.wltpRangeKm} KM</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-lg bg-[#14b8a6]/15 flex items-center justify-center text-teal-300">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[8px] text-zinc-400 font-mono block leading-none uppercase">Daya Kilowatt</span>
                <span className="text-xs font-black font-mono text-white leading-normal">130 kW DC Max</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BODY Perjalanan */}
      <div className="space-y-6">
        <div className="border-b border-zinc-200 pb-2">
          <h2 className="text-lg font-black text-zinc-800 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-600" />
            <span>Perjalanan</span>
          </h2>
        </div>

        <CustomFreeMapRoute
          speedStyle={speedStyle}
          setSpeedStyle={setSpeedStyle}
          cargoLoad={cargoLoad}
          setCargoLoad={setCargoLoad}
          acIntensity={acIntensity}
          setAcIntensity={setAcIntensity}
          wheelDiameter={wheelDiameter}
          setWheelDiameter={setWheelDiameter}
          temperatureCelsius={temperatureCelsius}
          setTemperatureCelsius={setTemperatureCelsius}
          socAtStart={socAtStart}
          setSocAtStart={setSocAtStart}
          socSafetyLimit={socSafetyLimit}
          setSocSafetyLimit={setSocSafetyLimit}
          tariffType={tariffType}
          setTariffType={setTariffType}
        />
      </div>
    </div>
  );
}
