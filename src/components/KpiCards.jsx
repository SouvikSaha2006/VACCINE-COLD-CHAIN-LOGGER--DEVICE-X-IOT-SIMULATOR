import React from 'react';
import { 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  GitCompare, 
  BatteryMedium, 
  BatteryCharging,
  BatteryWarning,
  Lock, 
  Unlock, 
  Zap,
  Gauge
} from 'lucide-react';

export function KpiCards({ currentBlock }) {
  if (!currentBlock) return null;

  const tempDht = Number(currentBlock.temp_dht ?? 4.0);
  const tempNtc = Number(currentBlock.temp_ntc ?? tempDht);
  const battV = Number(currentBlock.batt_v ?? 3.0);
  const powerMode = currentBlock.power_mode || 'ULTRA_LOW_POWER';
  const enclosure = currentBlock.enclosure || 'VERIFIED_SAFE';

  // Vaccine Safe Zone: 2.0°C to 8.0°C
  const isTempSafe = tempDht >= 2.0 && tempDht <= 8.0;
  const isEnclosureSafe = enclosure === 'VERIFIED_SAFE';
  
  // Drift calculation
  const drift = Math.abs(tempDht - tempNtc);
  const isDriftOptimal = drift <= 0.4;
  const isDriftWarning = drift > 0.8;

  // Battery health (assuming 3.0V CR2032/CR2477 coin cell nominal 3.0V, cutoff ~2.2V, max ~3.3V)
  const batteryPct = Math.min(100, Math.max(0, Math.round(((battV - 2.2) / (3.2 - 2.2)) * 100)));
  const isBatteryLow = battV < 2.5;

  return (
    <div className="space-y-4">
      {/* Red Alert Banner if Temperature Excursion Outside 2°C - 8°C */}
      {!isTempSafe && (
        <div className="bg-rose-500/15 border-2 border-rose-500/70 rounded-xl p-4 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-200 tracking-wide uppercase text-sm">
                  CRITICAL COLD-CHAIN TEMPERATURE EXCURSION
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950 border border-rose-700 text-rose-300">
                  {tempDht > 8.0 ? 'OVERHEATING (>8.0°C)' : 'FREEZING (<2.0°C)'}
                </span>
              </div>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Current reading <strong className="text-white font-mono">{tempDht.toFixed(2)}°C</strong> breaches WHO safe biological storage thresholds (2.0°C - 8.0°C). Vaccine potency at imminent risk of irreversible denaturing.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono text-rose-400 block font-semibold">Immediate Action Required</span>
            <span className="text-[11px] text-rose-300/70 font-mono">Transfer to Backup Cryo Storage</span>
          </div>
        </div>
      )}

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Vaccine Temperature */}
        <div className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
          isTempSafe
            ? 'bg-slate-900/90 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
            : 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              Vaccine Temperature
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isTempSafe 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
            }`}>
              {isTempSafe ? 'SAFE RANGE (2-8°C)' : 'EXCURSION ALERT'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl md:text-4xl font-extrabold font-mono tracking-tight ${
                  isTempSafe ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {tempDht.toFixed(2)}
                </span>
                <span className="text-lg font-semibold text-slate-400 font-mono">°C</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                WHO Target: <span className="font-mono text-slate-200">2.0°C – 8.0°C</span>
              </p>
            </div>
            
            {/* Visual Mini Thermometer Gauge */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-700/60 bg-slate-800/80">
              <Gauge className={`w-5 h-5 ${isTempSafe ? 'text-emerald-400' : 'text-rose-400 animate-spin'}`} />
            </div>
          </div>

          {/* Temperature Range Bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>0°C</span>
            <div className="flex-1 mx-2 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
              {/* Safe zone overlay (2°C to 8°C mapped on a 0-14°C scale) */}
              <div className="absolute left-[14%] right-[42%] top-0 bottom-0 bg-emerald-500/30 border-x border-emerald-500/50" />
              {/* Current marker */}
              <div 
                className={`absolute top-0 bottom-0 w-2 rounded-full transform -translate-x-1 ${
                  isTempSafe ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
                }`}
                style={{ left: `${Math.min(100, Math.max(0, (tempDht / 14) * 100))}%` }}
              />
            </div>
            <span>14°C</span>
          </div>
        </div>

        {/* Card 2: Dual-Sensor Drift (DHT22 vs NTC) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 transition-all duration-300 hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-purple-400" />
              Dual-Sensor Drift
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isDriftOptimal 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : isDriftWarning
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isDriftOptimal ? 'CALIBRATED' : isDriftWarning ? 'HIGH DRIFT' : 'MODERATE'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-white">
                  Δ {drift.toFixed(2)}
                </span>
                <span className="text-lg font-semibold text-slate-400 font-mono">°C</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                DHT22: <span className="text-cyan-300">{tempDht.toFixed(2)}°C</span> | NTC: <span className="text-purple-300">{tempNtc.toFixed(2)}°C</span>
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-700/60 bg-slate-800/80">
              <CheckCircle2 className={`w-5 h-5 ${isDriftOptimal ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Redundant cross-probe check</span>
            <span className="font-mono text-slate-300">Tol: ±0.50°C</span>
          </div>
        </div>

        {/* Card 3: Coin-Cell Battery */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 transition-all duration-300 hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BatteryMedium className="w-4 h-4 text-amber-400" />
              Coin-Cell Battery
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              CR2477 3.0V
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl md:text-4xl font-extrabold font-mono tracking-tight ${
                  isBatteryLow ? 'text-rose-400' : 'text-white'
                }`}>
                  {battV.toFixed(2)}
                </span>
                <span className="text-lg font-semibold text-slate-400 font-mono">V</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Mode: <span className="font-mono text-cyan-300">{powerMode}</span>
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-700/60 bg-slate-800/80">
              {isBatteryLow ? (
                <BatteryWarning className="w-5 h-5 text-rose-400 animate-pulse" />
              ) : (
                <BatteryCharging className="w-5 h-5 text-emerald-400" />
              )}
            </div>
          </div>

          {/* Battery charge gauge */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isBatteryLow ? 'bg-rose-500' : batteryPct < 40 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${batteryPct}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400">{batteryPct}%</span>
          </div>
        </div>

        {/* Card 4: Enclosure Integrity */}
        <div className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
          isEnclosureSafe
            ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            : 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-pulse'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              {isEnclosureSafe ? <Lock className="w-4 h-4 text-emerald-400" /> : <Unlock className="w-4 h-4 text-rose-400" />}
              Enclosure Integrity
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isEnclosureSafe 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/30 text-rose-200 border border-rose-500/60 animate-bounce'
            }`}>
              {enclosure}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className={`text-xl md:text-2xl font-bold tracking-tight block ${
                isEnclosureSafe ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {isEnclosureSafe ? 'VERIFIED SAFE' : 'TAMPER BREACH'}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                {isEnclosureSafe 
                  ? 'Optical seal & chassis interlock intact' 
                  : 'Chassis seal opened or wire loop severed!'}
              </p>
            </div>
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
              isEnclosureSafe 
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                : 'border-rose-500/50 bg-rose-500/20 text-rose-400'
            }`}>
              {isEnclosureSafe ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5 animate-spin" />}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hardware tamper micro-switch</span>
            <span className={`font-mono font-semibold ${isEnclosureSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isEnclosureSafe ? 'NORMAL' : 'TRIPPED'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
