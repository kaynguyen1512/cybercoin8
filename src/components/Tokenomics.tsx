import { useEffect, useRef, useState } from 'react';
import { Flame, Users, Lock, Skull } from 'lucide-react';

const STATS = [
  { label: 'TOTAL SUPPLY', value: 69420, suffix: 'T', color: 'text-cyber-cyan', glow: 'rgba(0,240,255,0.55)', desc: '69,420 trillion $CYBER. Because of course.' },
  { label: 'BURNED', value: 42, suffix: '%', color: 'text-cyber-magenta', glow: 'rgba(255,0,168,0.55)', desc: 'Tossed into the incinerator. Forever flatlined.' },
  { label: 'LIQUIDITY', value: 95, suffix: '%', color: 'text-cyber-green', glow: 'rgba(57,255,20,0.55)', desc: 'Locked for 69 years. Arasaka can\'t even touch it.' },
  { label: 'MARKETING', value: 4, suffix: '%', color: 'text-cyber-yellow', glow: 'rgba(255,230,0,0.55)', desc: 'Funds the bounty board. Pay the streets.' },
];

const SEGMENTS = [
  { label: 'BURN', pct: 50, color: '#FF00A8', text: 'text-white', note: '3.45%' },
  { label: 'LP', pct: 28, color: '#FFE600', text: 'text-cyber-dark', note: '1.93%' },
  { label: 'MKT', pct: 15, color: '#00F0FF', text: 'text-cyber-dark', note: '1.04%' },
  { label: 'HOLD', pct: 7, color: '#39FF14', text: 'text-cyber-dark', note: '.48%' },
];

const PARTICLES = [
  { left: '8%', top: '18%', delay: '0s', dur: '14s', size: 2 },
  { left: '22%', top: '72%', delay: '3.5s', dur: '17s', size: 3 },
  { left: '41%', top: '30%', delay: '2.2s', dur: '15s', size: 2 },
  { left: '63%', top: '64%', delay: '5.4s', dur: '18s', size: 2 },
  { left: '79%', top: '24%', delay: '1.8s', dur: '16s', size: 3 },
  { left: '90%', top: '58%', delay: '6.1s', dur: '13s', size: 2 },
];

const DATA_FRAGMENTS = [
  '95%', 'LP LOCKED', '0xA83F...', 'BURN', 'TOTAL SUPPLY', '69420T', 'DEX', 'TOKEN', 'BLOCK', 'CONFIRMED',
  '0x4C2E...', 'GAS 21', 'SWAP', 'MINT', '0x9B1D...', 'HOLDER', 'POOL', '0xF7A0...', 'SYNC', 'CHAIN',
];

const FRAGMENT_POSITIONS = [
  { left: '6%', top: '82%', delay: '0s', dur: '13s' },
  { left: '14%', top: '12%', delay: '4s', dur: '15s' },
  { left: '26%', top: '88%', delay: '7s', dur: '14s' },
  { left: '33%', top: '20%', delay: '2s', dur: '16s' },
  { left: '44%', top: '76%', delay: '9s', dur: '13s' },
  { left: '52%', top: '14%', delay: '5s', dur: '15s' },
  { left: '61%', top: '84%', delay: '1s', dur: '17s' },
  { left: '70%', top: '22%', delay: '8s', dur: '14s' },
  { left: '78%', top: '78%', delay: '3s', dur: '16s' },
  { left: '87%', top: '18%', delay: '6s', dur: '13s' },
  { left: '19%', top: '46%', delay: '10s', dur: '15s' },
  { left: '48%', top: '52%', delay: '2.5s', dur: '14s' },
  { left: '73%', top: '48%', delay: '7.5s', dur: '16s' },
];

// Network nodes (positions in %) and the edges connecting them.
const NODES = [
  { x: 12, y: 22 }, { x: 28, y: 64 }, { x: 44, y: 30 }, { x: 58, y: 70 },
  { x: 72, y: 26 }, { x: 86, y: 60 }, { x: 38, y: 50 }, { x: 64, y: 44 },
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 6], [6, 3], [3, 5], [5, 7], [7, 4], [4, 2], [6, 7], [0, 6], [3, 7],
];
// Light pulses travel along specific edges at staggered intervals.
const PULSES: { edge: [number, number]; delay: string; dur: string }[] = [
  { edge: [0, 1], delay: '0s', dur: '6s' },
  { edge: [2, 6], delay: '2.5s', dur: '7s' },
  { edge: [3, 5], delay: '5s', dur: '6.5s' },
  { edge: [7, 4], delay: '8s', dur: '7.5s' },
  { edge: [6, 3], delay: '11s', dur: '6s' },
];

function CountUp({ end, suffix, glow }: { end: number; suffix: string; glow: string }) {
  const [val, setVal] = useState(0);
  const [flicker, setFlicker] = useState<number | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1100;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.floor(eased * end));
            if (p < 1) requestAnimationFrame(tick);
            else {
              done.current = true;
            }
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);

  // Subtle terminal flicker after the count completes — random ±1 drift.
  useEffect(() => {
    if (!done.current) return;
    let to: ReturnType<typeof setTimeout>;
    const schedule = () => {
      to = setTimeout(() => {
        if (!done.current) return;
        const drift = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
        setFlicker(Math.max(0, end + drift));
        setTimeout(() => {
          setFlicker(null);
          schedule();
        }, 220);
      }, 2600 + Math.random() * 2200);
    };
    schedule();
    return () => clearTimeout(to);
  }, [end]);

  const display = flicker !== null ? flicker : val;

  return (
    <span
      ref={ref}
      className="tk-num font-display text-4xl font-black tabular-nums sm:text-5xl"
      style={{ textShadow: `0 0 14px ${glow}` }}
    >
      {display.toLocaleString()}
      <span className="text-2xl">{suffix}</span>
    </span>
  );
}

export default function Tokenomics() {
  const sectionRef = useRef<HTMLElement>(null);
  const [barActive, setBarActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setBarActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="tokenomics" ref={sectionRef} className="tk-section relative overflow-hidden px-5 py-28">
      <TokenomicsStyles />

      {/* Background: layered living data system */}
      <div className="tk-bg pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {/* Layer 4: soft aurora glows */}
        <div className="tk-aurora tk-aurora-a absolute" />
        <div className="tk-aurora tk-aurora-b absolute" />

        {/* Layer 1: animated cyber grid */}
        <div className="tk-grid absolute inset-0" />

        {/* Layer 3: network visualization */}
        <div className="tk-net absolute inset-0">
          <svg className="tk-net-svg absolute inset-0 h-full w-full" preserveAspectRatio="none">
            {EDGES.map(([a, b], i) => (
              <line
                key={i}
                x1={`${NODES[a].x}%`} y1={`${NODES[a].y}%`}
                x2={`${NODES[b].x}%`} y2={`${NODES[b].y}%`}
                className="tk-edge"
              />
            ))}
            {NODES.map((n, i) => (
              <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r={2.5} className="tk-node" />
            ))}
            {PULSES.map((p, i) => {
              const [a, b] = p.edge;
              return (
                <circle key={i} r={2} className="tk-pulse">
                  <animateMotion
                    dur={p.dur}
                    repeatCount="indefinite"
                    begin={p.delay}
                    path={`M${NODES[a].x},${NODES[a].y} L${NODES[b].x},${NODES[b].y}`}
                  />
                </circle>
              );
            })}
          </svg>
        </div>

        {/* Layer 2: floating blockchain data fragments */}
        {FRAGMENT_POSITIONS.map((pos, i) => (
          <span
            key={i}
            className="tk-data absolute font-mono text-[11px] tracking-[0.25em] text-cyber-cyan"
            style={{
              left: pos.left,
              top: pos.top,
              animation: `tk-data-rise ${pos.dur} linear ${pos.delay} infinite`,
            }}
          >
            {DATA_FRAGMENTS[i % DATA_FRAGMENTS.length]}
          </span>
        ))}

        {/* Layer 5: film grain / digital noise */}
        <div className="tk-noise absolute inset-0" />

        {/* Particles */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="tk-particle absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animation: `tk-float ${p.dur} ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}

        {/* Soft diagnostic scan line every 8s */}
        <div className="tk-scan absolute inset-x-0" />

        {/* Card backlight radial glow */}
        <div className="tk-cardglow absolute inset-x-0 top-[34%] h-[42%]" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="tk-header mb-16 text-center reveal-glitch">
          <div className="font-mono text-xs tracking-[0.5em] text-cyber-cyan animate-flicker">// THE NUMBERS</div>
          <h2 className="mt-5 font-display text-5xl font-black tracking-tight text-white sm:text-6xl">
            <span className="text-glow-magenta text-cyber-magenta rgb-hover">TOKENOMICS</span>{' '}
            <span className="tk-version text-cyber-cyan/90">2.0</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-24" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.6), transparent)' }} />
          <p className="mx-auto mt-6 max-w-xl font-body text-lg leading-relaxed text-gray-400">
            Math so clean it'd make a netrunner weep. Every number means something. Probably.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="tk-card reveal-pop clip-cyber group relative"
              style={{
                transitionDelay: `${i * 80}ms`,
                '--tk-glow': s.glow,
              } as React.CSSProperties}
            >
              {/* corner accents */}
              <span className="tk-corner tk-corner-tl" />
              <span className="tk-corner tk-corner-br" />

              <div className="relative flex h-full flex-col items-center p-8 text-center">
                <CountUp end={s.value} suffix={s.suffix} glow={s.glow} />
                <div className={`mt-3 font-mono text-[11px] tracking-[0.3em] ${s.color}`}>{s.label}</div>
                <div className="mt-4 h-px w-10 mx-auto opacity-40" style={{ background: s.glow }} />
                <p className="mt-4 font-body text-sm leading-relaxed text-gray-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction tax bar */}
        <div className="tk-bar-wrap reveal-pop mt-12 clip-cyber relative border border-cyber-magenta/30 bg-cyber-dark/60 p-7 backdrop-blur-md box-glow-magenta">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold tracking-wide text-cyber-magenta">
              <Flame className="h-5 w-5" /> TRANSACTION TAX — 6.9%
            </h3>
            <span className="font-mono text-[10px] tracking-[0.3em] text-gray-500">AUTO-APPLIED ON EVERY SWAP</span>
          </div>

          {/* Segmented bar */}
          <div className="tk-bar relative flex h-9 w-full overflow-hidden rounded-sm border border-cyber-cyan/20 bg-cyber-darker">
            {SEGMENTS.map((seg, i) => {
              const delay = [0, 0.5, 0.85, 1.2][i];
              const dur = [0.5, 0.35, 0.35, 0.3][i];
              return (
                <div
                  key={i}
                  className="flex items-center justify-center font-mono text-[10px] font-bold transition-[width] ease-out"
                  style={{
                    width: barActive ? `${seg.pct}%` : '0%',
                    background: seg.color,
                    color: seg.text === 'text-white' ? '#fff' : '#050507',
                    transitionDuration: `${dur}s`,
                    transitionDelay: `${delay}s`,
                    boxShadow: barActive ? `0 0 12px ${seg.color}66` : 'none',
                  }}
                >
                  <span className="whitespace-nowrap opacity-0 transition-opacity duration-300" style={{ transitionDelay: `${delay + dur}s`, opacity: barActive ? 1 : 0 }}>
                    {seg.label} {seg.note}
                  </span>
                </div>
              );
            })}
            {/* traveling scan line — starts after fill completes */}
            {barActive && <span className="tk-scanline" style={{ animationDelay: '1.5s' }} />}
          </div>

          {/* Legend */}
          <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
            <div className="flex items-center gap-2 text-gray-300"><Skull className="h-4 w-4 text-cyber-magenta" /> BURN VAULT</div>
            <div className="flex items-center gap-2 text-gray-300"><Lock className="h-4 w-4 text-cyber-yellow" /> LIQUIDITY POOL</div>
            <div className="flex items-center gap-2 text-gray-300"><Flame className="h-4 w-4 text-cyber-cyan" /> MARKETING</div>
            <div className="flex items-center gap-2 text-gray-300"><Users className="h-4 w-4 text-cyber-green" /> HOLDERS AIRDROP</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Scoped styles — all transform/opacity/box-shadow for 60fps ── */
function TokenomicsStyles() {
  return (
    <style>{`
.tk-section { background-color: #050507; }

/* Background layered system */
.tk-bg { z-index: 0; }

/* Layer 1: animated cyber grid */
.tk-grid {
  background-image:
    linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px);
  background-size: 56px 56px;
  opacity: 0.04;
  animation: tk-grid-move 28s linear infinite;
  mask-image: radial-gradient(ellipse at 50% 45%, black 30%, transparent 82%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 45%, black 30%, transparent 82%);
}
@keyframes tk-grid-move {
  0% { background-position: 0 0; }
  100% { background-position: 56px 56px; }
}

/* Layer 2: floating blockchain data fragments */
.tk-data {
  opacity: 0;
  filter: blur(1.5px);
  will-change: transform, opacity;
  text-shadow: 0 0 8px rgba(0,240,255,0.4);
}
@keyframes tk-data-rise {
  0% { transform: translateY(18px); opacity: 0; }
  18% { opacity: 0.06; }
  82% { opacity: 0.05; }
  100% { transform: translateY(-46px); opacity: 0; }
}

/* Layer 3: network visualization */
.tk-net { opacity: 0.07; }
.tk-net-svg { overflow: visible; }
.tk-edge {
  stroke: #00f0ff;
  stroke-width: 0.6;
  opacity: 0.5;
}
.tk-node {
  fill: #00f0ff;
  filter: drop-shadow(0 0 3px rgba(0,240,255,0.8));
  animation: tk-node-breathe 7s ease-in-out infinite;
}
.tk-node:nth-child(odd) { animation-delay: 2s; }
.tk-node:nth-child(even) { animation-delay: 4s; }
@keyframes tk-node-breathe {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
.tk-pulse {
  fill: #ffffff;
  filter: drop-shadow(0 0 5px rgba(0,240,255,1)) drop-shadow(0 0 10px rgba(0,240,255,0.6));
  opacity: 0.9;
}

/* Layer 4: soft aurora glows */
.tk-aurora {
  border-radius: 50%;
  filter: blur(80px);
  mix-blend-mode: screen;
  will-change: transform, opacity;
}
.tk-aurora-a {
  width: 60vw; height: 60vw;
  left: -10vw; top: -10vw;
  background: radial-gradient(circle, rgba(0,180,255,0.5), transparent 65%);
  opacity: 0.16;
  animation: tk-aurora-drift-a 34s ease-in-out infinite;
}
.tk-aurora-b {
  width: 55vw; height: 55vw;
  right: -12vw; bottom: -12vw;
  background: radial-gradient(circle, rgba(180,90,255,0.45), transparent 65%);
  opacity: 0.13;
  animation: tk-aurora-drift-b 42s ease-in-out infinite;
}
@keyframes tk-aurora-drift-a {
  0%, 100% { transform: translate(0,0) scale(1); opacity: 0.16; }
  50% { transform: translate(4vw,3vw) scale(1.08); opacity: 0.22; }
}
@keyframes tk-aurora-drift-b {
  0%, 100% { transform: translate(0,0) scale(1); opacity: 0.13; }
  50% { transform: translate(-3vw,-2vw) scale(1.1); opacity: 0.19; }
}

/* Layer 5: film grain / digital noise */
.tk-noise {
  opacity: 0.035;
  background-image: repeating-radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0px, transparent 1px, transparent 2px);
  mix-blend-mode: screen;
  animation: tk-noise-shift 3s steps(4) infinite;
}
@keyframes tk-noise-shift {
  0% { transform: translate(0,0); }
  25% { transform: translate(-2px,1px); }
  50% { transform: translate(1px,-1px); }
  75% { transform: translate(-1px,2px); }
  100% { transform: translate(2px,-2px); }
}

/* Particles */
.tk-particle {
  background: #00f0ff;
  box-shadow: 0 0 6px rgba(0,240,255,0.6);
  opacity: 0.4;
}
@keyframes tk-float {
  0%, 100% { transform: translate(0,0); opacity: 0.22; }
  50% { transform: translate(8px,-22px); opacity: 0.5; }
}

/* Diagnostic scan line */
.tk-scan {
  height: 1px;
  top: 0;
  background: linear-gradient(90deg, transparent, rgba(0,240,255,0.45), transparent);
  opacity: 0;
  animation: tk-scan-pass 8s ease-in-out infinite;
}
@keyframes tk-scan-pass {
  0% { transform: translateY(0); opacity: 0; }
  6% { opacity: 0.5; }
  50% { transform: translateY(50vh); opacity: 0.4; }
  94% { opacity: 0.3; }
  100% { transform: translateY(100vh); opacity: 0; }
}

/* Card backlight radial glow */
.tk-cardglow {
  background: radial-gradient(ellipse at 50% 50%, rgba(0,200,255,0.08), transparent 70%);
  filter: blur(20px);
  pointer-events: none;
}

/* Version badge subtle glow */
.tk-version { text-shadow: 0 0 12px rgba(0,240,255,0.35); }

/* Glassmorphism stat cards */
.tk-card {
  position: relative;
  background: linear-gradient(160deg, rgba(17,17,26,0.72), rgba(10,10,15,0.55));
  border: 1px solid rgba(0,240,255,0.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
  transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
  overflow: hidden;
  min-height: 220px;
}
.tk-card::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(115deg, transparent 35%, rgba(0,240,255,0.06) 50%, transparent 65%);
  background-size: 200% 200%;
  background-position: 0% 0%;
  pointer-events: none;
  transition: background-position 0.6s ease;
  opacity: 0.7;
}
.tk-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: rgba(0,240,255,0.55);
  background: linear-gradient(160deg, rgba(22,22,34,0.85), rgba(14,14,20,0.7));
  box-shadow:
    0 18px 44px rgba(0,0,0,0.65),
    0 0 22px var(--tk-glow),
    inset 0 1px 0 rgba(255,255,255,0.06);
}
.tk-card:hover::before { background-position: 100% 100%; }

/* Corner accents */
.tk-corner { position: absolute; width: 14px; height: 14px; pointer-events: none; opacity: 0.5; transition: opacity 0.3s ease; }
.tk-corner-tl { top: 6px; left: 6px; border-top: 1.5px solid #00f0ff; border-left: 1.5px solid #00f0ff; }
.tk-corner-br { bottom: 6px; right: 6px; border-bottom: 1.5px solid #00f0ff; border-right: 1.5px solid #00f0ff; }
.tk-card:hover .tk-corner { opacity: 1; box-shadow: 0 0 6px rgba(0,240,255,0.6); }

/* Idle neon pulse every ~5.5s */
.tk-card { animation: tk-card-pulse 5.5s ease-in-out infinite; }
.tk-card:nth-child(2) { animation-delay: 1.3s; }
.tk-card:nth-child(3) { animation-delay: 2.6s; }
.tk-card:nth-child(4) { animation-delay: 3.9s; }
@keyframes tk-card-pulse {
  0%, 88%, 100% { border-color: rgba(0,240,255,0.18); }
  92% { border-color: rgba(0,240,255,0.42); }
  96% { border-color: rgba(0,240,255,0.18); }
}

/* Number subtle scanline sheen */
.tk-num { position: relative; }

/* Tax bar scan line */
.tk-scanline {
  position: absolute;
  top: 0; bottom: 0;
  left: 0;
  width: 3px;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.9), transparent);
  box-shadow: 0 0 14px rgba(255,255,255,0.7), 0 0 22px rgba(0,240,255,0.5);
  pointer-events: none;
  animation: tk-scan-travel 4s linear infinite;
}
@keyframes tk-scan-travel {
  0% { transform: translateX(0); opacity: 0; }
  6% { opacity: 1; }
  94% { opacity: 1; }
  100% { transform: translateX(calc(100vw)); opacity: 0; }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .tk-grid, .tk-noise, .tk-particle, .tk-card, .tk-scanline,
  .tk-data, .tk-node, .tk-pulse, .tk-aurora, .tk-scan { animation: none !important; }
  .tk-card { transition: none !important; }
  .tk-card:hover { transform: none !important; }
  .tk-data, .tk-net { opacity: 0 !important; }
}
    `}</style>
  );
}
