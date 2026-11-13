import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Link as LinkIcon, 
  Unlink, 
  AlertTriangle, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Database,
  Terminal,
  Hash,
  RefreshCw,
  ExternalLink,
  Flame
} from 'lucide-react';
import { truncateHash, getCanonicalBlockString } from '../utils/crypto';

export function AuditLedger({ 
  verifiedBlocks, 
  isChainIntact, 
  onTamperBlock, 
  onRestoreBlock,
  focusedBlockIndex 
}) {
  const [copiedHash, setCopiedHash] = useState(null);
  const [expandedBlockIndex, setExpandedBlockIndex] = useState(null);
  const [tamperCustomTemp, setTamperCustomTemp] = useState({});

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const toggleExpand = (index) => {
    setExpandedBlockIndex(expandedBlockIndex === index ? null : index);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              isChainIntact 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
            }`}>
              {isChainIntact ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 m-0">
                Cryptographic Audit Trail Ledger
                <span className="text-xs font-mono font-normal text-slate-400">
                  ({verifiedBlocks.length} linked blocks)
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero-trust SHA-256 micro-blockchain securing immutable cold-chain telemetry
              </p>
            </div>
          </div>
        </div>

        {/* Global Chain Status Indicator */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${
            isChainIntact
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : 'bg-rose-500/20 border-rose-500/60 text-rose-200 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.3)]'
          }`}>
            {isChainIntact ? (
              <>
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>ALL HASH LINKS VALID</span>
              </>
            ) : (
              <>
                <Unlink className="w-3.5 h-3.5 text-rose-400" />
                <span>BLOCKCHAIN INTEGRITY SEVERED</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table / Linked Blocks List */}
      <div className="divide-y divide-slate-800/80">
        {verifiedBlocks.map((block, idx) => {
          const isBroken = block.is_broken;
          const isTamperedDirectly = block.tampered;
          const isCascadeBroken = block.cascade_broken;
          const isExpanded = expandedBlockIndex === block.block_index;
          const isFocused = focusedBlockIndex === block.block_index;

          const formattedTime = block.timestamp
            ? new Date(block.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : 'Unknown';

          return (
            <div 
              key={block.block_index}
              id={`block-${block.block_index}`}
              className={`p-4 md:p-5 transition-all duration-300 relative ${
                isFocused ? 'ring-2 ring-cyan-500 bg-cyan-950/20' : ''
              } ${
                isBroken
                  ? 'bg-rose-950/30 hover:bg-rose-950/40 border-l-4 border-l-rose-500'
                  : 'bg-slate-900/60 hover:bg-slate-800/40 border-l-4 border-l-emerald-500'
              }`}
            >
              {/* Linked Chain Indicator Graphic (for non-genesis blocks) */}
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
                
                {/* Left: Block ID & Timestamp & Temp */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 flex-wrap">
                  {/* Block Index Badge */}
                  <div className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 ${
                    isBroken
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                      : 'bg-slate-800 border-slate-700 text-cyan-300'
                  }`}>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>#{block.block_index}</span>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-slate-400 font-mono">
                    {formattedTime}
                  </div>

                  {/* Temperature Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">temp_dht:</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-sm font-bold ${
                      isTamperedDirectly
                        ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50 line-through decoration-rose-400'
                        : Number(block.temp_dht) >= 2.0 && Number(block.temp_dht) <= 8.0
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                    }`}>
                      {Number(block.temp_dht).toFixed(2)}°C
                    </span>

                    {/* Show falsified spoofing note if tampered directly */}
                    {isTamperedDirectly && (
                      <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 animate-pulse">
                        <Flame className="w-3 h-3 text-rose-400" />
                        Spoofed to {Number(block.temp_dht).toFixed(2)}°C (Orig: {block.original_temp_dht}°C)
                      </span>
                    )}

                    <span className="text-[11px] text-slate-500 font-mono hidden xl:inline">
                      (NTC: {Number(block.temp_ntc).toFixed(2)}°C)
                    </span>
                  </div>
                </div>

                {/* Middle: Hashes (prev_hash and signature_hash) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono w-full lg:w-auto">
                  {/* prev_hash */}
                  <div className="bg-slate-950/80 border border-slate-800/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2">
                    <span className="text-slate-500 text-[11px]">prev_hash:</span>
                    <code className="text-slate-300 font-mono text-[11px]" title={block.prev_hash}>
                      {truncateHash(block.prev_hash)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(block.prev_hash, `prev-${block.block_index}`)}
                      className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5"
                      title="Copy full 64-char SHA-256 hash"
                    >
                      {copiedHash === `prev-${block.block_index}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* signature_hash */}
                  <div className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 border ${
                    isBroken
                      ? 'bg-rose-950/50 border-rose-800/60 text-rose-200'
                      : 'bg-slate-950/80 border-slate-800/80 text-cyan-300'
                  }`}>
                    <span className="text-slate-500 text-[11px]">signature:</span>
                    <code className="font-mono text-[11px]" title={block.signature_hash}>
                      {truncateHash(block.signature_hash)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(block.signature_hash, `sig-${block.block_index}`)}
                      className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5"
                      title="Copy full 64-char SHA-256 signature"
                    >
                      {copiedHash === `sig-${block.block_index}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Right: Verification Badge & Tamper Action */}
                <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
                  {/* Status Badge */}
                  {!isBroken ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>SHA-256 CHAIN VERIFIED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-extrabold uppercase tracking-wider bg-rose-500/25 border-2 border-rose-500/80 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse">
                      <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />
                      <span>AUDIT BROKEN - RECORD FALSIFIED</span>
                    </div>
                  )}

                  {/* Simulate Database Tamper Attack Button */}
                  {!isTamperedDirectly ? (
                    <button
                      onClick={() => {
                        // Default tamper: alters temperature (e.g. changing 11.5°C to 4.0°C to hide spoilage, or 4.0°C)
                        const targetTemp = block.temp_dht === 4.0 ? 11.5 : 4.0;
                        onTamperBlock(block.block_index, targetTemp);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-700/80 text-rose-200 hover:text-white transition-all shadow-sm hover:shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                      title="Simulate malicious DBA altering database record to hide excursion"
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
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Undo Tamper</span>
                    </button>
                  )}

                  {/* Expand / Details Toggle */}
                  <button
                    onClick={() => toggleExpand(block.block_index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Inspect cryptographic proof details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

              </div>

              {/* Cascade failure notice on downstream blocks */}
              {isCascadeBroken && (
                <div className="mt-2.5 pt-2 border-t border-rose-900/40 text-[11px] font-mono text-rose-300/80 flex items-center gap-1.5">
                  <Unlink className="w-3 h-3 text-rose-400" />
                  <span>
                    Cryptographic chain severed by upstream tamper at Block #{block.broken_origin}. All forward hashes invalid.
                  </span>
                </div>
              )}

              {/* Direct failure explanation on tampered block */}
              {isBroken && !isCascadeBroken && (
                <div className="mt-2.5 pt-2 border-t border-rose-900/60 text-xs font-mono text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>{block.break_reason}</span>
                  </div>
                  <div className="text-[11px] text-rose-300/70">
                    Recomputed: <code className="bg-rose-950 px-1 py-0.5 rounded">{truncateHash(block.recomputed_hash)}</code>
                  </div>
                </div>
              )}

              {/* Expanded Forensic Drawer */}
              {isExpanded && (
                <div className="mt-3.5 pt-3 border-t border-slate-800 bg-slate-950/70 p-3.5 rounded-lg text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-slate-300">BLOCK #{block.block_index} FORENSIC CRYPTOGRAPHIC INSPECTOR</span>
                    <span className="text-[10px] text-slate-500">ALGORITHM: SHA-256 (FIPS 180-4)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[11px] mb-1">CANONICAL INPUT STRING (PRE-HASH):</span>
                      <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[10.5px] text-cyan-300 whitespace-pre-wrap break-all select-all">
                        {getCanonicalBlockString(block)}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-500 block text-[11px]">HARDWARE SIGNED HASH:</span>
                        <code className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[10.5px] text-slate-200 block break-all select-all">
                          {block.signature_hash}
                        </code>
                      </div>

                      {block.recomputed_hash && (
                        <div>
                          <span className="text-slate-500 block text-[11px]">CURRENT RECOMPUTED HASH:</span>
                          <code className={`p-1.5 rounded border text-[10.5px] block break-all select-all ${
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

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span>Batt: {Number(block.batt_v).toFixed(2)}V | Power Mode: {block.power_mode} | Enclosure: {block.enclosure}</span>
                    <span className="text-slate-500">Device: {block.device_id || 'VAX-COLD-NODE-09'}</span>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-2">
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ledger state: {isChainIntact ? '100% Cryptographically Intact' : 'CRITICAL INTEGRITY FAILURE'}</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Click 'Simulate Database Tamper Attack' on any row to test zero-trust detection.
        </div>
      </div>
    </div>
  );
}
