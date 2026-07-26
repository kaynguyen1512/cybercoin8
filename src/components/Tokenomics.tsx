import { useEffect, useMemo, useRef, useState } from 'react';
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

const DATA_WORDS = [
  '95%', 'BURN', 'LP LOCKED', 'TOKEN', '0xAF23...', 'BLOCK', 'CONFIRMED', '69420T',
  'AUTO', 'SYNC', '0x4C2E...', 'GAS 21', 'SWAP', 'MINT', 'HOLDER', 'POOL',
  '0x9B1D...', 'CHAIN', '0xF7A0...', 'DEX', 'NODE 7', 'PEER 847', 'MEMPOOL 142',
  '0xB71C...', 'HASH', 'VERIFY', '0x3D9A...', 'NET 99.8%', 'TX 0x77', 'BLOCK 18942103',
];

const HOLO_PANELS = [
  { title: 'NODE SYNC', lines: ['STATUS: ONLINE', 'PEERS: 847', 'LATENCY: 12ms'], pos: { top: '6%', left: '3%' } },
  { title: 'GAS ORACLE', lines: ['GWEI: 21.4', 'FAST: 18.2', 'SLOW: 14.9'], pos: { top: '10%', right: '4%' } },
  { title: 'MEMPOOL', lines: ['PENDING: 142', 'CONFIRMED: 89.4k', 'TPS: 18.7'], pos: { bottom: '8%', left: '5%' } },
  { title: 'BLOCK', lines: ['HEIGHT: 18,942,103', 'HASH: 0x77Ae..', 'TX: 312'], pos: { bottom: '6%', right: '3%' } },
];

// Hand-placed network node mesh (16 nodes) — spread across the section, behind content.
const NODES = [
  { x: 8, y: 14 }, { x: 22, y: 38 }, { x: 14, y: 66 }, { x: 30, y: 86 },
  { x: 40, y: 22 }, { x: 52, y: 52 }, { x: 46, y: 88 }, { x: 62, y: 30 },
  { x: 70, y: 62 }, { x: 78, y: 18 }, { x: 86, y: 44 }, { x: 92, y: 78 },
  { x: 58, y: 76 }, { x: 34, y: 54 }, { x: 18, y: 24 }, { x: 74, y: 86 },
];
const EDGES: [number, number][] = [
  [0, 1], [1, 13], [13, 2], [2, 3], [3, 6], [6, 12], [12, 8], [8, 10], [10, 11],
  [1, 4], [4, 5], [5, 7], [7, 9], [9, 10], [5, 13], [5, 8], [7, 8], [4, 9],
  [0, 14], [14, 1], [13, 5], [8, 12], [11, 9], [3, 15], [15, 6], [12, 15],
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const rs = (n: number) => `${n.toFixed(2)}s`;

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

  // Generate randomized ambient layers once (CSR-only, so Math.random is safe).
  const flowLines = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({
      key: i,
      top: `${rand(2, 98)}%`,
      len: `${rand(60, 260).toFixed(0)}px`,
      dur: rs(rand(8, 22)),
      delay: rs(rand(0, 18)),
      dir: Math.random() > 0.5 ? 'normal' : 'reverse',
      op: rand(0.04, 0.06).toFixed(3),
    })),
    [],
  );

  const fragments = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({
      key: i,
      word: DATA_WORDS[i % DATA_WORDS.length],
      left: `${rand(2, 94)}%`,
      top: `${rand(8, 92)}%`,
      dur: rs(rand(12, 24)),
      delay: rs(rand(0, 20)),
    })),
    [],
  );

  const pulses = useMemo(
    () => Array.from({ length: 14 }, (_, i) => {
      const e = EDGES[Math.floor(Math.random() * EDGES.length)];
      return {
        key: i,
        a: e[0],
        b: e[1],
        dur: rs(rand(5, 9)),
        delay: rs(rand(0, 8)),
      };
    }),
    [],
  );

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

      {/* Background: layered living blockchain operating system */}
      <div className="tk-bg pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {/* Layer 4: huge aurora glows — cyan, purple, blue */}
        <div className="tk-aurora tk-aurora-a absolute" />
        <div className="tk-aurora tk-aurora-b absolute" />
        <div className="tk-aurora tk-aurora-c absolute" />

        {/* Layer 1: animated cyber grid */}
        <div className="tk-grid absolute inset-0" />

        {/* Layer 3: expanded network visualization */}
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
              <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r={2.5} className="tk-node" style={{ animationDelay: `${(i % 6) * 1.1}s` }} />
            ))}
            {pulses.map((p) => (
              <circle key={p.key} r={2} className="tk-pulse">
                <animateMotion
                  dur={p.dur}
                  repeatCount="indefinite"
                  begin={p.delay}
                  path={`M${NODES[p.a].x},${NODES[p.a].y} L${NODES[p.b].x},${NODES[p.b].y}`}
                />
              </circle>
            ))}
          </svg>
        </div>

        {/* Layer: data flow lines (40) traveling across */}
        {flowLines.map((l) => (
          <span
            key={l.key}
            className="tk-flow absolute"
            style={{
              top: l.top,
              width: l.len,
              height: '1px',
              ['--op' as string]: l.op,
              animation: `tk-flow ${l.dur} linear ${l.delay} infinite`,
              animationDirection: l.dir,
            }}
          />
        ))}

        {/* Layer 2: floating blockchain data fragments (30) */}
        {fragments.map((f) => (
          <span
            key={f.key}
            className="tk-data absolute font-mono text-[11px] tracking-[0.25em] text-cyber-cyan"
            style={{
              left: f.left,
              top: f.top,
              animation: `tk-data-rise ${f.dur} linear ${f.delay} infinite`,
            }}
          >
            {f.word}
          </span>
        ))}

        {/* Holographic diagnostic panels */}
        {HOLO_PANELS.map((p, i) => (
          <div
            key={i}
            className="tk-holo absolute font-mono"
            style={{
              ...p.pos,
              animation: `tk-holo-life ${rs(rand(22, 34))} ease-in-out ${rs(rand(0, 12))} infinite`,
            }}
          >
            <div className="tk-holo-title">{p.title}</div>
            {p.lines.map((ln, j) => (
              <div key={j} className="tk-holo-line">{ln}</div>
            ))}
          </div>
        ))}

        {/* Layer 5: film grain / digital noise */}
        <div className="tk-noise absolute inset-0" />

        {/* Multi-directional scan bars */}
        <div className="tk-scan tk-scan-h1 absolute inset-x-0" />
        <div className="tk-scan tk-scan-h2 absolute inset-x-0" />
        <div className="tk-scan tk-scan-v1 absolute inset-y-0" />
        <div className="tk-scan tk-scan-v2 absolute inset-y-0" />
        <div className="tk-scan tk-scan-d1 absolute" />

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
  0% { transform: translateY(22px); opacity: 0; }
  16% { opacity: 0.055; }
  84% { opacity: 0.045; }
  100% { transform: translateY(-54px); opacity: 0; }
}

/* Data flow lines */
.tk-flow {
  left: 0;
  background: linear-gradient(90deg, transparent, rgba(0,240,255,1) 50%, transparent);
  opacity: 0;
  will-change: transform, opacity;
  filter: blur(0.4px);
}
@keyframes tk-flow {
  0% { transform: translateX(-260px); opacity: 0; }
  12% { opacity: var(--op); }
  88% { opacity: var(--op); }
  100% { transform: translateX(100vw); opacity: 0; }
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
@keyframes tk-node-breathe {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.tk-pulse {
  fill: #ffffff;
  filter: drop-shadow(0 0 5px rgba(0,240,255,1)) drop-shadow(0 0 10px rgba(0,240,255,0.6));
  animation: tk-pulse-flash 1.4s ease-in-out infinite;
}
@keyframes tk-pulse-flash {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 0.35; }
}

/* Holographic diagnostic panels */
.tk-holo {
  border: 1px solid rgba(0,240,255,0.14);
  background: linear-gradient(160deg, rgba(10,16,24,0.5), rgba(8,12,18,0.3));
  backdrop-filter: blur(4px);
  padding: 10px 14px;
  font-size: 9px;
  line-height: 1.5;
  color: rgba(0,240,255,0.5);
  opacity: 0;
  letter-spacing: 0.12em;
  will-change: transform, opacity;
}
.tk-holo-title {
  color: rgba(0,240,255,0.7);
  font-weight: 700;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(0,240,255,0.12);
  padding-bottom: 3px;
}
.tk-holo-line { color: rgba(120,200,230,0.4); }
@keyframes tk-holo-life {
  0% { opacity: 0; transform: translateY(6px); }
  12% { opacity: 0.5; transform: translateY(0); }
  82% { opacity: 0.45; transform: translateY(-4px); }
  100% { opacity: 0; transform: translateY(-8px); }
}

/* Layer 4: huge aurora glows */
.tk-aurora {
  border-radius: 50%;
  filter: blur(110px);
  mix-blend-mode: screen;
  will-change: transform, opacity;
}
.tk-aurora-a {
  width: 700px; height: 700px;
  left: -120px; top: -120px;
  background: radial-gradient(circle, rgba(0,180,255,0.5), transparent 65%);
  opacity: 0.18;
  animation: tk-aurora-drift-a 54s ease-in-out infinite;
}
.tk-aurora-b {
  width: 640px; height: 640px;
  right: -140px; bottom: -140px;
  background: radial-gradient(circle, rgba(180,90,255,0.45), transparent 65%);
  opacity: 0.15;
  animation: tk-aurora-drift-b 66s ease-in-out infinite;
}
.tk-aurora-c {
  width: 560px; height: 560px;
  left: 30%; top: 40%;
  background: radial-gradient(circle, rgba(40,120,255,0.4), transparent 65%);
  opacity: 0.1;
  animation: tk-aurora-drift-c 78s ease-in-out infinite;
}
@keyframes tk-aurora-drift-a {
  0%, 100% { transform: translate(0,0) scale(1); opacity: 0.18; }
  50% { transform: translate(40px,30px) scale(1.1); opacity: 0.24; }
}
@keyframes tk-aurora-drift-b {
  0%, 100% { transform: translate(0,0) scale(1); opacity: 0.15; }
  50% { transform: translate(-30px,-20px) scale(1.12); opacity: 0.21; }
}
@keyframes tk-aurora-drift-c {
  0%, 100% { transform: translate(0,0) scale(1); opacity: 0.1; }
  50% { transform: translate(-24px,28px) scale(1.08); opacity: 0.16; }
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

/* Multi-directional scan bars */
.tk-scan { opacity: 0; will-change: transform, opacity; }
.tk-scan-h1 {
  height: 1px; top: 0;
  background: linear-gradient(90deg, transparent, rgba(0,240,255,0.4), transparent);
  animation: tk-scan-h 9s ease-in-out infinite;
}
.tk-scan-h2 {
  height: 1px; top: 0;
  background: linear-gradient(90deg, transparent, rgba(180,90,255,0.32), transparent);
  animation: tk-scan-h 13s ease-in-out 4s infinite;
}
.tk-scan-v1 {
  width: 1px; left: 0;
  background: linear-gradient(180deg, transparent, rgba(0,240,255,0.32), transparent);
  animation: tk-scan-v 15s ease-in-out 2s infinite;
}
.tk-scan-v2 {
  width: 1px; right: 0;
  background: linear-gradient(180deg, transparent, rgba(0,180,255,0.28), transparent);
  animation: tk-scan-v 11s ease-in-out 6s infinite;
}
.tk-scan-d1 {
  width: 100%; height: 1px;
  top: 0; left: 0;
  background: linear-gradient(90deg, transparent, rgba(0,240,255,0.22), transparent);
  transform-origin: left center;
  transform: rotate(18deg);
  animation: tk-scan-h 17s ease-in-out 3s infinite;
}
@keyframes tk-scan-h {
  0% { transform: translateY(0); opacity: 0; }
  8% { opacity: 0.5; }
  92% { opacity: 0.3; }
  100% { transform: translateY(100vh); opacity: 0; }
}
@keyframes tk-scan-v {
  0% { transform: translateX(0); opacity: 0; }
  8% { opacity: 0.45; }
  92% { opacity: 0.25; }
  100% { transform: translateX(100vw); opacity: 0; }
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
  .tk-grid, .tk-noise, .tk-card, .tk-scanline, .tk-scan,
  .tk-data, .tk-flow, .tk-node, .tk-pulse, .tk-aurora, .tk-holo { animation: none !important; }
  .tk-card { transition: none !important; }
  .tk-card:hover { transform: none !important; }
  .tk-data, .tk-net, .tk-flow, .tk-holo { opacity: 0 !important; }
}
    `}</style>
  );
}
