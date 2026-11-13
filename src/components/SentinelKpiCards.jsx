import React from 'react';
import { 
  Thermometer, 
  GitCompare, 
  Clock, 
  Sparkles, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert, 
  Gauge,
  Flame,
  Activity,
  Hourglass
} from 'lucide-react';
import { calculateBioPotency } from '../utils/arrheniusEngine';

export function SentinelKpiCards({ currentBlock, allBlocks }) {
  if (!currentBlock) return null;

  const tempDht = Number(currentBlock.temp_dht ?? 4.0);
  const tempNtc = Number(currentBlock.temp_ntc ?? tempDht);
  const humidity = Number(currentBlock.humidity ?? 48.5);
  const enclosure = currentBlock.enclosure || 'SEALED';
  const timestamp = currentBlock.timestamp;

  // Safe checks
  const isTempSafe = tempDht >= 2.0 && tempDht <= 8.0;
  const isEnclosureSealed = enclosure === 'SEALED' || enclosure === 'VERIFIED_SAFE';

  // Dual sensor drift
  const drift = Math.abs(tempDht - tempNtc);
  const isDriftCalibrated = drift <= 0.4;

  // Bio-Potency Engine calculation
  const bioPotency = calculateBioPotency(allBlocks);

  // Format RTC timestamp
  const rtcTimeStr = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '12:00:00 UTC';
  const rtcDateStr = timestamp 
    ? new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : '2026-11-13';

  return (
    <div className="space-y-4">
      {/* Critical Red Alert Banner if Temperature Excursion Outside 2.0°C - 8.0°C */}
      {!isTempSafe && (
        <div className="bg-rose-500/15 border-2 border-rose-500/80 rounded-xl p-4 shadow-[0_0_35px_rgba(244,63,94,0.35)] animate-pulse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/25 text-rose-400 border border-rose-500/50">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-rose-200 tracking-wide uppercase text-sm">
                  CRITICAL TEMPERATURE EXCURSION DETECTED
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950 border border-rose-700 text-rose-300">
                  {tempDht > 8.0 ? 'OVERHEATING (>8.0°C)' : 'FREEZING DANGER (<2.0°C)'}
                </span>
              </div>
              <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                Core reading <strong className="text-white font-mono">{tempDht.toFixed(2)}°C</strong> violates WHO Class A safe range (2.0°C – 8.0°C). WHO Arrhenius Bio-Potency Engine has accelerated real-time antigen degradation.
              </p>
            </div>
          </div>
          <div className="sm:text-right flex-shrink-0">
            <span className="text-xs font-mono text-rose-400 block font-bold">Vaccine Viability Depleting</span>
            <span className="text-[11px] text-rose-300/80 font-mono">Immediate Cryo Relocation Advised</span>
          </div>
        </div>
      )}

      {/* 4 Core Pillar KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card A: Vaccine Core Temp & Relative Humidity */}
        <div className={`relative overflow-hidden rounded-xl border p-4.5 transition-all duration-300 ${
          isTempSafe
            ? 'bg-slate-900/90 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
            : 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              Vaccine Core Temp
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isTempSafe 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
            }`}>
              {isTempSafe ? '2.0°C – 8.0°C' : 'OUTSIDE SAFE ZONE'}
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
                DHT22 Digital Core Probe
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-700/60 bg-slate-800/80">
              <Gauge className={`w-5 h-5 ${isTempSafe ? 'text-emerald-400' : 'text-rose-400'}`} />
            </div>
          </div>

          {/* Sub metric: Relative Humidity */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Relative Humidity:
            </span>
            <span className="font-mono font-bold text-cyan-300">{humidity.toFixed(1)}% RH</span>
          </div>
        </div>

        {/* Card B: Dual-Sensor Fault Tolerance (DHT22 vs NTC) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4.5 transition-all duration-300 hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-purple-400" />
              Dual-Sensor Drift
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isDriftCalibrated
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {isDriftCalibrated ? 'CALIBRATED' : 'DRIFT WARNING'}
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
                DHT22: <span className="text-cyan-300">{tempDht.toFixed(2)}°</span> | NTC: <span className="text-purple-300">{tempNtc.toFixed(2)}°</span>
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-700/60 bg-slate-800/80">
              <CheckCircle2 className={`w-5 h-5 ${isDriftCalibrated ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Fault Tolerance Limit</span>
            <span className="font-mono text-slate-300">Tol: ±0.50°C</span>
          </div>
        </div>

        {/* Card C: Hardware RTC Timestamp & Enclosure Seal State */}
        <div className={`relative overflow-hidden rounded-xl border p-4.5 transition-all duration-300 ${
          isEnclosureSealed
            ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            : 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-pulse'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              Hardware RTC Clock
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isEnclosureSealed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/30 text-rose-200 border border-rose-500/60 animate-bounce'
            }`}>
              {enclosure}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-white">
                {rtcTimeStr}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                DS1307 Real-Time Clock • {rtcDateStr}
              </p>
            </div>
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
              isEnclosureSealed 
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                : 'border-rose-500/50 bg-rose-500/20 text-rose-400'
            }`}>
              {isEnclosureSealed ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 animate-spin" />}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Enclosure Integrity:</span>
            <span className={`font-mono font-bold ${isEnclosureSealed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isEnclosureSealed ? 'SEALED (SAFE)' : 'LID BREACHED'}
            </span>
          </div>
        </div>

        {/* Card D: SIGNATURE USP — WHO Arrhenius Bio-Potency Engine */}
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-4.5 shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Arrhenius Bio-Potency
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              WHO USP ENGINE
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl md:text-4xl font-extrabold font-mono tracking-tight ${
                  bioPotency.potencyPct >= 95.0 ? 'text-cyan-300' : bioPotency.potencyPct >= 85.0 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {bioPotency.potencyPct}%
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono">Viability</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                <Hourglass className="w-3 h-3 text-cyan-400" />
                Remaining: <strong className="text-white">{bioPotency.remainingHours} hrs</strong>
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          {/* Potency gauge bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  bioPotency.potencyPct >= 95.0 ? 'bg-cyan-400' : bioPotency.potencyPct >= 85.0 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${bioPotency.potencyPct}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">MKT: {bioPotency.mktCelsius}°C</span>
          </div>
        </div>

      </div>
    </div>
  );
}
