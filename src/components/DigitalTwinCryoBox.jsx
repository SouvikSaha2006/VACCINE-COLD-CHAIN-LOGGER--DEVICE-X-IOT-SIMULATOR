import React, { useState } from 'react';
import { 
  Box, 
  Lock, 
  Unlock, 
  Thermometer, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  RotateCw,
  Sparkles,
  Layers
} from 'lucide-react';

export function DigitalTwinCryoBox({ 
  currentBlock, 
  isChainIntact,
  onSimulateLidTamper 
}) {
  const [manualRotate, setManualRotate] = useState(false);
  
  if (!currentBlock) return null;

  const tempDht = Number(currentBlock.temp_dht ?? 4.0);
  const isTempSafe = tempDht >= 2.0 && tempDht <= 8.0;
  
  // Enclosure and tamper state
  const isEnclosureBreached = currentBlock.enclosure === 'LID BREACHED' || currentBlock.enclosure === 'TAMPER_BREACH';
  const isExcursion = !isTempSafe;
  const isTampered = currentBlock.tampered || !isChainIntact;

  // Status computation for visual styling
  let boxState = 'SAFE'; // SAFE | EXCURSION | BREACH
  if (isEnclosureBreached || isTampered) {
    boxState = 'BREACH';
  } else if (isExcursion) {
    boxState = 'EXCURSION';
  }

  // Glow and theme colors based on state
  const glowStyles = {
    SAFE: {
      boxGlow: 'shadow-[0_0_40px_rgba(6,182,212,0.25)] border-cyan-500/40',
      bgGrad: 'from-cyan-950/20 via-slate-900/60 to-slate-950',
      accentColor: '#06b6d4',
      badgeClass: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
      statusText: 'DIGITAL TWIN: VERIFIED_SAFE',
      lidTransform: 'rotateX(0deg) translateY(0px)',
      lidColor: 'bg-gradient-to-b from-slate-700 to-slate-800 border-cyan-500/50',
    },
    EXCURSION: {
      boxGlow: 'shadow-[0_0_45px_rgba(245,158,11,0.35)] border-amber-500/60 animate-pulse',
      bgGrad: 'from-amber-950/25 via-slate-900/60 to-slate-950',
      accentColor: '#f59e0b',
      badgeClass: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
      statusText: 'DIGITAL TWIN: COLD_CHAIN_EXCURSION',
      lidTransform: 'rotateX(5deg) translateY(-2px)',
      lidColor: 'bg-gradient-to-b from-amber-900/80 to-slate-800 border-amber-500/60',
    },
    BREACH: {
      boxGlow: 'shadow-[0_0_55px_rgba(244,63,94,0.5)] border-rose-500/80 animate-pulse',
      bgGrad: 'from-rose-950/35 via-slate-900/60 to-slate-950',
      accentColor: '#f43f5e',
      badgeClass: 'bg-rose-500/25 border-rose-500/70 text-rose-200 animate-bounce',
      statusText: 'DIGITAL TWIN: TAMPER / LID BREACHED',
      lidTransform: 'rotateX(-45deg) translateY(-28px) translateZ(20px)',
      lidColor: 'bg-gradient-to-b from-rose-900 to-rose-950 border-rose-500',
    }
  }[boxState];

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${glowStyles.boxGlow} bg-gradient-to-b ${glowStyles.bgGrad} p-5 md:p-6`}>
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

      {/* Header bar of 3D Digital Twin */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-cyan-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-wide m-0">
                3D Cryo-Box Physical Digital Twin
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                AERO-PQS CRYO-CHAMBER V4
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live spatial telemetry mirror with real-time lid kinematics & optical seal detection
            </p>
          </div>
        </div>

        {/* Status Pill on Digital Twin */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 ${glowStyles.badgeClass}`}>
            {boxState === 'SAFE' && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
            {boxState === 'EXCURSION' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            {boxState === 'BREACH' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
            <span>{glowStyles.statusText}</span>
          </div>

          <button
            onClick={() => setManualRotate(!manualRotate)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Toggle isometric inspection tilt"
          >
            <RotateCw className={`w-3.5 h-3.5 ${manualRotate ? 'text-cyan-400 animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main 3D Perspective Stage */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: 3D Isometric Cryo-Box Scene */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[260px] py-4">
          <div 
            className="relative w-72 md:w-84 h-56 transition-transform duration-700 cursor-pointer"
            style={{ 
              perspective: '1000px',
              transformStyle: 'preserve-3d',
              transform: manualRotate ? 'rotateX(15deg) rotateY(-25deg) scale(1.05)' : 'rotateX(12deg) rotateY(-18deg)'
            }}
            onClick={() => setManualRotate(!manualRotate)}
          >
            
            {/* Ambient chamber floor shadow */}
            <div 
              className="absolute -bottom-6 left-6 right-6 h-12 rounded-full blur-xl transition-all duration-500"
              style={{
                backgroundColor: boxState === 'SAFE' ? 'rgba(6,182,212,0.3)' : boxState === 'EXCURSION' ? 'rgba(245,158,11,0.35)' : 'rgba(244,63,94,0.45)'
              }}
            />

            {/* CRYO-BOX LID (Animated Hinged Lid) */}
            <div 
              className={`absolute top-0 left-0 right-0 h-14 rounded-t-xl border-2 transition-all duration-700 z-30 flex items-center justify-between px-4 ${glowStyles.lidColor}`}
              style={{
                transformOrigin: 'top center',
                transform: glowStyles.lidTransform,
                boxShadow: boxState === 'BREACH' ? '0 -10px 30px rgba(244,63,94,0.4)' : '0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              {/* Lid Handle & Locking Clasp */}
              <div className="flex items-center gap-2">
                <div className="w-12 h-3 rounded bg-slate-900 border border-slate-600 flex items-center justify-center">
                  <div className="w-6 h-1 rounded bg-slate-500" />
                </div>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">AERO-SEAL</span>
              </div>

              {/* Optical Interlock & Status LED */}
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  boxState === 'SAFE' ? 'bg-cyan-400 animate-ping' : boxState === 'EXCURSION' ? 'bg-amber-400' : 'bg-rose-500 animate-bounce'
                }`} />
                <span className="text-[10px] font-mono font-bold text-white">
                  {boxState === 'BREACH' ? 'LID UNLATCHED' : 'VACUUM SEALED'}
                </span>
              </div>
            </div>

            {/* CRYO-BOX BODY (Translucent VIP Insulated Vacuum Shell) */}
            <div className={`absolute top-12 left-0 right-0 bottom-0 rounded-b-2xl border-2 bg-slate-900/90 backdrop-blur-md transition-all duration-500 overflow-hidden flex flex-col justify-between p-4 ${
              boxState === 'SAFE' ? 'border-cyan-500/60 shadow-[inset_0_0_30px_rgba(6,182,212,0.15)]' :
              boxState === 'EXCURSION' ? 'border-amber-500/70 shadow-[inset_0_0_35px_rgba(245,158,11,0.2)]' :
              'border-rose-500/90 shadow-[inset_0_0_40px_rgba(244,63,94,0.3)]'
            }`}>
              
              {/* Internal Chamber View: Vaccine Vial Rack */}
              <div className="relative flex-1 flex flex-col justify-center">
                {/* Cold Frost Vapor effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mb-2">
                  <span>INTERNAL CRYO RACK #1</span>
                  <span className="font-bold text-cyan-300">{tempDht.toFixed(2)}°C</span>
                </div>

                {/* 6 Vaccine Vials with Dynamic Fill Level & Glow */}
                <div className="grid grid-cols-6 gap-2 items-end justify-center py-2 px-1 bg-slate-950/60 rounded-xl border border-slate-800">
                  {[1, 2, 3, 4, 5, 6].map((vial) => (
                    <div key={vial} className="flex flex-col items-center group relative">
                      {/* Vial Rubber Stopper */}
                      <div className="w-3 h-1.5 rounded-t-sm bg-slate-600 border-x border-t border-slate-500" />
                      {/* Vial Neck */}
                      <div className="w-2.5 h-1 bg-slate-700/80 border-x border-slate-600" />
                      {/* Glass Body */}
                      <div className={`w-5 h-9 rounded-b-md border relative overflow-hidden flex items-end justify-center transition-all ${
                        boxState === 'SAFE' ? 'border-cyan-400/60 bg-cyan-950/40' :
                        boxState === 'EXCURSION' ? 'border-amber-400/60 bg-amber-950/40' :
                        'border-rose-500/80 bg-rose-950/50'
                      }`}>
                        {/* Antigen Liquid Fill */}
                        <div 
                          className={`w-full rounded-b transition-all duration-700 ${
                            boxState === 'SAFE' ? 'bg-gradient-to-t from-cyan-400 to-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.6)]' :
                            boxState === 'EXCURSION' ? 'bg-gradient-to-t from-amber-400 to-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.6)]' :
                            'bg-gradient-to-t from-rose-500 to-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                          }`}
                          style={{ height: '70%' }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 mt-1">V{vial}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Chamber Chassis Specs */}
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Lock className={`w-3 h-3 ${boxState === 'SAFE' ? 'text-cyan-400' : 'text-rose-400'}`} />
                  Optical Switch: {boxState === 'BREACH' ? 'BROKEN' : 'INTACT'}
                </span>
                <span className="text-slate-500">DS1307 RTC SYNCED</span>
              </div>

            </div>

            {/* Breach Alert Ribbon */}
            {boxState === 'BREACH' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white font-mono font-extrabold text-[11px] px-3 py-1 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.8)] border border-rose-300 animate-bounce z-40 whitespace-nowrap">
                🚨 LID INTERLOCK BREACHED
              </div>
            )}

          </div>

          <div className="mt-3 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Interactive 3D Perspective — Click box or button to toggle tilt angle</span>
          </div>
        </div>

        {/* Right: Telemetry Health & Kinematics Sidebar */}
        <div className="lg:col-span-5 space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Chamber Environment
            </span>
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              VAX-NODE-01
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CORE TEMPERATURE:</span>
              <span className={`text-base font-extrabold ${isTempSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tempDht.toFixed(2)} °C
              </span>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">INTERNAL HUMIDITY:</span>
              <span className="text-base font-extrabold text-cyan-300">
                {Number(currentBlock.humidity ?? 48.5).toFixed(1)} %
              </span>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">HARDWARE SEAL:</span>
              <span className={`font-bold ${!isEnclosureBreached ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentBlock.enclosure || 'SEALED'}
              </span>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CHAMBER VACUUM:</span>
              <span className="text-slate-300 font-semibold">0.08 mbar (VIP)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Security Interlock:</span>
              <span className={boxState === 'BREACH' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {boxState === 'BREACH' ? 'OPENED / TAMPER TRIP' : 'CLOSED & SECURED'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Thermal Insulation:</span>
              <span className="text-slate-300">AeroGel Vacuum Panel (R-50)</span>
            </div>
          </div>

          {/* Quick Lid Breach Simulator Trigger Button */}
          <div className="pt-2">
            <button
              onClick={onSimulateLidTamper}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                isEnclosureBreached
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900'
              }`}
            >
              {isEnclosureBreached ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Restore Chamber Lid & Reseal</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Simulate Lid Opening Breach (Tamper Event)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
