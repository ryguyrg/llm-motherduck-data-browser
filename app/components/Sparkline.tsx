'use client';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

export default function Sparkline({
  data,
  width = 80,
  height = 20,
  strokeColor = '#2BA5FF',
  fillColor = 'rgba(43, 165, 255, 0.1)',
  strokeWidth = 1.5,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <span className="sparkline-empty">-</span>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Add padding to prevent clipping at edges
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate points for the polyline
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // Generate path for the fill area
  const fillPoints = [
    `${padding},${height - padding}`,
    ...data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return `${x},${y}`;
    }),
    `${width - padding},${height - padding}`,
  ].join(' ');

  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Fill area */}
      <polygon
        points={fillPoints}
        fill={fillColor}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length > 0 && (
        <circle
          cx={width - padding}
          cy={padding + chartHeight - ((data[data.length - 1] - min) / range) * chartHeight}
          r={2}
          fill={strokeColor}
        />
      )}
    </svg>
  );
}

// Parse sparkline syntax: sparkline(1,2,3,4,5)
export function parseSparklineData(text: string): number[] | null {
  const match = text.match(/^sparkline\(([\d.,\s-]+)\)$/);
  if (!match) return null;

  const values = match[1]
    .split(',')
    .map(v => parseFloat(v.trim()))
    .filter(v => !isNaN(v));

  return values.length >= 2 ? values : null;
}
