'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from 'recharts';

export interface ChartSpec {
  type: 'line' | 'bar' | 'pie' | 'xmr';
  title: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  xLabel?: string;
  yLabel?: string;
}

interface XMRDataPoint {
  [key: string]: string | number | undefined;
  movingRange?: number;
}

interface XMRStats {
  mean: number;
  mrMean: number;
  ucl: number;
  lcl: number;
  mrUcl: number;
}

function calculateXMRStats(data: Array<Record<string, string | number>>, yKey: string): { processedData: XMRDataPoint[], stats: XMRStats } {
  const values = data.map(d => Number(d[yKey]) || 0);

  // Calculate mean
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

  // Calculate moving ranges
  const movingRanges: number[] = [];
  const processedData: XMRDataPoint[] = data.map((d, i) => {
    const point: XMRDataPoint = { ...d };
    if (i > 0) {
      const mr = Math.abs(values[i] - values[i - 1]);
      movingRanges.push(mr);
      point.movingRange = mr;
    }
    return point;
  });

  // Calculate average moving range
  const mrMean = movingRanges.length > 0
    ? movingRanges.reduce((sum, v) => sum + v, 0) / movingRanges.length
    : 0;

  // Control limits using d2 constant (2.66 for n=2)
  const d2 = 2.66;
  const ucl = mean + d2 * mrMean;
  const lcl = mean - d2 * mrMean;

  // MR chart upper control limit (D4 = 3.267 for n=2)
  const mrUcl = 3.267 * mrMean;

  return {
    processedData,
    stats: { mean, mrMean, ucl, lcl, mrUcl }
  };
}

interface ChatChartProps {
  spec: ChartSpec;
}

const COLORS = ['#FFDE00', '#6FC2FF', '#53DBC9', '#FF7169', '#2BA5FF', '#F4EFEA'];

export default function ChatChart({ spec }: ChatChartProps) {
  const { type, title, data, xKey, yKey } = spec;

  const formatValue = (value: number): string => {
    if (typeof value !== 'number') return String(value);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    if (value % 1 !== 0) return value.toFixed(2);
    return value.toLocaleString();
  };

  const commonProps = {
    data,
    margin: { top: 5, right: 20, left: 10, bottom: 5 },
  };

  const tooltipStyle = {
    background: '#FFFFFF',
    border: '2px solid #383838',
    borderRadius: '2px',
  };

  if (type === 'xmr') {
    return (
      <div className="chat-chart">
        <div className="chat-chart-title">{title}</div>
        <XMRChart data={data} xKey={xKey} yKey={yKey} formatValue={formatValue} tooltipStyle={tooltipStyle} />
      </div>
    );
  }

  return (
    <div className="chat-chart">
      <div className="chat-chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        {type === 'line' ? (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A1A1A1" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10 }} stroke="#383838" />
            <YAxis tick={{ fontSize: 10 }} stroke="#383838" tickFormatter={formatValue} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatValue(value)} />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#2BA5FF"
              strokeWidth={2}
              dot={{ fill: '#2BA5FF', r: 3 }}
              activeDot={{ r: 5, fill: '#FFDE00', stroke: '#383838', strokeWidth: 2 }}
            />
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A1A1A1" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10 }} stroke="#383838" />
            <YAxis tick={{ fontSize: 10 }} stroke="#383838" tickFormatter={formatValue} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatValue(value)} />
            <Bar dataKey={yKey} fill="#FFDE00" stroke="#383838" strokeWidth={1} radius={[2, 2, 0, 0]} />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={70}
              stroke="#383838"
              strokeWidth={1}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#383838' }}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatValue(value)} />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function XMRChart({
  data,
  xKey,
  yKey,
  formatValue,
  tooltipStyle
}: {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  formatValue: (value: number) => string;
  tooltipStyle: React.CSSProperties;
}) {
  const { processedData, stats } = calculateXMRStats(data, yKey);

  return (
    <div className="xmr-chart-container">
      <div className="xmr-chart-section">
        <div className="xmr-chart-label">Individual Values (X)</div>
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={processedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A1A1A1" />
            <XAxis dataKey={xKey} tick={{ fontSize: 9 }} stroke="#383838" />
            <YAxis tick={{ fontSize: 9 }} stroke="#383838" tickFormatter={formatValue} domain={['auto', 'auto']} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatValue(value)} />
            <ReferenceLine y={stats.ucl} stroke="#FF7169" strokeDasharray="5 5" label={{ value: 'UCL', fontSize: 9, fill: '#FF7169' }} />
            <ReferenceLine y={stats.mean} stroke="#53DBC9" strokeWidth={2} label={{ value: 'X\u0305', fontSize: 9, fill: '#53DBC9' }} />
            <ReferenceLine y={stats.lcl} stroke="#FF7169" strokeDasharray="5 5" label={{ value: 'LCL', fontSize: 9, fill: '#FF7169' }} />
            <Line
              type="linear"
              dataKey={yKey}
              stroke="#2BA5FF"
              strokeWidth={2}
              dot={{ fill: '#2BA5FF', r: 3 }}
              activeDot={{ r: 5, fill: '#FFDE00', stroke: '#383838', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="xmr-chart-section">
        <div className="xmr-chart-label">Moving Range (MR)</div>
        <ResponsiveContainer width="100%" height={100}>
          <ComposedChart data={processedData.slice(1)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A1A1A1" />
            <XAxis dataKey={xKey} tick={{ fontSize: 9 }} stroke="#383838" />
            <YAxis tick={{ fontSize: 9 }} stroke="#383838" tickFormatter={formatValue} domain={[0, 'auto']} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatValue(value)} />
            <ReferenceLine y={stats.mrUcl} stroke="#FF7169" strokeDasharray="5 5" label={{ value: 'UCL', fontSize: 9, fill: '#FF7169' }} />
            <ReferenceLine y={stats.mrMean} stroke="#53DBC9" strokeWidth={2} label={{ value: 'MR\u0305', fontSize: 9, fill: '#53DBC9' }} />
            <Line
              type="linear"
              dataKey="movingRange"
              stroke="#6FC2FF"
              strokeWidth={2}
              dot={{ fill: '#6FC2FF', r: 3 }}
              activeDot={{ r: 5, fill: '#FFDE00', stroke: '#383838', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="xmr-stats">
        <span>X\u0305: {formatValue(stats.mean)}</span>
        <span>UCL: {formatValue(stats.ucl)}</span>
        <span>LCL: {formatValue(stats.lcl)}</span>
        <span>MR\u0305: {formatValue(stats.mrMean)}</span>
      </div>
    </div>
  );
}
