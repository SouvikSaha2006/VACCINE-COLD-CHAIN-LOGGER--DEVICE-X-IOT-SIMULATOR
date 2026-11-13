import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { LineChart as ChartIcon, Shield, Droplets, Thermometer, Eye } from 'lucide-react';

export function EnvironmentalChart({ blocks }) {
  const [showHumidity, setShowHumidity] = useState(true);

  // Map blocks to chart records
  const chartData = useMemo(() => {
    return blocks.map((b) => {
      const timeStr = b.timestamp 
        ? new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
        : `#${b.block_index}`;
      
      const dht = Number(Number(b.temp_dht).toFixed(2));
      const ntc = Number(Number(b.temp_ntc).toFixed(2));
      const hum = Number(Number(b.humidity ?? 48.5).toFixed(1));

      return {
        block_index: b.block_index,
        label: `#${b.block_index} (${timeStr})`,
        time: timeStr,
        temp_dht: dht,
        temp_ntc: ntc,
        humidity: hum,
        drift: Math.abs(dht - ntc).toFixed(2),
        isSafe: dht >= 2.0 && dht <= 8.0,
        tampered: b.tampered || false,
        original_temp: b.original_temp_dht,
      };
    });
  }, [blocks]);

  // Dynamic Y-axis temperature domain
  const yDomainTemp = useMemo(() => {
    if (!chartData.length) return [0, 14];
    const temps = chartData.flatMap(d => [d.temp_dht, d.temp_ntc]).filter(t => !isNaN(t));
    const minVal = Math.min(...temps, 1.0);
    const maxVal = Math.max(...temps, 9.0);
    return [Math.floor(minVal - 1), Math.ceil(maxVal + 1.5)];
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isExcursion = !data.isSafe;

      return (
        <div className="bg-slate-900/95 border border-slate-700/90 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs font-mono min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-white">Block #{data.block_index}</span>
            <span className="text-slate-400">{data.time}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                DHT22 Core:
              </span>
              <span className="font-bold text-white text-sm">{data.temp_dht}°C</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-purple-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                NTC Probe:
              </span>
              <span className="font-bold text-white text-sm">{data.temp_ntc}°C</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                Humidity:
              </span>
              <span className="font-bold text-blue-200 text-sm">{data.humidity}% RH</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Sensor Drift:</span>
              <span className="text-slate-300">Δ {data.drift}°C</span>
            </div>

            {data.tampered && (
              <div className="pt-1 text-rose-400 text-[11px] font-sans">
                ⚠ Record Falsified! (Orig: {data.original_temp}°C)
              </div>
            )}

            <div className="pt-1.5">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                !isExcursion
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {!isExcursion ? 'WHO SAFE ZONE (+2°C to +8°C)' : 'EXCURSION PROTOCOL ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 md:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              GOAL 1
            </span>
            <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2 m-0">
              <ChartIcon className="w-5 h-5 text-cyan-400" />
              Continuous Environmental Metric Logging
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time DHT22, NTC thermistor, and humidity logging with shaded <strong className="text-emerald-400">2.0°C – 8.0°C WHO Safe Zone</strong>
          </p>
        </div>

        {/* Legend pills & toggle */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-300">DHT22 Core</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-purple-300">NTC Probe</span>
          </div>

          <button
            onClick={() => setShowHumidity(!showHumidity)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              showHumidity 
                ? 'bg-blue-950/50 border-blue-700 text-blue-300' 
                : 'bg-slate-800/40 border-slate-700 text-slate-500'
            }`}
            title="Toggle humidity trace"
          >
            <Droplets className="w-3 h-3 text-blue-400" />
            <span>Humidity (%)</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">Safe Ribbon</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            
            <XAxis 
              dataKey="label" 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
            />
            
            {/* Primary Y-Axis: Temperature (°C) */}
            <YAxis 
              yAxisId="temp"
              domain={yDomainTemp} 
              stroke="#64748b" 
              unit="°C"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
            />

            {/* Secondary Y-Axis: Humidity (% RH) */}
            {showHumidity && (
              <YAxis 
                yAxisId="humidity"
                orientation="right"
                domain={[20, 90]}
                unit="%"
                stroke="#3b82f6" 
                tick={{ fill: '#3b82f6', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#1d4ed8' }}
              />
            )}

            {/* Shaded Safe Zone Ribbon between 2°C and 8°C */}
            <ReferenceArea 
              yAxisId="temp"
              y1={2.0} 
              y2={8.0} 
              fill="#10b981" 
              fillOpacity={0.08}
              strokeOpacity={0}
            />

            {/* Reference Line at 8.0°C Upper Threshold */}
            <ReferenceLine 
              yAxisId="temp"
              y={8.0} 
              stroke="#10b981" 
              strokeWidth={1.5}
              strokeDasharray="5 5" 
              label={{ 
                value: '8.0°C Safe Max', 
                position: 'insideTopRight', 
                fill: '#34d399', 
                fontSize: 10,
                fontFamily: 'monospace',
                offset: 5
              }} 
            />

            {/* Reference Line at 2.0°C Lower Threshold */}
            <ReferenceLine 
              yAxisId="temp"
              y={2.0} 
              stroke="#10b981" 
              strokeWidth={1.5}
              strokeDasharray="5 5" 
              label={{ 
                value: '2.0°C Safe Min', 
                position: 'insideBottomRight', 
                fill: '#34d399', 
                fontSize: 10,
                fontFamily: 'monospace',
                offset: 5
              }} 
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Line: DHT22 Core Temp */}
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp_dht"
              name="DHT22 Core"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={{ r: 4, stroke: '#0891b2', strokeWidth: 2, fill: '#06b6d4' }}
              activeDot={{ r: 6, stroke: '#ecfeff', strokeWidth: 2 }}
              isAnimationActive={true}
            />

            {/* Line: NTC Thermistor */}
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp_ntc"
              name="NTC Thermistor"
              stroke="#a855f7"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 3, stroke: '#7e22ce', strokeWidth: 1.5, fill: '#a855f7' }}
              activeDot={{ r: 5, stroke: '#faf5ff', strokeWidth: 2 }}
              isAnimationActive={true}
            />

            {/* Optional Line: Humidity */}
            {showHumidity && (
              <Line
                yAxisId="humidity"
                type="monotone"
                dataKey="humidity"
                name="Relative Humidity"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={{ r: 2, stroke: '#2563eb', fill: '#60a5fa' }}
                isAnimationActive={true}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-center text-[11px] text-slate-500 font-mono">
        WHO PQS Continuous Logging: <span className="text-emerald-400 font-semibold">+2.00°C to +8.00°C</span>. Secondary RH channel active with cross-sensor differential drift analysis.
      </div>
    </div>
  );
}
