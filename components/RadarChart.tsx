import React from 'react';

interface RadarChartProps {
  data: {
    label: string;
    value: number; // 0-100
  }[];
  size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, size = 300 }) => {
  const center = size / 2;
  const radius = (size / 2) - 40; // Padding for labels
  const numPoints = data.length;

  const getPoint = (value: number, index: number, maxRadius: number) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = data.map((d, i) => {
    const { x, y } = getPoint(d.value, i, radius);
    return `${x},${y}`;
  }).join(' ');

  // Background webs (20%, 40%, 60%, 80%, 100%)
  const webs = [0.2, 0.4, 0.6, 0.8, 1].map((scale) => {
    return data.map((_, i) => {
      const { x, y } = getPoint(100 * scale, i, radius);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <div className="flex justify-center items-center py-4 relative">
      <svg width={size} height={size} className="overflow-visible">
        {/* Glow Filter */}
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Web */}
        {webs.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#27272a" // zinc-800
            strokeWidth="1"
            className="opacity-50"
          />
        ))}

        {/* Axis Lines */}
        {data.map((_, i) => {
          const { x, y } = getPoint(100, i, radius);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#27272a"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon (Filled) */}
        <polygon
          points={polygonPoints}
          fill="rgba(139, 92, 246, 0.3)" // brand-primary/30
          stroke="#8B5CF6" // brand-primary
          strokeWidth="2"
          filter="url(#glow)"
          className="transition-all duration-1000 ease-out animate-pulse-slow"
        />

        {/* Data Points (Dots) */}
        {data.map((d, i) => {
          const { x, y } = getPoint(d.value, i, radius);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#fff"
              stroke="#8B5CF6"
              strokeWidth="2"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
            // Push labels out a bit further
            const { x, y } = getPoint(120, i, radius); 
            
            // Explicitly type these variables to avoid TS inference errors
            let anchor: 'start' | 'middle' | 'end' = 'middle';
            let baseline: 'auto' | 'middle' | 'hanging' = 'middle';

            // Anchor adjustment logic to prevent overlap
            if (Math.abs(x - center) < 5) anchor = "middle";
            else if (x > center) anchor = "start";
            else anchor = "end";

            if (Math.abs(y - center) < 5) baseline = "middle";
            else if (y < center) baseline = "auto"; // top
            else baseline = "hanging"; // bottom

          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="#a1a1aa" // zinc-400
              fontSize="10"
              fontWeight="bold"
              textAnchor={anchor}
              alignmentBaseline={baseline}
              className="uppercase tracking-wider"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
      
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-brand-primary/5 blur-3xl -z-10 rounded-full"></div>
    </div>
  );
};

export default RadarChart;