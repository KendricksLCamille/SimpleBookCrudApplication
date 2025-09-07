import React, {useEffect, useMemo, useRef, useState} from 'react';
import {API_URL, type BookStats} from '../types';

type ChartType = 'bar' | 'pie';

function useFetchStats() {
  const [data, setData] = useState<BookStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${API_URL}/api/books/stats`).then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }).then((json) => {
      if (mounted) {
        setData(json as BookStats);
        setError(null);
      }
    }).catch((e: unknown) => {
      if (mounted) setError(String(e));
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { data, error, loading } as const;
}

function drawBarChart(ctx: CanvasRenderingContext2D, stats: BookStats, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  const entries = Object.entries(stats);
  if (entries.length === 0) return;
  const padding = 32;
  const barGap = 16;
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;
  const maxVal = Math.max(...entries.map(([, v]) => v));
  const barWidth = (plotW - barGap * (entries.length - 1)) / entries.length;

  // axes
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const colors = entries.map((_, i) => `hsl(${(i * 57) % 360} 70% 55%)`);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '12px system-ui, sans-serif';

  entries.forEach(([label, value], i) => {
    const x = padding + i * (barWidth + barGap);
    const h = maxVal === 0 ? 0 : (value / maxVal) * (plotH - 20);
    const y = height - padding - h;
    ctx.fillStyle = colors[i];
    ctx.fillRect(x, y, barWidth, h);

    // label
    ctx.fillStyle = '#333';
    const textX = x + barWidth / 2;
    ctx.fillText(label, textX, height - padding + 4);
    ctx.fillText(String(value), textX, y - 14);
  });
}

function drawPieChart(ctx: CanvasRenderingContext2D, stats: BookStats, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  const entries = Object.entries(stats);
  if (entries.length === 0) return;
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const cx = width / 2, cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  let start = -Math.PI / 2;
  const colors = entries.map((_, i) => `hsl(${(i * 57) % 360} 70% 55%)`);

  entries.forEach(([label, value], i) => {
    const angle = total === 0 ? 0 : (value / total) * Math.PI * 2;
    const end = start + angle;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();

    // simple label
    const mid = (start + end) / 2;
    const lx = cx + Math.cos(mid) * (radius + 14);
    const ly = cy + Math.sin(mid) * (radius + 14);
    ctx.fillStyle = '#333';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = lx < cx ? 'right' : 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${label} (${value})`, lx, ly);

    start = end;
  });
}

export default function Statistic() {
  const { data, error, loading } = useFetchStats();
  const [chart, setChart] = useState<ChartType>('bar');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    setDpr(Math.max(1, Math.min(2, window.devicePixelRatio || 1)));
  }, []);

  const entries = useMemo(() => Object.entries(data ?? {}), [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (chart === 'bar') drawBarChart(ctx, data, width, height);
    else drawPieChart(ctx, data, width, height);
  }, [data, chart, dpr]);

  if (loading) return <p>Loading stats...</p>;
  if (error) return <p role="alert">Failed to load stats: {error}</p>;
  if (!data || entries.length === 0) return <p>No statistics available.</p>;

  return (
    <div style={{display: 'grid', gap: 12}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <span style={{minWidth: 60}}>Chart:</span>
        <button
          aria-label="Toggle Chart"
          onClick={() => setChart((c) => c === 'bar' ? 'pie' : 'bar')}
          style={{
            position: 'relative', width: 120, height: 36, borderRadius: 18, border: '1px solid #ccc',
            background: chart === 'bar' ? 'linear-gradient(90deg,#4caf50,#81c784)' : 'linear-gradient(90deg,#42a5f5,#90caf9)',
            color: 'white', transition: 'all 250ms ease',
          }}
        >
          <span style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 600}}>
            {chart === 'bar' ? 'Bar Chart' : 'Pie Chart'}
          </span>
          <span
            aria-hidden
            style={{
              position: 'absolute', top: 3, left: chart === 'bar' ? 3 : 81, width: 36, height: 30,
              borderRadius: 15, background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              transition: 'left 250ms ease',
            }}
          />
        </button>
      </div>

      <div style={{width: '100%', height: 360, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden'}}>
        <canvas ref={canvasRef} style={{width: '100%', height: '100%', display: 'block'}} />
      </div>
    </div>
  );
}
