import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  Play, 
  Pause, 
  AlertTriangle, 
  ShieldAlert, 
  BatteryLow, 
  GitCompare, 
  CheckCircle,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DEFAULT_TOPIC } from '../services/mqttService';

export function HardwareSimulator({
  isStreaming,
  onToggleStreaming,
  onSendTelemetry,
  mqttConnected,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [publishOverMqtt, setPublishOverMqtt] = useState(true);

  const handleQuickAction = (preset) => {
    onSendTelemetry(preset, publishOverMqtt && mqttConnected);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg overflow-hidden">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-950/40 flex items-center justify-between cursor-pointer select-none border-b border-slate-800"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 m-0">
              Hardware Telemetry Generator & MQTT Transmitter
            </h3>
            <p className="text-xs text-slate-400">
              Simulate IoT edge sensor packets or broadcast directly to <code className="text-cyan-300 font-mono">{DEFAULT_TOPIC}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isStreaming && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              STREAMING (4s)
            </span>
          )}
          <button className="text-slate-400 hover:text-white p-1">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 md:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              {/* Auto-stream Button */}
              <button
                onClick={onToggleStreaming}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all ${
                  isStreaming
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                }`}
              >
                {isStreaming ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Auto-Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Live Auto-Stream</span>
                  </>
                )}
              </button>

              {/* Toggle to push over MQTT */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={publishOverMqtt}
                  onChange={(e) => setPublishOverMqtt(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 w-4 h-4"
                />
                <span>Broadcast to Live HiveMQ Topic</span>
              </label>
            </div>

            <div className="text-slate-400 font-mono text-[11px]">
              {mqttConnected ? (
                <span className="text-emerald-400 font-semibold">● HiveMQ WebSocket Active</span>
              ) : (
                <span className="text-amber-400">○ Connecting to Broker...</span>
              )}
            </div>
          </div>

          {/* Quick Scenario Injectors */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2 font-mono uppercase tracking-wider">
              Inject Test Scenarios (Instant Hardware Packet):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              
              {/* Preset 1: Normal Cold Storage */}
              <button
                onClick={() => handleQuickAction({
                  temp_dht: 4.25,
                  temp_ntc: 4.20,
                  batt_v: 3.06,
                  power_mode: 'ULTRA_LOW_POWER',
                  enclosure: 'VERIFIED_SAFE'
                })}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 transition-colors text-xs text-left"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Normal Safe</div>
                    <div className="text-[10px] text-slate-400 font-mono">4.25°C • Safe</div>
                  </div>
                </div>
                <Send className="w-3 h-3 text-slate-400" />
              </button>

              {/* Preset 2: Temperature Excursion */}
              <button
                onClick={() => handleQuickAction({
                  temp_dht: 11.50,
                  temp_ntc: 11.45,
                  batt_v: 3.05,
                  power_mode: 'EXCURSION_ALERT_TX',
                  enclosure: 'VERIFIED_SAFE'
                })}
                className="flex items-center justify-between p-2.5 rounded-lg border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 text-rose-200 transition-colors text-xs text-left"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-rose-300">Temp Excursion</div>
                    <div className="text-[10px] text-rose-400 font-mono">11.50°C • Spoilage</div>
                  </div>
                </div>
                <Send className="w-3 h-3 text-rose-400" />
              </button>

              {/* Preset 3: Physical Tamper Breach */}
              <button
                onClick={() => handleQuickAction({
                  temp_dht: 5.10,
                  temp_ntc: 5.05,
                  batt_v: 3.04,
                  power_mode: 'TAMPER_INTERRUPT',
                  enclosure: 'TAMPER_BREACH'
                })}
                className="flex items-center justify-between p-2.5 rounded-lg border border-amber-900/60 bg-amber-950/30 hover:bg-amber-950/60 text-amber-200 transition-colors text-xs text-left"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-300">Enclosure Breach</div>
                    <div className="text-[10px] text-amber-400 font-mono">Chassis Opened</div>
                  </div>
                </div>
                <Send className="w-3 h-3 text-amber-400" />
              </button>

              {/* Preset 4: Sensor Drift */}
              <button
                onClick={() => handleQuickAction({
                  temp_dht: 4.20,
                  temp_ntc: 6.85,
                  batt_v: 3.02,
                  power_mode: 'DIAGNOSTIC_DRIFT',
                  enclosure: 'VERIFIED_SAFE'
                })}
                className="flex items-center justify-between p-2.5 rounded-lg border border-purple-900/60 bg-purple-950/30 hover:bg-purple-950/60 text-purple-200 transition-colors text-xs text-left"
              >
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-purple-300">High Drift</div>
                    <div className="text-[10px] text-purple-400 font-mono">Δ 2.65°C Mismatch</div>
                  </div>
                </div>
                <Send className="w-3 h-3 text-purple-400" />
              </button>

              {/* Preset 5: Low Battery */}
              <button
                onClick={() => handleQuickAction({
                  temp_dht: 4.40,
                  temp_ntc: 4.38,
                  batt_v: 2.35,
                  power_mode: 'LOW_BATT_ALERT',
                  enclosure: 'VERIFIED_SAFE'
                })}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 transition-colors text-xs text-left"
              >
                <div className="flex items-center gap-2">
                  <BatteryLow className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Low Coin Battery</div>
                    <div className="text-[10px] text-slate-400 font-mono">2.35 V Critical</div>
                  </div>
                </div>
                <Send className="w-3 h-3 text-slate-400" />
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
