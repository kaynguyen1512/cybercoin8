import { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, Zap, AlertTriangle, Activity, Radio, ShieldCheck, Lock, Cpu, Wifi, Gauge } from 'lucide-react';

const PHASES = [
  { pct: 20, label: 'Twitchy', color: '#39FF14', desc: 'Mild tremors. You checked the chart twice.' },
  { pct: 45, label: 'Hyper-Reflex', color: '#00F0FF', desc: 'Sandevistan kicks in. Fingers blur across the swap button.' },
  { pct: 70, label: 'Overclocked', color: '#FFE600', desc: 'Heart rate 180. You\'re diamond-handling a memecoin at 3 AM.' },
  { pct: 90, label: 'Cyberpsycho', color: '#FF00A8', desc: 'Reality is a construct. There is only $CYBER.' },
  { pct: 100, label: 'FLATLINE', color: '#FF2D2D', desc: 'You\'ve become the chart. The chart is you. GG.' },
];

const STATUS_INDICATORS = [
  { label: 'ONLINE', top: '8%', left: '4%', blink: true },
  { label: 'SYNC', top: '14%', right: '5%', blink: false },
  { label: 'LOCKED', top: '78%', left: '3%', blink: false },
  { label: 'ACTIVE', top: '82%', right: '4%', blink: true },
  { label: 'TRACKING', top: '46%', left: '2%', blink: false },
  { label: 'VERIFYING', top: '52%', right: '3%', blink: true },
];

const NODES = [
  { x: 10, y: 18 }, { x: 24, y: 42 }, { x: 16, y: 70 }, { x: 38, y: 28 },
  { x: 50, y: 58 }, { x: 44, y: 84 }, { x: 64, y: 22 }, { x: 72, y: 52 },
  { x: 80, y: 80 }, { x: 88, y: 34 }, { x: 30, y: 54 }, { x: 58, y: 38 },
];
const EDGES: [number, number][] = [
  [0, 1], [1, 10], [10, 2], [2, 5], [5, 8], [8, 7], [7, 9], [9, 6],
  [6, 3], [3, 11], [11, 4], [4, 7], [1, 3], [10, 4], [4, 8], [0, 3],
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const rs = (n: number) => `${n.toFixed(2)}s`;

// Smoothly tween a numeric value toward a new random target.
function useDriftingValue(initial: number, min: number, max: number, step: number, interval: number) {
  const [val, setVal] = useState(initial);
  const target = useRef(initial);
  useEffect(() => {
    const id = setInterval(() => {
      target.current = Math.min(max, Math.max(min, target.current + rand(-step, step)));
    }, interval);
    return () => clearInterval(id);
  }, [min, max, step, interval]);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setVal((v) => v + (target.current - v) * 0.08);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return val;
}

export default function CyberpsychoMeter() {
  const [level, setLevel] = useState(0);
  const [auto, setAuto] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!auto) return;
    let raf = 0;
    let dir = 1;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setLevel((l) => {
        let next = l + dir * dt * 22;
        if (next >= 100) { next = 100; dir = -1; }
        if (next <= 0) { next = 0; dir = 1; }
        return next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const current = [...PHASES].reverse().find((p) => level >= p.pct) ?? PHASES[0];

  // Live drifting diagnostic values (smoothly interpolated).
  const heartRate = useDriftingValue(178, 168, 196, 4, 2200);
  const neuralLoad = useDriftingValue(72, 58, 92, 5, 2800);
  const latency = useDriftingValue(12, 8, 22, 3, 2400);
  const signal = useDriftingValue(97, 92, 100, 2, 3000);
  const stress = useDriftingValue(64, 40, 96, 6, 2600);

  // Intensity drives reactivity: waveform chaos, radar speed, glow, pulse count.
  const intensity = level / 100;
  const radarDur = `${(8 - intensity * 3).toFixed(2)}s`;
  const glowBoost = 0.4 + intensity * 0.6;

  // Randomized ambient layers (CSR-only).
  const flowLines = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({
      key: i,
      top: `${rand(2, 98)}%`,
      len: `${rand(50, 220).toFixed(0)}px`,
      dur: rs(rand(9, 20)),
      delay: rs(rand(0, 16)),
      dir: Math.random() > 0.5 ? 'normal' : 'reverse',
    })),
    [],
  );
  const dataFrags = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      key: i,
      word: ['0xAF23...', 'SYNC', 'NEURAL', 'BLOCK 18942103', 'PEER 847', 'HASH 0x77Ae', 'MEMPOOL 142', 'TX 0x4C'][i % 8],
      left: `${rand(3, 93)}%`,
      top: `${rand(8, 92)}%`,
      dur: rs(rand(13, 22)),
      delay: rs(rand(0, 18)),
    })),
    [],
  );
  const pulses = useMemo(
    () => Array.from({ length: 10 }, () => {
      const e = EDGES[Math.floor(Math.random() * EDGES.length)];
      return { a: e[0], b: e[1], dur: rs(rand(5, 9)), delay: rs(rand(0, 7)) };
    }),
    [],
  );

  return (
    <section id="meter" ref={sectionRef} className="cpm-section relative overflow-hidden px-5 py-24">
      <CyberpsychoStyles glow={current.color} glowBoost={glowBoost} radarDur={radarDur} />

      {/* ── Background HUD layers ── */}
      <div className="cpm-bg pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {/* Large aurora glows — cyan, magenta, green */}
        <div className="cpm-aurora cpm-aurora-cyan absolute" />
        <div className="cpm-aurora cpm-aurora-magenta absolute" />
        <div className="cpm-aurora cpm-aurora-green absolute" />

        {/* Drifting technical grid */}
        <div className="cpm-grid absolute inset-0" />

        {/* Radar scanner */}
        <div className="cpm-radar absolute">
          <div className="cpm-radar-ring" />
          <div className="cpm-radar-ring cpm-radar-ring-2" />
          <div className="cpm-radar-ring cpm-radar-ring-3" />
          <div className="cpm-radar-sweep" style={{ animationDuration: radarDur }} />
        </div>

        {/* Network visualization */}
        <div className="cpm-net absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            {EDGES.map(([a, b], i) => (
              <line key={i} x1={`${NODES[a].x}%`} y1={`${NODES[a].y}%`} x2={`${NODES[b].x}%`} y2={`${NODES[b].y}%`} className="cpm-edge" />
            ))}
            {NODES.map((n, i) => (
              <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r={2.2} className="cpm-node" style={{ animationDelay: `${(i % 5) * 1.2}s` }} />
            ))}
            {pulses.map((p, i) => (
              <circle key={i} r={2} className="cpm-pulse">
                <animateMotion dur={p.dur} repeatCount="indefinite" begin={p.delay} path={`M${NODES[p.a].x},${NODES[p.a].y} L${NODES[p.b].x},${NODES[p.b].y}`} />
              </circle>
            ))}
          </svg>
        </div>

        {/* Data flow lines */}
        {flowLines.map((l) => (
          <span key={l.key} className="cpm-flow absolute" style={{ top: l.top, width: l.len, height: '1px', animation: `cpm-flow-x ${l.dur} linear ${l.delay} infinite`, animationDirection: l.dir }} />
        ))}

        {/* Floating data fragments */}
        {dataFrags.map((f) => (
          <span key={f.key} className="cpm-data absolute font-mono text-[10px] tracking-[0.25em] text-cyber-cyan" style={{ left: f.left, top: f.top, animation: `cpm-data-rise ${f.dur} linear ${f.delay} infinite` }}>
            {f.word}
          </span>
        ))}

        {/* Scan lines */}
        <div className="cpm-scan cpm-scan-h1 absolute inset-x-0" />
        <div className="cpm-scan cpm-scan-h2 absolute inset-x-0" />
        <div className="cpm-scan cpm-scan-v1 absolute inset-y-0" />

        {/* Film grain */}
        <div className="cpm-noise absolute inset-0" />
      </div>

      {/* ── Floating status indicators ── */}
      {STATUS_INDICATORS.map((s, i) => (
        <div key={i} className="cpm-status absolute font-mono text-[9px] tracking-[0.3em] text-cyber-cyan/50" style={{ ...s, animation: s.blink ? `cpm-blink ${rs(rand(2.5, 4.5))} ease-in-out ${rs(rand(0, 3))} infinite` : undefined }}>
          <span className="cpm-led" /> {s.label}
        </div>
      ))}

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center reveal-glitch">
          <div className="font-mono text-xs tracking-[0.4em] text-cyber-yellow animate-flicker">// LIVE DIAGNOSTIC</div>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
            CYBERPSYCHO <span className="text-cyber-magenta text-glow-magenta rgb-hover">METER</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-lg text-gray-400">
            Real-time measurement of your $CYBER-induced psychological state.
            The higher you go, the closer to flatline. No refunds on your humanity.
          </p>
        </div>

        {/* ── Diagnostic widget strip ── */}
        <div className="cpm-widgets reveal-pop mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Widget icon={<Activity className="h-3.5 w-3.5" />} label="HEART RATE" value={`${Math.floor(heartRate)}`} unit="BPM" color="#FF2D2D" />
          <Widget icon={<Brain className="h-3.5 w-3.5" />} label="NEURAL LOAD" value={`${Math.floor(neuralLoad)}`} unit="%" color="#00F0FF" />
          <Widget icon={<Gauge className="h-3.5 w-3.5" />} label="LATENCY" value={`${Math.floor(latency)}`} unit="ms" color="#39FF14" />
          <Widget icon={<Wifi className="h-3.5 w-3.5" />} label="SIGNAL" value={`${Math.floor(signal)}`} unit="%" color="#FFE600" />
          <Widget icon={<AlertTriangle className="h-3.5 w-3.5" />} label="STRESS" value={`${Math.floor(stress)}`} unit="%" color="#FF00A8" />
        </div>

        {/* ── Main meter card ── */}
        <div className="reveal-pop clip-cyber scan-card cpm-card relative border border-cyber-magenta/40 bg-cyber-panel/60 p-8 box-glow-cyan" style={{ ['--cpm-glow' as string]: current.color, ['--cpm-boost' as string]: String(glowBoost) }}>
          {/* HUD brackets */}
          <span className="cpm-bracket cpm-bracket-tl" />
          <span className="cpm-bracket cpm-bracket-tr" />
          <span className="cpm-bracket cpm-bracket-bl" />
          <span className="cpm-bracket cpm-bracket-br" />
          <span className="cpm-bracket-label font-mono text-[8px] tracking-[0.3em] text-cyber-cyan/50">SYS://NEURAL_MONITOR</span>

          {/* Live waveform monitor */}
          <div className="cpm-wave-wrap relative mb-6 h-16 w-full overflow-hidden border border-cyber-cyan/20 bg-cyber-darker/70">
            <Waveform intensity={intensity} color={current.color} />
            <div className="cpm-wave-label absolute left-2 top-1.5 font-mono text-[8px] tracking-[0.3em] text-cyber-cyan/50">BIOMETRIC WAVEFORM</div>
            <div className="cpm-cursor absolute font-mono text-cyber-cyan/70">_</div>
          </div>

          {/* Bar */}
          <div className="relative h-10 w-full overflow-hidden border border-cyber-cyan/30 bg-cyber-darker">
            <div
              className="h-full transition-all duration-100 ease-linear"
              style={{
                width: `${level}%`,
                background: `linear-gradient(90deg, #39FF14, #00F0FF, #FFE600, #FF00A8, #FF2D2D)`,
                boxShadow: `0 0 ${10 + intensity * 24}px ${current.color}`,
              }}
            />
            {/* Tick marks */}
            {[20, 40, 60, 80].map((t) => (
              <div key={t} className="absolute top-0 h-full w-px bg-cyber-dark/60" style={{ left: `${t}%` }} />
            ))}
            {/* Moving scan glint on the bar */}
            <span className="cpm-bar-glint" style={{ animationDuration: `${(4 - intensity * 2).toFixed(2)}s` }} />
          </div>

          {/* Readout */}
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              {level >= 90 ? (
                <AlertTriangle className="h-6 w-6 animate-pulse text-cyber-red" />
              ) : level >= 70 ? (
                <Zap className="h-6 w-6 text-cyber-yellow" />
              ) : (
                <Brain className="h-6 w-6 text-cyber-cyan" />
              )}
              <span
                className="font-display text-3xl font-black tracking-widest transition-colors"
                style={{ color: current.color, textShadow: `0 0 ${8 + intensity * 14}px ${current.color}` }}
              >
                {current.label}
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-white">
              {Math.floor(level)}<span className="text-cyber-magenta">%</span>
            </div>
            <p className="font-body text-base text-gray-300">{current.desc}</p>
          </div>

          {/* Manual override */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setAuto(false)}
              className="clip-cyber-sm border border-cyber-cyan/40 bg-cyber-dark px-4 py-2 font-mono text-xs tracking-widest text-cyber-cyan transition-all hover:bg-cyber-cyan/10"
            >
              HOLD IT YOURSELF
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={level}
              onChange={(e) => { setAuto(false); setLevel(Number(e.target.value)); }}
              className="w-40 accent-cyber-magenta"
              aria-label="Cyberpsycho level"
            />
            <button
              onClick={() => setAuto(true)}
              className="clip-cyber-sm border border-cyber-magenta/40 bg-cyber-dark px-4 py-2 font-mono text-xs tracking-widest text-cyber-magenta transition-all hover:bg-cyber-magenta/10"
            >
              AUTO-PANIC
            </button>
          </div>
        </div>

        {/* ── Secondary status row ── */}
        <div className="cpm-statusrow mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10px] tracking-[0.25em] text-gray-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-cyber-green" /> WALLET SYNC <span className="cpm-dot cpm-dot-green" /></span>
          <span className="flex items-center gap-1.5"><Cpu className="h-3 w-3 text-cyber-cyan" /> NEURAL STABILITY <span className="cpm-dot cpm-dot-cyan" /></span>
          <span className="flex items-center gap-1.5"><Lock className="h-3 w-3 text-cyber-yellow" /> AI PREDICTION: <span className="text-cyber-yellow">{level >= 70 ? 'OVERCLOCKED' : 'NOMINAL'}</span></span>
          <span className="flex items-center gap-1.5"><Radio className="h-3 w-3 text-cyber-magenta" /> NETWORK <span className="cpm-dot cpm-dot-magenta" /></span>
        </div>
      </div>
    </section>
  );
}

function Widget({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string; unit: string; color: string }) {
  return (
    <div className="cpm-widget clip-cyber-sm relative border border-cyber-cyan/15 bg-cyber-dark/50 p-2.5 backdrop-blur-sm" style={{ ['--w' as string]: color }}>
      <div className="flex items-center gap-1.5 text-cyber-cyan/60">
        <span style={{ color }}>{icon}</span>
        <span className="font-mono text-[8px] tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-1 font-mono text-base font-bold tabular-nums text-white">
        {value}<span className="text-xs" style={{ color }}>{unit}</span>
      </div>
      <span className="cpm-widget-led" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
    </div>
  );
}

function Waveform({ intensity, color }: { intensity: number; color: string }) {
  // SVG path-based waveform: amplitude + frequency scale with intensity.
  const ref = useRef<SVGPathElement>(null);
  const t = useRef(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      t.current += 0.05 + intensity * 0.08;
      const time = t.current;
      const amp = 8 + intensity * 22;
      const freq = 2 + intensity * 5;
      const pts: string[] = [];
      for (let x = 0; x <= 100; x += 2) {
        const y = 32 + Math.sin((x / 100) * Math.PI * freq + time) * amp * (0.6 + 0.4 * Math.sin(time * 0.7)) + Math.sin((x / 100) * Math.PI * freq * 2.3 + time * 1.4) * amp * 0.3 * intensity;
        pts.push(`${x},${y.toFixed(1)}`);
      }
      if (ref.current) ref.current.setAttribute('d', `M${pts.join(' L')}`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [intensity]);
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 64" preserveAspectRatio="none">
      <path ref={ref} d="M0,32 L100,32" fill="none" stroke={color} strokeWidth="1.2" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

/* ── Scoped styles ── */
function CyberpsychoStyles({ glow, glowBoost, radarDur }: { glow: string; glowBoost: number; radarDur: string }) {
  return (
    <style>{`
.cpm-section { background-color: #050507; }
.cpm-bg { z-index: 0; }

/* Aurora glows */
.cpm-aurora { border-radius: 50%; filter: blur(110px); mix-blend-mode: screen; will-change: transform, opacity; }
.cpm-aurora-cyan { width: 620px; height: 620px; left: -100px; top: -80px; background: radial-gradient(circle, rgba(0,200,255,0.5), transparent 65%); opacity: ${0.16 * glowBoost}; animation: cpm-aur-1 48s ease-in-out infinite; }
.cpm-aurora-magenta { width: 580px; height: 580px; right: -120px; bottom: -100px; background: radial-gradient(circle, rgba(255,0,168,0.4), transparent 65%); opacity: ${0.14 * glowBoost}; animation: cpm-aur-2 58s ease-in-out infinite; }
.cpm-aurora-green { width: 460px; height: 460px; left: 38%; top: 44%; background: radial-gradient(circle, rgba(57,255,20,0.28), transparent 65%); opacity: ${0.08 * glowBoost}; animation: cpm-aur-3 72s ease-in-out infinite; }
@keyframes cpm-aur-1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(34px,26px) scale(1.08)} }
@keyframes cpm-aur-2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-28px,-20px) scale(1.1)} }
@keyframes cpm-aur-3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,22px) scale(1.06)} }

/* Grid */
.cpm-grid { background-image: linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px); background-size: 52px 52px; opacity: 0.04; animation: cpm-grid-move 26s linear infinite; mask-image: radial-gradient(ellipse at 50% 45%, black 30%, transparent 82%); -webkit-mask-image: radial-gradient(ellipse at 50% 45%, black 30%, transparent 82%); }
@keyframes cpm-grid-move { 0%{background-position:0 0} 100%{background-position:52px 52px} }

/* Radar */
.cpm-radar { width: 280px; height: 280px; left: 50%; top: 50%; transform: translate(-50%,-50%); opacity: 0.08; }
.cpm-radar-ring { position: absolute; inset: 0; border: 1px solid rgba(0,240,255,0.4); border-radius: 50%; }
.cpm-radar-ring-2 { inset: 18%; }
.cpm-radar-ring-3 { inset: 36%; }
.cpm-radar-sweep { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 0deg, transparent 0deg, rgba(0,240,255,0.5) 40deg, transparent 80deg); animation: cpm-radar-spin ${radarDur} linear infinite; }
@keyframes cpm-radar-spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }

/* Network */
.cpm-net { opacity: 0.07; }
.cpm-edge { stroke: #00f0ff; stroke-width: 0.6; opacity: 0.5; }
.cpm-node { fill: #00f0ff; filter: drop-shadow(0 0 3px rgba(0,240,255,0.8)); animation: cpm-node-breathe 7s ease-in-out infinite; }
@keyframes cpm-node-breathe { 0%,100%{opacity:0.5} 50%{opacity:1} }
.cpm-pulse { fill: #fff; filter: drop-shadow(0 0 5px rgba(0,240,255,1)) drop-shadow(0 0 10px rgba(0,240,255,0.6)); animation: cpm-pulse-flash 1.4s ease-in-out infinite; }
@keyframes cpm-pulse-flash { 0%,100%{opacity:0.85} 50%{opacity:0.35} }

/* Data flow */
.cpm-flow { left: 0; background: linear-gradient(90deg, transparent, rgba(0,240,255,1) 50%, transparent); opacity: 0; will-change: transform,opacity; filter: blur(0.4px); }
@keyframes cpm-flow-x { 0%{transform:translateX(-220px);opacity:0} 12%{opacity:0.05} 88%{opacity:0.05} 100%{transform:translateX(100vw);opacity:0} }

/* Floating data */
.cpm-data { opacity: 0; filter: blur(1.5px); will-change: transform,opacity; text-shadow: 0 0 8px rgba(0,240,255,0.4); }
@keyframes cpm-data-rise { 0%{transform:translateY(20px);opacity:0} 16%{opacity:0.05} 84%{opacity:0.04} 100%{transform:translateY(-48px);opacity:0} }

/* Scan lines */
.cpm-scan { opacity: 0; will-change: transform,opacity; }
.cpm-scan-h1 { height: 1px; top: 0; background: linear-gradient(90deg, transparent, rgba(0,240,255,0.4), transparent); animation: cpm-scan-h 11s ease-in-out infinite; }
.cpm-scan-h2 { height: 1px; top: 0; background: linear-gradient(90deg, transparent, rgba(255,0,168,0.3), transparent); animation: cpm-scan-h 15s ease-in-out 5s infinite; }
.cpm-scan-v1 { width: 1px; left: 0; background: linear-gradient(180deg, transparent, rgba(0,240,255,0.3), transparent); animation: cpm-scan-v 17s ease-in-out 3s infinite; }
@keyframes cpm-scan-h { 0%{transform:translateY(0);opacity:0} 8%{opacity:0.5} 92%{opacity:0.25} 100%{transform:translateY(100vh);opacity:0} }
@keyframes cpm-scan-v { 0%{transform:translateX(0);opacity:0} 8%{opacity:0.4} 92%{opacity:0.2} 100%{transform:translateX(100vw);opacity:0} }

/* Film grain */
.cpm-noise { opacity: 0.03; background-image: repeating-radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0px, transparent 1px, transparent 2px); mix-blend-mode: screen; animation: cpm-noise-shift 3s steps(4) infinite; }
@keyframes cpm-noise-shift { 0%{transform:translate(0,0)} 25%{transform:translate(-2px,1px)} 50%{transform:translate(1px,-1px)} 75%{transform:translate(-1px,2px)} 100%{transform:translate(2px,-2px)} }

/* Status indicators */
.cpm-status { display: flex; align-items: center; gap: 4px; opacity: 0.5; z-index: 1; }
.cpm-led { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #39FF14; box-shadow: 0 0 5px #39FF14; }
@keyframes cpm-blink { 0%,100%{opacity:0.5} 50%{opacity:0.12} }

/* Main card */
.cpm-card { transition: box-shadow 0.4s ease; box-shadow: 0 8px 30px rgba(0,0,0,0.55), 0 0 ${20 * glowBoost}px ${glow}40, inset 0 1px 0 rgba(255,255,255,0.04); }

/* HUD brackets */
.cpm-bracket { position: absolute; width: 16px; height: 16px; border-color: rgba(0,240,255,0.5); pointer-events: none; }
.cpm-bracket-tl { top: 6px; left: 6px; border-top: 1.5px solid; border-left: 1.5px solid; }
.cpm-bracket-tr { top: 6px; right: 6px; border-top: 1.5px solid; border-right: 1.5px solid; }
.cpm-bracket-bl { bottom: 6px; left: 6px; border-bottom: 1.5px solid; border-left: 1.5px solid; }
.cpm-bracket-br { bottom: 6px; right: 6px; border-bottom: 1.5px solid; border-right: 1.5px solid; }
.cpm-bracket-label { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); }

/* Waveform */
.cpm-wave-wrap { backdrop-filter: blur(2px); }
.cpm-cursor { right: 6px; top: 2px; font-size: 10px; animation: cpm-cursor-blink 1s steps(2) infinite; }
@keyframes cpm-cursor-blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }

/* Bar glint */
.cpm-bar-glint { position: absolute; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, transparent, rgba(255,255,255,0.7), transparent); box-shadow: 0 0 8px rgba(255,255,255,0.5); animation: cpm-glint-travel 4s linear infinite; }
@keyframes cpm-glint-travel { 0%{left:0;opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{left:100%;opacity:0} }

/* Widgets */
.cpm-widget { transition: border-color 0.3s ease, box-shadow 0.3s ease; }
.cpm-widget:hover { border-color: rgba(0,240,255,0.4); box-shadow: 0 0 12px rgba(0,240,255,0.15); }
.cpm-widget-led { position: absolute; top: 6px; right: 6px; width: 5px; height: 5px; border-radius: 50%; animation: cpm-led-pulse 2.4s ease-in-out infinite; }
@keyframes cpm-led-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

/* Status row dots */
.cpm-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-left: 2px; animation: cpm-dot-pulse 2.6s ease-in-out infinite; }
.cpm-dot-green { background: #39FF14; box-shadow: 0 0 5px #39FF14; }
.cpm-dot-cyan { background: #00F0FF; box-shadow: 0 0 5px #00F0FF; }
.cpm-dot-magenta { background: #FF00A8; box-shadow: 0 0 5px #FF00A8; animation-delay: 1.2s; }
@keyframes cpm-dot-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .cpm-grid, .cpm-noise, .cpm-scan, .cpm-data, .cpm-flow, .cpm-node, .cpm-pulse,
  .cpm-aurora, .cpm-radar-sweep, .cpm-bar-glint, .cpm-cursor, .cpm-widget-led, .cpm-dot { animation: none !important; }
  .cpm-data, .cpm-net, .cpm-flow, .cpm-radar { opacity: 0 !important; }
}
    `}</style>
  );
}
