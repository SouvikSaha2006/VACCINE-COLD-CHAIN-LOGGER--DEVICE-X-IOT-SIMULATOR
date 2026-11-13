import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  Activity, 
  RotateCcw, 
  FileCheck2,
  FileDown,
  Download,
  Loader2,
  Radio,
  Clock,
  Zap
} from 'lucide-react';
import { DEFAULT_TOPIC } from '../services/mqttService';

export function Header({ 
  mqttStatus, 
  packetCount, 
  isChainIntact, 
  totalVerifiedBlocks,
  onResetChain, 
  onExportLedger,
  isSimulating,
  onToggleSimulator,
  onOpenWhoModal,
  onDownloadPdf,
  isGeneratingPdf
}) {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="relative flex-shrink-0">
            <div className={`p-2.5 rounded-xl border ${
              isChainIntact 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                : 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse'
            }`}>
              {isChainIntact ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>
            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
              mqttStatus === 'CONNECTED' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white m-0">
                VaxGuard <span className="text-cyan-400 font-semibold text-lg md:text-xl">Zero-Trust Cold-Chain Sentinel</span>
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                WHO PQS Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Node ID: <code className="text-cyan-300 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-800/40 font-mono">VAX-NODE-01</code></span>
              <span className="text-slate-600">•</span>
              <span className="hidden sm:inline">ATECC608A Cryptographic Hardware Co-Processor</span>
            </p>
          </div>
        </div>

        {/* Live Status & Action Badges */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
          
          {/* Live MQTT Streaming Pulse Badge ("LIVE STREAMING: VAX-NODE-01") */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs font-mono">
            {mqttStatus === 'CONNECTED' ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-bold">LIVE STREAMING: VAX-NODE-01</span>
              </>
            ) : mqttStatus === 'CONNECTING' ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-400 font-semibold">CONNECTING...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 font-semibold">OFFLINE</span>
              </>
            )}

            <span className="text-slate-600">|</span>
            <span className="text-slate-400 hidden xl:inline" title="Microchip ATECC608A signing latency">
              1.8ms lat
            </span>
            <span className="text-slate-600 hidden xl:inline">|</span>
            <span className="bg-slate-700/80 text-cyan-300 px-2 py-0.5 rounded text-[11px] font-bold">
              {totalVerifiedBlocks} verified blocks
            </span>
          </div>

          {/* Download Official WHO Compliance PDF Button */}
          <button
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-[0_0_18px_rgba(16,185,129,0.35)] hover:scale-102 active:scale-98 disabled:opacity-50"
            title="Download official 1-page WHO PQS / VaxGuard Cryptographic Compliance Certificate PDF"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-slate-950 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>Download Official WHO Compliance PDF</span>
              </>
            )}
          </button>

          {/* Inspect Modal Button */}
          <button
            onClick={onOpenWhoModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            title="Inspect interactive WHO PQS compliance modal and QR validation"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Inspect Pass</span>
          </button>

          {/* Quick Action: Hardware Simulator Toggle */}
          <button
            onClick={onToggleSimulator}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isSimulating
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle autonomous hardware telemetry stream generator"
          >
            <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
            <span>{isSimulating ? 'Stream Active' : 'Start Stream'}</span>
          </button>

          {/* Reset / Re-verify button */}
          <button
            onClick={onResetChain}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Reset in-memory modifications back to authentic state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Chain</span>
          </button>

          {/* Export JSON button */}
          <button
            onClick={onExportLedger}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Export full cryptographic ledger audit log (JSON)"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>

      </div>
    </header>
  );
}
