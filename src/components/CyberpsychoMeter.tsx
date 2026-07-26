import { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, Zap, AlertTriangle, Activity, Cpu, Radio, Wifi, ShieldCheck } from 'lucide-react';

const PHASES = [
  { pct: 20, label: 'Twitchy', color: '#39FF14', desc: 'Mild tremors. You checked the chart twice.' },
  { pct: 45, label: 'Hyper-Reflex', color: '#00F0FF', desc: 'Sandevistan kicks in. Fingers blur across the swap button.' },
  { pct: 70, label: 'Overclocked', color: '#FFE600', desc: 'Heart rate 180. You\'re diamond-handing a memecoin at 3 AM.' },
  { pct: 90, label: 'Cyberpsycho', color: '#FF00A8', desc: 'Reality is a construct. There is only $CYBER.' },
  { pct: 100, label: 'FLATLINE', color: '#FF2D2D', desc: 'You\'ve become the chart. The chart is you. GG.' },
];

/* ── Static config for ambient layers (generated once) ── */
const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

interface NetNode { x: number; y: number; pd: number; pdl: number; }
interface NetConn { from: number; to: number; }
interface NetPulse { conn: number; dur: number; delay: number; fd: number; }
interface DataLine { top: number; left: string; width: string; dur: number; delay: number; }
interface StatusTag { text: string; x: number; y: number; dur: number; delay: number; blink: boolean; }

function makeNetNodes(n: number): NetNode[] {
  return Array.from({ length: n }, () => ({
    x: rnd(4, 96), y: rnd(4, 96), pd: rnd(2.5, 6), pdl: rnd(0, 4),
  }));
}
function makeNetConns(nodes: NetNode[], n: number): NetConn[] {
  const out: NetConn[] = [];
  for (let i = 0; i < n; i++) {
    const from = (Math.random() * nodes.length) | 0;
    let to = (Math.random() * nodes.length) | 0;
    if (to === from) to = (to + 1) % nodes.length;
    out.push({ from, to });
  }
  return out;
}
function makeNetPulses(conns: NetConn[], n: number): NetPulse[] {
  return Array.from({ length: n }, () => ({
    conn: (Math.random() * conns.length) | 0,
    dur: rnd(3, 8), delay: rnd(0, 8), fd: rnd(1.2, 2.4),
  }));
}
function makeDataLines(n: number): DataLine[] {
  return Array.from({ length: n }, () => ({
    top: rnd(2, 98), left: `${rnd(-20, 60)}%`, width: `${rnd(80, 280)}px`,
    dur: rnd(7, 18), delay: rnd(0, 12),
  }));
}
const STATUS_WORDS = ['ONLINE', 'SYNC', 'LOCKED', 'ACTIVE', 'CONNECTED', 'TRACKING', 'VERIFYING', 'MONITORING'];
function makeStatusTags(n: number): StatusTag[] {
  return Array.from({ length: n }, () => ({
    text: pick(STATUS_WORDS), x: rnd(6, 88), y: rnd(8, 88),
    dur: rnd(3, 7), delay: rnd(0, 5), blink: Math.random() > 0.5,
  }));
}

/* ── Diagnostic widgets config ── */
interface WidgetDef {
  key: string; label: string; icon: typeof Activity;
  pos: string; color: string; unit?: string;
  base: (lvl: number) => number; jitter: number; round: number;
}
const WIDGETS: WidgetDef[] = [
  { key: 'hr', label: 'HEART RATE', icon: Activity, pos: 'left', color: '#FF00A8', unit: 'BPM', base: (l) => 118 + l * 0.72, jitter: 3, round: 0 },
  { key: 'nl', label: 'NEURAL LOAD', icon: Brain, pos: 'right', color: '#00F0FF', unit: '%', base: (l) => l * 0.82 + 6, jitter: 2, round: 0 },
  { key: 'me', label: 'MEME EXPOSURE', icon: Zap, pos: 'left', color: '#FFE600', base: () => 0, jitter: 0, round: 0 },
  { key: 'net', label: 'NETWORK STATUS', icon: Wifi, pos: 'right', color: '#39FF14', base: () => 0, jitter: 0, round: 0 },
  { key: 'lat', label: 'BLOCKCHAIN LATENCY', icon: Cpu, pos: 'left', color: '#00F0FF', unit: 'ms', base: () => 11, jitter: 2, round: 0 },
  { key: 'ai', label: 'AI PREDICTION', icon: Radio, pos: 'right', color: '#FF00A8', base: () => 0, jitter: 0, round: 0 },
];

const MEME_LEVELS = ['LOW', 'MED', 'HIGH', 'EXTREME', 'CRITICAL'];
const NET_STATES = ['CONNECTED', 'SYNCING', 'RELAYING'];
const AI_STATES = ['STABLE', 'RISING', 'OVERCLOCKED', 'CRITICAL'];

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function CyberpsychoMeter() {
  const [level, setLevel] = useState(0);
  const [auto, setAuto] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const waveCanvas = useRef<HTMLCanvasElement>(null);
  const waveRef = useRef({ amp: 0, freq: 0, phase: 0 });
  const waveReveal = useRef(0);
  const waveActiveRef = useRef(false);
  const barBootDone = useRef(false);

  // Boot sequence state
  const [active, setActive] = useState(false);
  const [barActive, setBarActive] = useState(false);
  const [waveActive, setWaveActive] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  const [bgBoost, setBgBoost] = useState(1);
  const [displayLevel, setDisplayLevel] = useState(0);

  const reduce = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  // Ambient layer configs (stable across renders)
  const netNodes = useMemo(() => makeNetNodes(20), []);
  const netConns = useMemo(() => makeNetConns(netNodes, 26), []);
  const [netPulses, setNetPulses] = useState(() => makeNetPulses(netConns, 12));
  const dataLines = useMemo(() => makeDataLines(28), []);
  const statusTags = useMemo(() => makeStatusTags(10), []);

  // Live diagnostic values — start at 0, interpolate toward targets only after boot
  const [liveVals, setLiveVals] = useState<Record<string, number>>(() => {
    const v: Record<string, number> = {};
    for (const w of WIDGETS) if (w.jitter > 0) v[w.key] = 0;
    return v;
  });
  const targets = useRef<Record<string, number>>({});

  // Intersection Observer — trigger boot once at ~30% visible
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (reduce) {
      setActive(true); setBarActive(true); setWaveActive(true);
      setStatusVisible(true); setBgBoost(1);
      waveReveal.current = 1; barBootDone.current = true;
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduce]);

  // Staged boot timeline
  useEffect(() => {
    if (!active || reduce) return;
    const t1 = setTimeout(() => setWaveActive(true), 700);
    const t2 = setTimeout(() => setBarActive(true), 900);
    const t3 = setTimeout(() => setStatusVisible(true), 1500);
    const t4 = setTimeout(() => setBgBoost(1), 1700);
    setBgBoost(1.2);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [active, reduce]);

  useEffect(() => { waveActiveRef.current = waveActive; }, [waveActive]);

  // Auto-pan animation
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

  const current = [...PHASES].reverse().find((p) => displayLevel >= p.pct) ?? PHASES[0];

  // Recompute widget targets periodically
  useEffect(() => {
    const compute = () => {
      const t: Record<string, number> = {};
      for (const w of WIDGETS) {
        if (w.jitter > 0) t[w.key] = w.base(level) + rnd(-w.jitter, w.jitter);
      }
      targets.current = t;
    };
    compute();
    const id = setInterval(compute, 1400);
    return () => clearInterval(id);
  }, [level]);

  // Smoothly interpolate widget values toward targets (only after active)
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      setLiveVals((prev) => {
        const next: Record<string, number> = {};
        for (const w of WIDGETS) {
          if (w.jitter <= 0) continue;
          const tgt = targets.current[w.key] ?? w.base(level);
          const cur = prev[w.key] ?? 0;
          next[w.key] = cur + (tgt - cur) * 0.08;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [level, active]);

  // Categorical states derived from level
  const memeIdx = Math.min(4, Math.floor(level / 20));
  const netIdx = level > 85 ? 1 : Math.random() > 0.5 ? 0 : 2;
  const aiIdx = Math.min(3, Math.floor(level / 26));

  // Display level easing (slow boot fill, then fast tracking)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setDisplayLevel((d) => {
        const tgt = barActive ? level : 0;
        const diff = tgt - d;
        const factor = barBootDone.current ? 0.25 : 0.06;
        if (Math.abs(diff) < 0.3) { barBootDone.current = true; return tgt; }
        return d + diff * factor;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [barActive, level]);

  // Waveform canvas — progressive draw + amplitude/frequency scale with level
  useEffect(() => {
    const canvas = waveCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      // Progressive reveal
      if (waveActiveRef.current) {
        waveReveal.current = Math.min(1, waveReveal.current + dt * 2.5);
      }
      const revealW = waveReveal.current * w;

      const targetAmp = (level / 100) * (h * 0.34) + 2;
      const targetFreq = 0.012 + (level / 100) * 0.05;
      waveRef.current.amp += (targetAmp - waveRef.current.amp) * 0.06;
      waveRef.current.freq += (targetFreq - waveRef.current.freq) * 0.06;
      waveRef.current.phase += 0.05 + (level / 100) * 0.12;
      const { amp, freq, phase } = waveRef.current;
      const color = current.color;

      // Faint baseline (full width)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0,240,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Waveform — clipped to reveal width
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 0; x <= revealW; x += 2) {
        const noise = (Math.sin(x * freq * 3 + phase * 1.7) + Math.sin(x * freq * 7 + phase * 0.6)) * 0.3;
        const y = h / 2 + Math.sin(x * freq + phase) * amp + noise * amp * 0.4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Leading edge glow during reveal
      if (waveReveal.current < 1 && revealW > 0) {
        ctx.shadowBlur = 12;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(revealW, h / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [level, current.color, reduce]);

  // Radar speed + extra pulses scale with level
  const radarDur = Math.max(4, 8 - (level / 100) * 4);
  useEffect(() => {
    const extra = Math.round((level / 100) * 8);
    setNetPulses(makeNetPulses(netConns, 12 + extra));
  }, [level, netConns]);

  const glowIntensity = 0.4 + (level / 100) * 0.6;

  // Boot style helper
  const boot = (delay: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
    opacity: active ? 1 : 0,
    transform: active ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ${EASE} ${delay}s, transform 0.6s ${EASE} ${delay}s, filter 0.6s ${EASE} ${delay}s, text-shadow 0.8s ease ${delay}s, box-shadow 0.6s ease ${delay}s`,
    ...extra,
  });

  return (
    <section id="meter" ref={sectionRef} className="relative overflow-hidden px-5 py-24">
      {/* ═══════ HUD BACKGROUND LAYERS ═══════ */}
      <div className="cpm-hud" aria-hidden>
        {/* Aurora glows — boosted during boot */}
        <div className="cpm-aurora cpm-aurora-cyan" style={{ opacity: (0.5 + (level / 100) * 0.4) * bgBoost }} />
        <div className="cpm-aurora cpm-aurora-magenta" style={{ opacity: (0.35 + (level / 100) * 0.4) * bgBoost }} />
        <div className="cpm-aurora cpm-aurora-green" style={{ opacity: bgBoost }} />

        {/* Drifting grid */}
        <div className="cpm-grid" />

        {/* Radar scanner */}
        <div className="cpm-radar">
          <div className="cpm-radar-ring" />
          <div className="cpm-radar-ring" />
          <div className="cpm-radar-ring" />
          <div
            className="cpm-radar-beam"
            style={{ animationDuration: `${radarDur}s` }}
          />
          <div className="cpm-radar-dot" />
        </div>

        {/* Data flow lines */}
        <div className="cpm-data-lines">
          {dataLines.map((l, i) => (
            <div
              key={i}
              className="cpm-data-line"
              style={{
                top: `${l.top}%`, left: l.left, width: l.width,
                animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Blockchain network */}
        <svg className="cpm-network" preserveAspectRatio="none">
          {netConns.map((c, i) => {
            const a = netNodes[c.from]; const b = netNodes[c.to];
            return (
              <line key={i}
                x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`}
                stroke="rgba(0,240,255,0.08)" strokeWidth={1} />
            );
          })}
          {netPulses.map((p, i) => {
            const c = netConns[p.conn]; const a = netNodes[c.from]; const b = netNodes[c.to];
            return (
              <circle key={i} r={2.4} fill="rgba(0,240,255,0.9)"
                style={{ animation: `cpmPulseFlash ${p.fd}s ease-in-out ${p.delay}s infinite` }}>
                <animate attributeName="cx" from={`${a.x}%`} to={`${b.x}%`} dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
                <animate attributeName="cy" from={`${a.y}%`} to={`${b.y}%`} dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
              </circle>
            );
          })}
          {netNodes.map((n, i) => (
            <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r={2} fill="rgba(0,240,255,0.45)"
              style={{ animation: `cpmNodePulse ${n.pd}s ease-in-out ${n.pdl}s infinite` }} />
          ))}
        </svg>

        {/* Status indicators */}
        <div className="cpm-status-tags">
          {statusTags.map((s, i) => (
            <span key={i}
              className={`cpm-status-tag ${s.blink ? 'cpm-blink' : ''}`}
              style={{ left: `${s.x}%`, top: `${s.y}%`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}>
              <span className="cpm-status-dot" />
              {s.text}
            </span>
          ))}
        </div>

        {/* Scan lines */}
        <div className="cpm-scan-h" style={{ animationDuration: `${7 - (level / 100) * 2}s` }} />
        <div className="cpm-scan-v" style={{ animationDuration: `${9 - (level / 100) * 2}s` }} />
      </div>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <div
            className="font-mono text-xs tracking-[0.4em] text-cyber-yellow animate-flicker"
            style={boot(0)}
          >
            // LIVE DIAGNOSTIC
          </div>
          <h2
            className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl"
            style={boot(0.15, {
              textShadow: active ? '0 0 18px rgba(255,0,168,0.45)' : '0 0 0 transparent',
              filter: active ? 'none' : 'blur(3px)',
            })}
          >
            CYBERPSYCHO <span className="text-cyber-magenta text-glow-magenta rgb-hover">METER</span>
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl font-body text-lg text-gray-400"
            style={boot(0.3)}
          >
            Real-time measurement of your $CYBER-induced psychological state.
            The higher you go, the closer to flatline. No refunds on your humanity.
          </p>
        </div>

        <div className="relative">
          {/* Floating diagnostic widgets — sequential boot, hidden on mobile */}
          <div className="cpm-widgets" aria-hidden>
            {WIDGETS.map((w, i) => {
              const Icon = w.icon;
              const side = w.pos === 'left' ? 'left' : 'right';
              const val = w.jitter > 0 ? Math.round(liveVals[w.key] ?? 0) : null;
              const catVal = w.key === 'me' ? MEME_LEVELS[memeIdx]
                : w.key === 'net' ? NET_STATES[netIdx]
                : w.key === 'ai' ? AI_STATES[aiIdx] : null;
              return (
                <div
                  key={w.key}
                  className={`cpm-widget cpm-widget-${side}`}
                  style={boot(0.3 + i * 0.1, {
                    ['--w-color' as string]: w.color,
                    opacity: active ? glowIntensity * 0.55 : 0,
                    boxShadow: active
                      ? `0 0 12px ${w.color}40, inset 0 0 8px ${w.color}20`
                      : 'none',
                  })}
                >
                  <div className="cpm-widget-head">
                    <Icon className="h-3 w-3" />
                    <span>{w.label}</span>
                  </div>
                  <div className="cpm-widget-val">
                    {val !== null ? (
                      <>
                        <span className="cpm-num">{val}</span>
                        {w.unit && <span className="cpm-unit">{w.unit}</span>}
                      </>
                    ) : (
                      <span className="cpm-cat">{catVal}</span>
                    )}
                  </div>
                  <div className="cpm-widget-bar">
                    <div
                      className="cpm-widget-bar-fill"
                      style={{
                        width: `${Math.min(100, w.key === 'nl' ? (val ?? 0) : (val !== null ? (val / (w.base(100) || 1)) * 100 : 60))}%`,
                        background: w.color,
                        boxShadow: `0 0 6px ${w.color}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main card */}
          <div
            className="clip-cyber scan-card border border-cyber-magenta/40 bg-cyber-panel/60 p-8 box-glow-cyan"
            style={boot(0.5, {
              transform: active ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
              boxShadow: active
                ? `0 0 ${20 + level * 0.3}px rgba(0,240,255,${0.15 + (level / 100) * 0.25})`
                : '0 0 0 rgba(0,240,255,0)',
            })}
          >
            {/* HUD corner brackets */}
            <span className="cpm-bracket cpm-bracket-tl" />
            <span className="cpm-bracket cpm-bracket-tr" />
            <span className="cpm-bracket cpm-bracket-bl" />
            <span className="cpm-bracket cpm-bracket-br" />

            {/* Top status row */}
            <div className="mb-5 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-cyber-cyan/60">
              <span className="flex items-center gap-1.5">
                <span className="cpm-led cpm-led-green" /> SYS::ONLINE
              </span>
              <span className="cpm-blink-text">SCANNING<span className="cpm-cursor">_</span></span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> SECURE
              </span>
            </div>

            {/* Waveform monitor */}
            <div className="relative mb-6 h-16 w-full overflow-hidden border border-cyber-cyan/20 bg-cyber-darker/80">
              <canvas ref={waveCanvas} className="h-full w-full" />
              <div className="pointer-events-none absolute left-2 top-1 font-mono text-[8px] tracking-[0.2em] text-cyber-cyan/50">
                NEURAL WAVEFORM // CH-01
              </div>
              <div className="pointer-events-none absolute right-2 top-1 font-mono text-[8px] tracking-[0.2em] text-cyber-cyan/50">
                {Math.round(displayLevel)}%
              </div>
            </div>

            {/* Bar — fills smoothly from 0 on boot */}
            <div className="relative h-10 w-full overflow-hidden border border-cyber-cyan/30 bg-cyber-darker">
              <div
                className="h-full"
                style={{
                  width: `${displayLevel}%`,
                  background: `linear-gradient(90deg, #39FF14, #00F0FF, #FFE600, #FF00A8, #FF2D2D)`,
                  boxShadow: `0 0 20px ${current.color}`,
                  transition: 'width 0.1s linear',
                }}
              />
              {[20, 40, 60, 80].map((t) => (
                <div key={t} className="absolute top-0 h-full w-px bg-cyber-dark/60" style={{ left: `${t}%` }} />
              ))}
            </div>

            {/* Readout — fades in after the bar finishes filling */}
            <div
              className="mt-6 flex flex-col items-center gap-3 text-center"
              style={{
                opacity: statusVisible ? 1 : 0,
                transform: statusVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
              }}
            >
              <div className="flex items-center gap-2">
                {displayLevel >= 90 ? (
                  <AlertTriangle className="h-6 w-6 animate-pulse text-cyber-red" />
                ) : displayLevel >= 70 ? (
                  <Zap className="h-6 w-6 text-cyber-yellow" />
                ) : (
                  <Brain className="h-6 w-6 text-cyber-cyan" />
                )}
                <span
                  className="font-display text-3xl font-black tracking-widest"
                  style={{
                    color: current.color,
                    textShadow: statusVisible
                      ? `0 0 16px ${current.color}`
                      : `0 0 0 ${current.color}`,
                    transition: `color 0.3s ease, text-shadow 0.6s ease`,
                  }}
                >
                  {current.label}
                </span>
              </div>
              <div className="font-mono text-2xl font-bold text-white">
                {Math.floor(displayLevel)}<span className="text-cyber-magenta">%</span>
              </div>
              <p className="font-body text-base text-gray-300">{current.desc}</p>
            </div>

            {/* Manual override */}
            <div
              className="mt-6 flex items-center justify-center gap-3"
              style={{
                opacity: statusVisible ? 1 : 0,
                transition: `opacity 0.5s ${EASE} 0.2s`,
              }}
            >
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
        </div>
      </div>

      <style>{`
@keyframes cpmPulseFlash {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; filter: drop-shadow(0 0 4px rgba(0,240,255,0.8)); }
}
@keyframes cpmNodePulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; filter: drop-shadow(0 0 4px rgba(0,240,255,0.6)); }
}
`}</style>
    </section>
  );
}
