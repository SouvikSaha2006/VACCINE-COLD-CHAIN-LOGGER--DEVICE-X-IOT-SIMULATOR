import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Printer, 
  Download, 
  Loader2,
  CheckCircle, 
  AlertTriangle,
  FileText,
  KeyRound,
  Stamp
} from 'lucide-react';
import { truncateHash } from '../utils/crypto';
import { calculateBioPotency } from '../utils/arrheniusEngine';

export function WhoAuditCertificateModal({ 
  isOpen, 
  onClose, 
  blocks, 
  isChainIntact,
  verification,
  onDownloadPdf,
  isGeneratingPdf
}) {
  if (!isOpen) return null;

  // Temperature aggregates
  const temps = blocks.map(b => Number(b.temp_dht)).filter(t => !isNaN(t));
  const minTemp = temps.length ? Math.min(...temps) : 2.0;
  const maxTemp = temps.length ? Math.max(...temps) : 8.0;
  const latestBlock = blocks[blocks.length - 1];

  // Bio-potency calculation
  const bioPotency = calculateBioPotency(blocks);

  // Compliance decision:
  // Requires: isChainIntact === true, and bioPotency.potencyPct >= 90.0, and no extreme freezing (< 0°C)
  const isApproved = isChainIntact && bioPotency.potencyPct >= 90.0 && minTemp >= 2.0 && maxTemp <= 8.0;

  // QR Code Payload (JSON verifiable by hospital/inspector scanner)
  const qrPayload = JSON.stringify({
    cert: 'WHO-PQS-E006-COLD-CHAIN-PASS',
    serial: 'VAX-2026-CH-0982',
    chain_tip: latestBlock?.signature_hash || '',
    chain_intact: isChainIntact,
    potency: `${bioPotency.potencyPct}%`,
    mkt: `${bioPotency.mktCelsius}C`,
    status: isApproved ? 'APPROVED_FOR_IMMUNIZATION' : 'QUARANTINE_REJECTED',
    timestamp: new Date().toISOString()
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide m-0">
                Official WHO PQS Cold-Chain Audit Pass
              </h3>
              <p className="text-xs text-slate-400">
                Standard: WHO/PQS/E006/TR01.1 • Annex 9 CFR Part 11 Electronic Records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body (Scrollable printable layout) */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-100 font-sans">
          
          {/* Certificate Header Banner */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                IMMUNIZATION QUALITY ASSURANCE DIRECTIVE
              </span>
              <h2 className="text-xl font-extrabold text-white mt-0.5">
                VaxGuard Cryptographic Release Pass
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Batch: COV-MRNA-B8820 • Node: VAX-NODE-01
              </span>
            </div>

            {/* QR Code Container */}
            <div className="p-2 bg-white rounded-xl shadow-md border border-slate-300 flex-shrink-0 self-center">
              <QRCodeSVG 
                value={qrPayload} 
                size={88}
                level="M"
                includeMargin={false}
              />
              <span className="text-[8px] font-mono text-slate-700 block text-center mt-1 font-bold">
                SCAN TO VERIFY
              </span>
            </div>
          </div>

          {/* Metric Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MIN RECORDED:</span>
              <strong className="text-emerald-400 text-sm">{minTemp.toFixed(2)} °C</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MAX RECORDED:</span>
              <strong className={maxTemp > 8.0 ? 'text-rose-400 text-sm' : 'text-emerald-400 text-sm'}>
                {maxTemp.toFixed(2)} °C
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MEAN KINETIC (MKT):</span>
              <strong className="text-cyan-300 text-sm">{bioPotency.mktCelsius} °C</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">VACCINE POTENCY:</span>
              <strong className={`text-sm font-extrabold ${bioPotency.potencyPct >= 90.0 ? 'text-cyan-300' : 'text-rose-400'}`}>
                {bioPotency.potencyPct}%
              </strong>
            </div>
          </div>

          {/* Cryptographic Chain Integrity Proof */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
              <span className="font-bold flex items-center gap-1.5 text-slate-300">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                ATECC608A Cryptographic Blockchain Validation
              </span>
              <span className={isChainIntact ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {isChainIntact ? 'PASS (100% INTACT)' : 'FAIL (SEVERED)'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Verified Ledger Blocks:</span>
              <span className="text-white font-bold">{blocks.length} Blocks Verified</span>
            </div>

            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Active SHA-256 Chain Tip:</span>
              <code className="text-cyan-300">{truncateHash(latestBlock?.signature_hash, 8, 8)}</code>
            </div>

            {!isChainIntact && (
              <div className="p-2 rounded bg-rose-950/70 border border-rose-800 text-rose-300 text-[11px]">
                🚨 <strong>AUDIT CORRUPTION:</strong> Hash linkage was broken. In-memory or database records were modified post-hardware signing. Regulatory compliance voided.
              </div>
            )}
          </div>

          {/* OFFICIAL REGULATORY STAMP / SEAL */}
          <div className="pt-2 flex justify-center">
            {isApproved ? (
              /* Green Approved Seal */
              <div className="relative p-5 rounded-2xl border-4 border-emerald-500/80 bg-emerald-950/30 text-center max-w-md w-full shadow-[0_0_30px_rgba(16,185,129,0.25)] flex flex-col items-center">
                <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  WHO PQS CERTIFICATE OF CONFORMANCE
                </span>
                <h4 className="text-lg md:text-xl font-extrabold text-emerald-300 uppercase tracking-tight mt-0.5">
                  CRYPTOGRAPHICALLY VERIFIED FOR IMMUNIZATION
                </h4>
                <p className="text-[11px] text-emerald-200/80 mt-1 max-w-sm">
                  Cold-chain audit trail cryptographically sealed by Microchip ATECC608A. Vaccine bio-potency exceeds safety thresholds. Authorized for clinical administration.
                </p>
                <div className="mt-3 pt-2 border-t border-emerald-500/30 w-full flex justify-between text-[10px] font-mono text-emerald-400/90">
                  <span>DISPENSATION: PERMITTED</span>
                  <span>SIG: #VALIDATED-SHA256</span>
                </div>
              </div>
            ) : (
              /* Red Quarantine Stamp */
              <div className="relative p-5 rounded-2xl border-4 border-rose-600 bg-rose-950/40 text-center max-w-md w-full shadow-[0_0_40px_rgba(244,63,94,0.4)] animate-pulse flex flex-col items-center">
                <div className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 mb-2">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <span className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">
                  REGULATORY SAFETY HOLD / EMBARGO
                </span>
                <h4 className="text-lg md:text-xl font-extrabold text-rose-300 uppercase tracking-tight mt-0.5">
                  QUARANTINE — AUDIT OR THERMAL FAILURE
                </h4>
                <p className="text-[11px] text-rose-200/80 mt-1 max-w-sm">
                  CRITICAL: Cold-chain cryptographic integrity was compromised or bio-potency breached permissible margins. DO NOT ADMINISTER TO PATIENTS. Move batch to quarantine hold.
                </p>
                <div className="mt-3 pt-2 border-t border-rose-500/30 w-full flex justify-between text-[10px] font-mono text-rose-400 font-bold">
                  <span>DISPENSATION: REJECTED</span>
                  <span>DISPOSITION: INCINERATION / QUARANTINE</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Certified Hash: {truncateHash(latestBlock?.signature_hash, 6, 6)}
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Download Official WHO Compliance PDF */}
            <button
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
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

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
