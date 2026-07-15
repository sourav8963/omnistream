import React from 'react';

interface SpeedGraphProps {
  speedHistory: number[];
}

export const SpeedGraph: React.FC<SpeedGraphProps> = ({ speedHistory }) => {
  // Width and height of the SVG graph box
  const width = 500;
  const height = 110;
  const padding = 5;

  const maxSpeed = Math.max(...speedHistory, 5 * 1024 * 1024); // at least 5MB/s scale

  const points = speedHistory.map((speed, index) => {
    // Distribute X points evenly across width
    const x = padding + (index / (speedHistory.length - 1)) * (width - padding * 2);
    // Y represents speed, inverted (0 speed is at the bottom: height - padding)
    const y = (height - padding) - (speed / maxSpeed) * (height - padding * 2);
    return { x, y };
  });

  // Construct SVG Path for the outline line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Construct SVG Path for the filled gradient area underneath
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(height - padding).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - padding).toFixed(1)} Z`
    : '';

  const formatSpeedText = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(0)} MB/s`;
    return `${(bytes / 1024).toFixed(0)} KB/s`;
  };

  const currentSpeed = speedHistory[speedHistory.length - 1] || 0;
  const lastPoint = points[points.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>BANDWIDTH UTILIZATION</span>
        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
          Peak: {formatSpeedText(maxSpeed)}
        </span>
      </div>

      <div style={{
        background: 'var(--input-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        padding: '0.5rem',
        height: `${height + 15}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden'
      }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            {/* Gradient for area under line */}
            <linearGradient id="speedAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.00" />
            </linearGradient>
            
            {/* Grid Line Pattern */}
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Horizontal guidelines */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />

          {/* Area Fill */}
          {areaPath && <path d={areaPath} fill="url(#speedAreaGradient)" />}

          {/* Outline Line */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="var(--accent)" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Glowing dot for current speed */}
          {lastPoint && currentSpeed > 0 && (
            <>
              {/* Outer pulsing ring */}
              <circle 
                cx={lastPoint.x} 
                cy={lastPoint.y} 
                r="7" 
                fill="var(--accent)" 
                opacity="0.4"
                className="animate-pulse-glow"
              />
              {/* Inner solid dot */}
              <circle 
                cx={lastPoint.x} 
                cy={lastPoint.y} 
                r="3.5" 
                fill="#ffffff" 
                stroke="var(--accent)" 
                strokeWidth="2.5"
              />
            </>
          )}
        </svg>

        {/* Current Speed Indicator Badge overlay */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'var(--accent)',
          color: '#ffffff',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: 'var(--shadow-glow)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#fff',
            display: 'inline-block',
            animation: 'pulse-glow 1s infinite'
          }}></span>
          <span>{formatSpeedText(currentSpeed)}</span>
        </div>
      </div>
    </div>
  );
};
