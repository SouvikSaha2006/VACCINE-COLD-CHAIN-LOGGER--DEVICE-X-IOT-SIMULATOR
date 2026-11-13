import React from 'react';
import { AlertOctagon, RotateCcw, ShieldX, KeyRound, ExternalLink } from 'lucide-react';
import { truncateHash } from '../utils/crypto';

export function TamperBanner({ verification, onResetChain, onFocusBlock }) {
  if (verification.isChainIntact) return null;

  const brokenBlock = verification.verifiedBlocks[verification.brokenIndex];
  if (!brokenBlock) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-rose-500 bg-rose-950/70 p-4 md:p-5 shadow-[0_0_35px_rgba(244,63,94,0.4)] transition-all">
      {/* Background cyber alert grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex-shrink-0 animate-pulse">
            <AlertOctagon className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-white uppercase tracking-wider text-sm md:text-base flex items-center gap-1.5">
                <ShieldX className="w-5 h-5 text-rose-400" />
                SECURITY ALERT: CRYPTOGRAPHIC CHAIN FALSIFICATION DETECTED
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-900 border border-rose-600 text-rose-200">
                AUDIT FAILURE AT BLOCK #{brokenBlock.block_index}
              </span>
            </div>

            <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
              Database integrity violation: A recorded metric at <strong>Block #{brokenBlock.block_index}</strong> was modified post-signing.
              {brokenBlock.tampered && brokenBlock.original_temp_dht !== undefined && (
                <span className="text-white font-mono bg-rose-900/60 px-1.5 py-0.5 rounded mx-1 border border-rose-700">
                  Temperature falsified from {brokenBlock.original_temp_dht.toFixed(2)}°C → {Number(brokenBlock.temp_dht).toFixed(2)}°C
                </span>
              )}
              Because SHA-256 signatures are immutable and cryptographically bound to parent hashes, this block and <strong>all subsequent blocks are invalidated</strong>.
            </p>

            <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-rose-300">
              <span>Expected Hash: <code className="text-rose-100 bg-rose-950 px-1 py-0.5 rounded">{truncateHash(brokenBlock.recomputed_hash)}</code></span>
              <span>Signed Hash: <code className="text-rose-100 bg-rose-950 px-1 py-0.5 rounded">{truncateHash(brokenBlock.signature_hash)}</code></span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
          <button
            onClick={() => onFocusBlock(brokenBlock.block_index)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-rose-300" />
            <span>Inspect Breach</span>
          </button>

          <button
            onClick={onResetChain}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-slate-900 hover:bg-slate-200 transition-colors shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-900" />
            <span>Restore Authentic Chain</span>
          </button>
        </div>
      </div>
    </div>
  );
}
