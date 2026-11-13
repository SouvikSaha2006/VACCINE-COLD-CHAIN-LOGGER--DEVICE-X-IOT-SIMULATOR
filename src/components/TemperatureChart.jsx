import React, { useMemo } from 'react';
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
import { LineChart as ChartIcon, Shield, AlertTriangle } from 'lucide-react';

export function TemperatureChart({ blocks }) {
  // Format data for Recharts (most recent points, sorted chronologically)
  const chartData = useMemo(() => {
    return blocks.map((b) => {
      const timeStr = b.timestamp ? new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `#${b.block_index}`;
      return {
        block_index: b.block_index,
        label: `#${b.block_index} (${timeStr})`,
        time: timeStr,
        temp_dht: Number(Number(b.temp_dht).toFixed(2)),
        temp_ntc: Number(Number(b.temp_ntc).toFixed(2)),
        drift: Math.abs(Number(b.temp_dht) - Number(b.temp_ntc)).toFixed(2),
        isSafe: Number(b.temp_dht) >= 2.0 && Number(b.temp_dht) <= 8.0,
        tampered: b.tampered || false,
        original_temp: b.original_temp_dht,
      };
    });
  }, [blocks]);

  // Compute dynamic domain with some padding around 0°C to 14°C
  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 14];
    const temps = chartData.flatMap(d => [d.temp_dht, d.temp_ntc]).filter(t => !isNaN(t));
    const minVal = Math.min(...temps, 1.0);
    const maxVal = Math.max(...temps, 9.0);
    return [Math.floor(minVal - 1), Math.ceil(maxVal + 1.5)];
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isExcursion = !data.isSafe;

      return (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-lg p-3 shadow-xl backdrop-blur-md text-xs font-mono min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-white">Block #{data.block_index}</span>
            <span className="text-slate-400">{data.time}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                DHT22:
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

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Probe Drift:</span>
              <span className="text-slate-300">Δ {data.drift}°C</span>
            </div>

            {data.tampered && (
              <div className="pt-1 mt-1 border-t border-rose-900/60 text-rose-400 text-[11px] font-sans flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                <span>Record Altered! (Original: {data.original_temp}°C)</span>
              </div>
            )}

            <div className="pt-1">
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${
                !isExcursion
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {!isExcursion ? 'SAFE ZONE (2-8°C)' : 'COLD-CHAIN BREACH'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 md:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2 m-0">
            <ChartIcon className="w-5 h-5 text-cyan-400" />
            Live Cold-Chain Temperature Trend
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time dual telemetry with shaded <strong className="text-emerald-400">2.0°C – 8.0°C WHO Safe Zone</strong>
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-300">DHT22 Digital</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-purple-300">NTC Thermistor</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">Safe Ribbon (2-8°C)</span>
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
            
            <YAxis 
              domain={yDomain} 
              stroke="#64748b" 
              unit="°C"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
            />

            {/* Shaded Safe Zone Ribbon between 2°C and 8°C */}
            <ReferenceArea 
              y1={2.0} 
              y2={8.0} 
              fill="#10b981" 
              fillOpacity={0.08}
              strokeOpacity={0}
            />

            {/* Reference Line at 8°C Upper Threshold */}
            <ReferenceLine 
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

            {/* Reference Line at 2°C Lower Threshold */}
            <ReferenceLine 
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

            {/* Line: DHT22 Sensor */}
            <Line
              type="monotone"
              dataKey="temp_dht"
              name="DHT22 Sensor"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={{ r: 4, stroke: '#0891b2', strokeWidth: 2, fill: '#06b6d4' }}
              activeDot={{ r: 6, stroke: '#ecfeff', strokeWidth: 2 }}
              isAnimationActive={true}
            />

            {/* Line: NTC Thermistor Probe */}
            <Line
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-center text-[11px] text-slate-500 font-mono">
        Vaccine safe preservation band: <span className="text-emerald-400 font-semibold">+2.00°C to +8.00°C</span>. Real-time sensor synchronization interval: 2-5 sec.
      </div>
    </div>
  );
}
