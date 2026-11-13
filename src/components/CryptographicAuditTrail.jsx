import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  KeyRound, 
  Lock, 
  Unlink, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  Terminal, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Flame,
  AlertTriangle
} from 'lucide-react';
import { truncateHash, getCanonicalBlockString } from '../utils/crypto';

export function CryptographicAuditTrail({ 
  verifiedBlocks, 
  isChainIntact, 
  onTamperBlock, 
  onRestoreBlock,
  onResetChain,
  focusedBlockIndex 
}) {
  const [copiedHash, setCopiedHash] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const latestBlock = verifiedBlocks[verifiedBlocks.length - 1];

  return (
    <div className="space-y-4">
      {/* ATECC608A Hardware Security Module Panel */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-4 md:p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                  GOALS 2 & 3
                </span>
                <h3 className="text-base font-bold text-white tracking-wide m-0">
                  Microchip ATECC608A Hardware Security Module (HSM)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  FIPS 140-2 LEVEL 3 COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hardware-isolated cryptographic co-processor executing immutable SHA-256 micro-blockchain signing
              </p>
            </div>
          </div>

          {/* HSM Telemetry Specs */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">SIGNING LATENCY:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                1.8 ms (Hardware)
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">ACTIVE CHAIN TIP:</span>
              <code className="text-cyan-300 font-bold block" title={latestBlock?.signature_hash}>
                {truncateHash(latestBlock?.signature_hash, 6, 6)}
              </code>
            </div>

            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">ALGORITHM / KEY SLOT:</span>
              <span className="text-slate-200 font-semibold block">SHA-256 / Slot 0 ECC</span>
            </div>
          </div>

        </div>
      </div>

      {/* Live Cryptographic Block Ledger Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 m-0">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Cryptographic Audit Trail Ledger
              <span className="text-xs font-mono font-normal text-slate-400">
                ({verifiedBlocks.length} linked blocks)
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict hash chain: each packet incorporates <code className="text-cyan-300">prev_hash</code> from the preceding block's signature
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${
              isChainIntact
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-rose-500/20 border-rose-500/70 text-rose-200 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.3)]'
            }`}>
              {isChainIntact ? (
                <>
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHA-256 CONTINUITY INTACT</span>
                </>
              ) : (
                <>
                  <Unlink className="w-3.5 h-3.5 text-rose-400" />
                  <span>CRYPTOGRAPHIC CHAIN BROKEN</span>
                </>
              )}
            </div>

            {/* Reset chain button */}
            <button
              onClick={onResetChain}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Reset in-memory modifications back to authentic state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset Chain</span>
            </button>
          </div>
        </div>

        {/* Ledger Blocks List */}
        <div className="divide-y divide-slate-800/80">
          {verifiedBlocks.map((block, idx) => {
            const isBroken = block.is_broken;
            const isTampered = block.tampered;
            const isExpanded = expandedIndex === block.block_index;
            const isFocused = focusedBlockIndex === block.block_index;

            const timeStr = block.timestamp 
              ? new Date(block.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '12:00:00';

            return (
              <div 
                key={block.block_index}
                id={`block-${block.block_index}`}
                className={`p-4 md:p-5 transition-all duration-300 relative ${
                  isFocused ? 'ring-2 ring-cyan-500 bg-cyan-950/20' : ''
                } ${
                  isBroken
                    ? 'bg-rose-950/35 hover:bg-rose-950/45 border-l-4 border-l-rose-500'
                    : 'bg-slate-900/60 hover:bg-slate-800/40 border-l-4 border-l-emerald-500'
                }`}
              >
                {/* Visual chain link marker */}
                {idx > 0 && (
                  <div className="absolute -top-3 left-7 flex items-center justify-center z-10">
                    <div className={`p-0.5 rounded-full border text-[10px] ${
                      isBroken
                        ? 'bg-rose-950 border-rose-500/70 text-rose-400'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}>
                      {isBroken ? <Unlink className="w-3 h-3 text-rose-400" /> : <LinkIcon className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Left: Block ID, Time, Temp */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 flex-wrap">
                    <div className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 ${
                      isBroken
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : 'bg-slate-800 border-slate-700 text-cyan-300'
                    }`}>
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Block #{block.block_index}</span>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                      {timeStr} (RTC)
                    </span>

                    {/* Recorded Temp */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">temp_dht:</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-sm font-bold ${
                        isTampered
                          ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50 line-through'
                          : Number(block.temp_dht) >= 2.0 && Number(block.temp_dht) <= 8.0
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                      }`}>
                        {Number(block.temp_dht).toFixed(2)}°C
                      </span>

                      {isTampered && (
                        <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/90 px-2 py-0.5 rounded border border-rose-800 flex items-center gap-1 animate-pulse">
                          <Flame className="w-3 h-3 text-rose-400" />
                          Falsified from {block.original_temp_dht}°C → {Number(block.temp_dht).toFixed(2)}°C
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Linked Hashes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono w-full lg:w-auto">
                    {/* prev_hash */}
                    <div className="bg-slate-950/80 border border-slate-800/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2">
                      <span className="text-slate-500 text-[11px]">prev_hash:</span>
                      <code className="text-slate-300 text-[11px]" title={block.prev_hash}>
                        {truncateHash(block.prev_hash)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(block.prev_hash, `p-${block.block_index}`)}
                        className="text-slate-500 hover:text-cyan-400 p-0.5"
                        title="Copy hash"
                      >
                        {copiedHash === `p-${block.block_index}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* signature_hash */}
                    <div className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 border ${
                      isBroken ? 'bg-rose-950/60 border-rose-800/60 text-rose-200' : 'bg-slate-950/80 border-slate-800/80 text-cyan-300'
                    }`}>
                      <span className="text-slate-500 text-[11px]">signature:</span>
                      <code className="text-[11px]" title={block.signature_hash}>
                        {truncateHash(block.signature_hash)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(block.signature_hash, `s-${block.block_index}`)}
                        className="text-slate-500 hover:text-cyan-400 p-0.5"
                        title="Copy hash"
                      >
                        {copiedHash === `s-${block.block_index}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Right: Badge & Tamper Simulation Button */}
                  <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
                    
                    {/* Exact badge as specified */}
                    {!isBroken ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>SHA-256 VERIFIED</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-extrabold uppercase tracking-wider bg-rose-500/25 border-2 border-rose-500/80 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>CRYPTOGRAPHIC CHAIN BROKEN — FALSIFICATION DETECTED</span>
                      </div>
                    )}

                    {/* Simulate Database Tamper Attack Button */}
                    {!isTampered ? (
                      <button
                        onClick={() => {
                          // Modifies that block's temperature in-memory (e.g., hiding a 12°C spike as 4.5°C)
                          const fakeTemp = block.temp_dht >= 8.0 ? 4.50 : 4.50;
                          onTamperBlock(block.block_index, fakeTemp);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/70 hover:bg-rose-900 border border-rose-700/80 text-rose-200 hover:text-white transition-all shadow-sm"
                        title="Modify in-memory database record to hide spoilage excursion"
                      >
                        <Terminal className="w-3.5 h-3.5 text-rose-400" />
                        <span>Simulate Database Tamper Attack</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onRestoreBlock(block.block_index)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition-colors"
                        title="Restore authentic hardware signed temperature"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Undo Tamper</span>
                      </button>
                    )}

                    {/* Expand inspector */}
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : block.block_index)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Direct or cascade failure warning message */}
                {isBroken && (
                  <div className="mt-2.5 pt-2 border-t border-rose-900/50 text-xs font-mono text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />
                      <span>{block.break_reason || 'Chain integrity violation: cryptographic continuity severed.'}</span>
                    </div>
                    {block.recomputed_hash && (
                      <div className="text-[11px] text-rose-300">
                        Recomputed: <code className="bg-rose-950 px-1 py-0.5 rounded">{truncateHash(block.recomputed_hash)}</code>
                      </div>
                    )}
                  </div>
                )}

                {/* Expanded forensic drawer */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800 bg-slate-950/70 p-3.5 rounded-lg text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                      <span className="font-bold text-slate-300">ATECC608A SIGNATURE INSPECTOR (BLOCK #{block.block_index})</span>
                      <span className="text-[10px] text-slate-500">CANONICAL DIGEST VERIFIER</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-500 block text-[11px] mb-1">CANONICAL INPUT STREAM:</span>
                        <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[10.5px] text-cyan-300 whitespace-pre-wrap break-all">
                          {getCanonicalBlockString(block)}
                        </pre>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-500 block text-[11px]">HARDWARE SIGNATURE (ORIGINAL):</span>
                          <code className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[10.5px] text-slate-200 block break-all">
                            {block.signature_hash}
                          </code>
                        </div>

                        {block.recomputed_hash && (
                          <div>
                            <span className="text-slate-500 block text-[11px]">RECOMPUTED HASH (CURRENT):</span>
                            <code className={`p-1.5 rounded border text-[10.5px] block break-all ${
                              block.recomputed_hash === block.signature_hash
                                ? 'bg-slate-900 border-slate-800 text-emerald-400'
                                : 'bg-rose-950/80 border-rose-800 text-rose-300 font-bold'
                            }`}>
                              {block.recomputed_hash}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
