import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { DigitalTwinCryoBox } from './components/DigitalTwinCryoBox';
import { SentinelKpiCards } from './components/SentinelKpiCards';
import { EnvironmentalChart } from './components/EnvironmentalChart';
import { CryptographicAuditTrail } from './components/CryptographicAuditTrail';
import { BatteryDutyCycleAnalyzer } from './components/BatteryDutyCycleAnalyzer';
import { WhoAuditCertificateModal } from './components/WhoAuditCertificateModal';
import { TamperBanner } from './components/TamperBanner';
import { HardwareSimulator } from './components/HardwareSimulator';
import { generateInitialLedger } from './utils/initialLedger';
import { verifyLedgerChain, computeBlockHash, truncateHash } from './utils/crypto';
import { calculateBioPotency } from './utils/arrheniusEngine';
import { downloadWhoCompliancePdf } from './services/pdfService';
import { mqttService, DEFAULT_TOPIC } from './services/mqttService';
import { 
  ShieldAlert, 
  Terminal, 
  X, 
  Flame, 
  Lock,
  Layers,
  Sparkles,
  FileCheck2
} from 'lucide-react';

export default function App() {
  const [blocks, setBlocks] = useState(() => generateInitialLedger());
  const [mqttStatus, setMqttStatus] = useState('DISCONNECTED');
  const [packetCount, setPacketCount] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [focusedBlockIndex, setFocusedBlockIndex] = useState(null);
  
  // Regulatory WHO Certificate Modal & PDF Generation state
  const [isWhoModalOpen, setIsWhoModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Tamper modal state
  const [tamperModalBlock, setTamperModalBlock] = useState(null);
  const [customSpoofTemp, setCustomSpoofTemp] = useState('4.50');

  // Verify chain whenever blocks change
  const verification = useMemo(() => {
    return verifyLedgerChain(blocks);
  }, [blocks]);

  // Current active block (the latest one received in chronological order)
  const currentBlock = useMemo(() => {
    return blocks.length > 0 ? blocks[blocks.length - 1] : null;
  }, [blocks]);

  // Ref to access latest blocks inside MQTT listener without stale closures
  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Connect to MQTT Broker on mount
  useEffect(() => {
    mqttService.connect();

    const unsubStatus = mqttService.onStatusChange((status) => {
      setMqttStatus(status);
    });

    const unsubMessage = mqttService.onMessage((msg) => {
      setPacketCount((c) => c + 1);
      handleIncomingMqttPacket(msg.data);
    });

    return () => {
      unsubStatus();
      unsubMessage();
      mqttService.disconnect();
    };
  }, []);

  // Process incoming MQTT payload
  const handleIncomingMqttPacket = (data) => {
    if (!data || typeof data !== 'object') return;

    const currentList = blocksRef.current;
    const lastBlock = currentList[currentList.length - 1];

    const nextIndex = data.block_index !== undefined ? Number(data.block_index) : (lastBlock ? lastBlock.block_index + 1 : 100);
    
    // Avoid duplicate insertions of identical block_index if already received
    if (currentList.some(b => b.block_index === nextIndex)) {
      return;
    }

    const prevHash = lastBlock ? lastBlock.signature_hash : '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';
    const tempDht = Number(data.temp_dht ?? data.temperature ?? data.temp ?? 4.25);
    const tempNtc = Number(data.temp_ntc ?? (tempDht - (Math.random() * 0.1 - 0.05)));
    const humidity = Number(data.humidity ?? 48.5);
    const battV = Number(data.batt_v ?? data.battery ?? 3.01);
    const powerMode = data.power_mode || 'ULP_DEEP_SLEEP';
    const enclosure = data.enclosure || 'SEALED';
    const timestamp = data.timestamp || new Date().toISOString();

    const newBlock = {
      block_index: nextIndex,
      timestamp,
      temp_dht: tempDht,
      temp_ntc: tempNtc,
      humidity,
      batt_v: battV,
      power_mode: powerMode,
      enclosure,
      device_id: data.device_id || 'VAX-NODE-01',
      prev_hash: prevHash,
    };

    newBlock.signature_hash = data.signature_hash || computeBlockHash(newBlock);
    newBlock.tampered = false;
    newBlock.original_temp_dht = tempDht;
    newBlock.original_temp_ntc = tempNtc;

    setBlocks(prev => [...prev, newBlock]);
  };

  // Auto-stream generator loop
  useEffect(() => {
    let intervalId = null;
    if (isSimulating) {
      intervalId = setInterval(() => {
        const jitter = (Math.random() - 0.48) * 0.25;
        const temp = Number((4.25 + jitter).toFixed(2));
        transmitTelemetry({
          temp_dht: temp,
          temp_ntc: Number((temp - 0.04).toFixed(2)),
          humidity: Number((48.5 + (Math.random() * 2 - 1)).toFixed(1)),
          batt_v: 3.01,
          power_mode: 'ULP_DEEP_SLEEP',
          enclosure: 'SEALED'
        }, true);
      }, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSimulating]);

  // Transmit telemetry helper
  const transmitTelemetry = (payloadOverrides, broadcastMqtt = false) => {
    const currentList = blocksRef.current;
    const lastBlock = currentList[currentList.length - 1];
    const nextIndex = lastBlock ? lastBlock.block_index + 1 : 100;
    const prevHash = lastBlock ? lastBlock.signature_hash : '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';
    const timestamp = new Date().toISOString();

    const candidate = {
      block_index: nextIndex,
      timestamp,
      temp_dht: payloadOverrides.temp_dht ?? 4.25,
      temp_ntc: payloadOverrides.temp_ntc ?? 4.20,
      humidity: payloadOverrides.humidity ?? 48.5,
      batt_v: payloadOverrides.batt_v ?? 3.01,
      power_mode: payloadOverrides.power_mode ?? 'ULP_DEEP_SLEEP',
      enclosure: payloadOverrides.enclosure ?? 'SEALED',
      device_id: 'VAX-NODE-01',
      prev_hash: prevHash,
    };

    const signature = computeBlockHash(candidate);
    candidate.signature_hash = signature;
    candidate.tampered = false;
    candidate.original_temp_dht = candidate.temp_dht;
    candidate.original_temp_ntc = candidate.temp_ntc;

    if (broadcastMqtt && mqttStatus === 'CONNECTED') {
      mqttService.publish(DEFAULT_TOPIC, candidate);
    }

    setBlocks(prev => [...prev, candidate]);
    setPacketCount(c => c + 1);
  };

  // Tamper attack handler:
  // Modifies that block's temperature in-memory (e.g. hiding 12°C spike as 4.5°C)
  const triggerTamperAttack = (blockIndex, falsifiedTemp = 4.50) => {
    setBlocks(prev => {
      return prev.map(b => {
        if (b.block_index === blockIndex) {
          return {
            ...b,
            temp_dht: Number(falsifiedTemp),
            tampered: true,
            original_temp_dht: b.original_temp_dht !== undefined ? b.original_temp_dht : b.temp_dht,
          };
        }
        return b;
      });
    });
    setFocusedBlockIndex(blockIndex);
    setTamperModalBlock(null);
  };

  // Restore single block tamper
  const restoreBlock = (blockIndex) => {
    setBlocks(prev => {
      return prev.map(b => {
        if (b.block_index === blockIndex) {
          return {
            ...b,
            temp_dht: b.original_temp_dht !== undefined ? b.original_temp_dht : b.temp_dht,
            tampered: false,
          };
        }
        return b;
      });
    });
  };

  // Reset entire chain to original clean verified state
  const resetEntireChain = () => {
    setBlocks(generateInitialLedger());
    setFocusedBlockIndex(null);
  };

  // Toggle Lid Tamper on current active block
  const handleToggleLidTamper = () => {
    if (!currentBlock) return;
    const isCurrentlyBreached = currentBlock.enclosure === 'LID BREACHED';
    const newEnclosureState = isCurrentlyBreached ? 'SEALED' : 'LID BREACHED';
    
    // Update or transmit fresh block reflecting lid state
    transmitTelemetry({
      temp_dht: isCurrentlyBreached ? 4.25 : 12.00,
      temp_ntc: isCurrentlyBreached ? 4.20 : 11.85,
      humidity: isCurrentlyBreached ? 48.5 : 62.4,
      batt_v: currentBlock.batt_v,
      power_mode: isCurrentlyBreached ? 'ULP_DEEP_SLEEP' : 'EMERGENCY_MQTT_BURST',
      enclosure: newEnclosureState
    }, true);
  };

  // Export audit ledger to JSON
  const exportLedgerJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      title: 'VaxGuard Zero-Trust Cold-Chain Sentinel Ledger',
      exported_at: new Date().toISOString(),
      node_id: 'VAX-NODE-01',
      hsm_device: 'Microchip ATECC608A',
      is_cryptographically_valid: verification.isChainIntact,
      total_blocks: blocks.length,
      blocks: verification.verifiedBlocks,
    }, null, 2));
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vaxguard_sentinel_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download official 1-page WHO Compliance PDF from FastAPI backend
  const handleDownloadWhoPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const bioPotency = calculateBioPotency(blocks);
      await downloadWhoCompliancePdf({
        blocks,
        isChainIntact: verification.isChainIntact,
        potencyPct: bioPotency.potencyPct,
        remainingHours: bioPotency.remainingHours,
        mktTemp: bioPotency.mktCelsius,
        battV: currentBlock?.batt_v ?? 3.01,
        projectedDays: 184,
        enclosureStatus: currentBlock?.enclosure ?? 'SEALED',
        nodeId: 'VAX-NODE-01',
      });
    } catch (err) {
      console.error('PDF download error:', err);
      alert(`Could not download WHO Compliance Certificate: ${err.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Header with Live Streaming Pulse Badge & One-Click WHO Compliance Pass */}
      <Header
        mqttStatus={mqttStatus}
        packetCount={packetCount}
        isChainIntact={verification.isChainIntact}
        totalVerifiedBlocks={blocks.length}
        onResetChain={resetEntireChain}
        onExportLedger={exportLedgerJson}
        isSimulating={isSimulating}
        onToggleSimulator={() => setIsSimulating(!isSimulating)}
        onOpenWhoModal={() => setIsWhoModalOpen(true)}
        onDownloadPdf={handleDownloadWhoPdf}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-7">
        
        {/* Critical Tamper Alert Banner (if database record was falsified) */}
        <TamperBanner
          verification={verification}
          onResetChain={resetEntireChain}
          onFocusBlock={(idx) => {
            setFocusedBlockIndex(idx);
            const el = document.getElementById(`block-${idx}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />

        {/* PILLAR 1: LIVE TELEMETRY & 3D CRYO-BOX DIGITAL TWIN (Top Hero Section) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                PILLAR 1
              </span>
              <h2 className="text-lg font-bold text-white tracking-wide m-0">
                Live Telemetry & 3D Cryo-Box Digital Twin
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Spatial Holographic Twin • Microchip ATECC608A Connected
            </span>
          </div>

          {/* Interactive 3D/Isometric Cryo-Box Physical Digital Twin */}
          <DigitalTwinCryoBox
            currentBlock={currentBlock}
            isChainIntact={verification.isChainIntact}
            onSimulateLidTamper={handleToggleLidTamper}
          />

          {/* 4 Live Hero KPI Cards: Core Temp, Sensor Drift, RTC Clock, Arrhenius Bio-Potency */}
          <SentinelKpiCards
            currentBlock={currentBlock}
            allBlocks={blocks}
          />
        </section>

        {/* PILLAR 2: GOAL 1 — CONTINUOUS ENVIRONMENTAL METRIC LOGGING */}
        <section className="space-y-4">
          <EnvironmentalChart blocks={blocks} />
        </section>

        {/* PILLAR 3: GOALS 2 & 3 — HARDWARE CRYPTOGRAPHIC HASHING & TAMPER-EVIDENT AUDIT TRAIL */}
        <section className="space-y-4">
          <CryptographicAuditTrail
            verifiedBlocks={verification.verifiedBlocks}
            isChainIntact={verification.isChainIntact}
            onTamperBlock={(blockIndex) => {
              const target = blocks.find(b => b.block_index === blockIndex);
              setTamperModalBlock(target);
              setCustomSpoofTemp('4.50');
            }}
            onRestoreBlock={restoreBlock}
            onResetChain={resetEntireChain}
            focusedBlockIndex={focusedBlockIndex}
          />
        </section>

        {/* PILLAR 4: GOAL 4 & USP — EXTENDED COIN-CELL ENDURANCE & ADAPTIVE DUTY-CYCLE ANALYZER */}
        <section className="space-y-4">
          <BatteryDutyCycleAnalyzer currentBlock={currentBlock} />
        </section>

        {/* Telemetry Hardware Generator Bar */}
        <section className="space-y-4">
          <HardwareSimulator
            isStreaming={isSimulating}
            onToggleStreaming={() => setIsSimulating(!isSimulating)}
            onSendTelemetry={transmitTelemetry}
            mqttConnected={mqttStatus === 'CONNECTED'}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-5 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>VaxGuard Sentinel • Microchip ATECC608A Hardware Security (NIST FIPS 180-4)</span>
          </div>
          <div>
            Live Broker: <code className="text-slate-400">broker.hivemq.com:8884</code> | Topic: <code className="text-cyan-400">{DEFAULT_TOPIC}</code>
          </div>
        </div>
      </footer>

      {/* REGULATORY HANDOFF: ONE-CLICK WHO AUDIT CERTIFICATE MODAL */}
      <WhoAuditCertificateModal
        isOpen={isWhoModalOpen}
        onClose={() => setIsWhoModalOpen(false)}
        blocks={blocks}
        isChainIntact={verification.isChainIntact}
        verification={verification}
        onDownloadPdf={handleDownloadWhoPdf}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* TAMPER ATTACK SIMULATION MODAL */}
      {tamperModalBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-2xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(244,63,94,0.35)] relative">
            <button 
              onClick={() => setTamperModalBlock(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wide">
                  Simulate Database Tamper Attack
                </h3>
                <p className="text-xs text-rose-300/80 font-mono">
                  Target: Block #{tamperModalBlock.block_index}
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Hardware Signed Temp:</span>
                <span className="text-white font-bold">{Number(tamperModalBlock.temp_dht).toFixed(2)}°C</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ATECC608A Hardware Signature:</span>
                <span className="text-cyan-300">{truncateHash(tamperModalBlock.signature_hash)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Parent Hash Link:</span>
                <span className="text-slate-300">{truncateHash(tamperModalBlock.prev_hash)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              In cold-chain fraud, an attacker modifies historical temperature rows in the central database (e.g. concealing a <strong className="text-rose-400">12.00°C</strong> thermal excursion as <strong className="text-emerald-400">4.50°C</strong>). When VaxGuard audits the chain, the re-computed SHA-256 hash diverges, immediately flagging this block and all forward blocks.
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Falsified Temperature to Inject into Database (°C):
              </label>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={customSpoofTemp}
                  onChange={(e) => setCustomSpoofTemp(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  placeholder="4.50"
                />
                
                <button
                  onClick={() => setCustomSpoofTemp('4.50')}
                  className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-mono font-semibold"
                >
                  Preset 4.50°C (Hide 12°C Spike)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setTamperModalBlock(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => triggerTamperAttack(tamperModalBlock.block_index, parseFloat(customSpoofTemp) || 4.50)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all"
              >
                <Terminal className="w-4 h-4" />
                <span>Execute Tamper Attack</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
