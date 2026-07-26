import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Rocket, Skull, Music, Globe, ArrowRight } from 'lucide-react';

gsap.registerPlugin(Draggable, InertiaPlugin);

interface Phase {
  phase: string;
  title: string;
  status: string;
  icon: typeof Rocket;
  colorKey: 'green' | 'cyan' | 'magenta' | 'yellow';
  hex: string;
  image: string;
  points: string[];
}

const PHASES: Phase[] = [
  {
    phase: 'PHASE 01',
    title: 'JACK IN',
    status: 'COMPLETE',
    icon: Rocket,
    colorKey: 'green',
    hex: '#39FF14',
    image: 'https://ik.imagekit.io/zznoau6lx/a.JPG',
    points: [
      'Stealth launch on the streets of Night City',
      'Liquidity locked, contract renounced',
      'First 1,000 cybers onboarded — no KYC, no mercy',
    ],
  },
  {
    phase: 'PHASE 02',
    title: 'OVERCLOCK',
    status: 'IN PROGRESS',
    icon: Skull,
    colorKey: 'cyan',
    hex: '#00F0FF',
    image: 'https://ik.imagekit.io/zznoau6lx/b.jpg',
    points: [
      'CoinGecko + CMC listings',
      'Meme bounty board goes live',
      'Influencer raids across the net',
      'First scheduled burn event',
    ],
  },
  {
    phase: 'PHASE 03',
    title: 'CYBERPSYCHO',
    status: 'QUEUED',
    icon: Music,
    colorKey: 'magenta',
    hex: '#FF00A8',
    image: 'https://ik.imagekit.io/zznoau6lx/c.jpg',
    points: [
      'NFT collection: "Ripperdoc Rarities"',
      'Holder-gated Samurai Sessions (audio drops)',
      'CEX listings — tier 1 exchanges',
      'Massive 6.9% supply burn on-chain',
    ],
  },
  {
    phase: 'PHASE 04',
    title: 'FLATLINE / REBOOT',
    status: 'CLASSIFIED',
    icon: Globe,
    colorKey: 'yellow',
    hex: '#FFE600',
    image: 'https://ik.imagekit.io/zznoau6lx/d.jpg',
    points: [
      'CyberDAO governance launch',
      'Cross-chain bridge to the metaverse',
      'IRL Night City meetups (we wish)',
      'The moon. Obviously the moon.',
    ],
  },
];

export default function Roadmap() {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const cardWidthRef = useRef(0);
  const dragRef = useRef<Draggable | null>(null);

  const updateCards = (x: number) => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    const wrapW = wrap.offsetWidth;
    const cardW = cardWidthRef.current || 1;
    const step = cardW + 32; // gap

    cardEls.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = x + i * step + cardW / 2;
      const dist = Math.abs(wrapW / 2 - cardCenter);
      const norm = Math.min(1, dist / step);
      const isActive = norm < 0.5;
      const scale = 1 - norm * 0.1;
      const opacity = 1 - norm * 0.45;
      const blur = norm * 4;
      const rotY = norm * 8 * (cardCenter < wrapW / 2 ? -1 : 1);
      gsap.to(card, {
        scale, opacity, rotationY: rotY, filter: `blur(${blur}px)`,
        duration: 0.4, ease: 'power3.out', overwrite: 'auto',
      });
      if (isActive && i !== active) setActive(i);
    });
  };

  const snapTo = (idx: number) => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    const cardW = cardWidthRef.current || 1;
    const step = cardW + 32;
    const target = -(idx * step) + (wrap.offsetWidth - cardW) / 2;
    gsap.to(track, { x: target, duration: 0.9, ease: 'power3.out', onUpdate: () => updateCards(gsap.getProperty(track, 'x') as number) });
    setActive(idx);
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const measure = () => {
      const first = cardEls.current[0];
      if (!first) return;
      cardWidthRef.current = first.offsetWidth;
      // center first card
      const cardW = cardWidthRef.current;
      const step = cardW + 32;
      const target = -(0 * step) + (wrap.offsetWidth - cardW) / 2;
      gsap.set(track, { x: target });
      updateCards(target);
    };
    measure();

    const drag = Draggable.create(track, {
      type: 'x',
      inertia: true,
      edgeResistance: 0.65,
      bounds: { minX: -(cardWidthRef.current + 32) * (PHASES.length - 1) + (wrap.offsetWidth - cardWidthRef.current) / 2 - 60, maxX: (wrap.offsetWidth - cardWidthRef.current) / 2 + 60 },
      onDrag: function () { updateCards(this.x); },
      onThrowUpdate: function () { updateCards(this.x); },
      onDragEnd: function () {
        const step = (cardWidthRef.current || 1) + 32;
        const idx = Math.round(-this.x / step);
        snapTo(Math.max(0, Math.min(PHASES.length - 1, idx)));
      },
      snap: {
        x: (endValue) => {
          const step = (cardWidthRef.current || 1) + 32;
          const idx = Math.round(-endValue / step);
          const clamped = Math.max(0, Math.min(PHASES.length - 1, idx));
          return -clamped * step + (wrap.offsetWidth - cardWidthRef.current) / 2;
        },
      },
    })[0];
    dragRef.current = drag;

    // horizontal wheel support
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        const dir = e.deltaY > 0 ? 1 : -1;
        const next = Math.max(0, Math.min(PHASES.length - 1, active + dir));
        snapTo(next);
      }
    };
    wrap.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
      cardWidthRef.current = cardEls.current[0]?.offsetWidth || 0;
      snapTo(active);
    };
    window.addEventListener('resize', onResize);

    return () => {
      wrap.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      drag.kill();
    };
  }, [active]);

  return (
    <section id="roadmap" className="relative overflow-hidden py-24">
      <RoadmapBackground />

      <div className="relative z-10 mb-12 text-center reveal-glitch">
        <div className="font-mono text-xs tracking-[0.4em] text-cyber-green animate-flicker">// THE MISSION LOG</div>
        <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
          ROAD<span className="text-cyber-green text-glow-cyan rgb-hover">MAP</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-body text-lg text-gray-400">
          We don't make promises. We make threats. Here's the plan — subject to cyberpsycho disruption.
        </p>
      </div>

      {/* progress indicators */}
      <div className="relative z-10 mb-8 flex items-center justify-center gap-3">
        {PHASES.map((p, i) => (
          <button
            key={i}
            onClick={() => snapTo(i)}
            className="group flex items-center gap-2"
            aria-label={`Go to ${p.title}`}
          >
            <span
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: active === i ? 36 : 12,
                background: active === i ? p.hex : 'rgba(255,255,255,0.2)',
                boxShadow: active === i ? `0 0 8px ${p.hex}` : 'none',
              }}
            />
          </button>
        ))}
      </div>

      {/* draggable viewport */}
      <div
        ref={wrapRef}
        className="relative z-10 h-[640px] w-full overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ perspective: '1600px' }}
      >
        <div ref={trackRef} className="absolute top-0 left-0 flex h-full items-center" style={{ gap: '32px', willChange: 'transform' }}>
          {PHASES.map((p, i) => (
            <div
              key={i}
              ref={(el) => { cardEls.current[i] = el; }}
              className="rm-card relative h-[600px] shrink-0"
              style={{ width: 'min(80vw, 920px)', transformStyle: 'preserve-3d' }}
              data-active={active === i}
            >
              <RoadmapCard phase={p} active={active === i} />
            </div>
          ))}
        </div>

        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-cyber-darker to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-cyber-darker to-transparent" />
      </div>

      <p className="relative z-10 mt-6 text-center font-mono text-xs tracking-[0.3em] text-gray-500">
        DRAG · SCROLL · SWIPE TO NAVIGATE
      </p>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROADMAP CARD
   ═══════════════════════════════════════════════════════════════════ */

function RoadmapCard({ phase, active }: { phase: Phase; active: boolean }) {
  const { hex, colorKey } = phase;
  const textCls = `text-cyber-${colorKey}`;

  return (
    <div
      className="rm-card-inner clip-cyber relative h-full w-full border bg-cyber-panel/40 backdrop-blur-md"
      style={{
        borderColor: `${hex}40`,
        boxShadow: active
          ? `0 0 40px ${hex}40, 0 0 80px ${hex}20, inset 0 0 40px ${hex}10`
          : `0 0 20px ${hex}20, inset 0 0 20px ${hex}08`,
        transition: 'box-shadow 0.8s ease',
      }}
    >
      {/* image hero — ~65% of card */}
      <div className="rm-img-wrap relative h-[65%] w-full overflow-hidden">
        <img
          src={phase.image}
          alt={phase.title}
          loading="lazy"
          className={`rm-img h-full w-full object-cover object-center ${active ? 'rm-img-active' : ''}`}
          style={{ objectPosition: 'center 20%' }}
        />
        {/* scanlines */}
        <div className="rm-scanlines pointer-events-none absolute inset-0" />
        {/* light sweep */}
        <div className="rm-sweep pointer-events-none absolute inset-0" />
        {/* RGB glow edge */}
        <div className="pointer-events-none absolute inset-0" style={{ boxShadow: `inset 0 0 60px ${hex}40, inset 0 0 120px ${hex}20` }} />
        {/* noise */}
        <div className="rm-noise pointer-events-none absolute inset-0 opacity-[0.06]" />
        {/* particles */}
        {[...Array(6)].map((_, k) => (
          <span
            key={k}
            className="rm-particle pointer-events-none absolute rounded-full"
            style={{
              left: `${15 + k * 14}%`, top: `${20 + (k % 3) * 25}%`,
              width: 2, height: 2, background: hex,
              boxShadow: `0 0 6px ${hex}`,
              animationDelay: `${k * 1.3}s`, animationDuration: `${7 + k}s`,
            }}
          />
        ))}

        {/* HUD corner brackets on image */}
        <HudCorners hex={hex} active={active} />

        {/* phase number overlay */}
        <div className="pointer-events-none absolute left-6 top-5 font-display text-6xl font-black leading-none"
             style={{ color: `${hex}30`, textShadow: `0 0 20px ${hex}50` }}>
          {phase.phase.split(' ')[1]}
        </div>
      </div>

      {/* info panel — glassmorphism */}
      <div className="relative h-[35%] w-full px-7 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <phase.icon className={`h-5 w-5 ${textCls}`} />
              <span className="font-mono text-xs tracking-[0.3em] text-gray-400">{phase.phase}</span>
            </div>
            <h3 className={`mt-2 font-display text-3xl font-black tracking-wide ${textCls}`}
                style={{ textShadow: `0 0 12px ${hex}80` }}>
              {phase.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rm-status h-2.5 w-2.5 rounded-full ${active ? 'rm-status-pulse' : ''}`}
              style={{ background: hex, boxShadow: `0 0 8px ${hex}` }}
            />
            <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: hex }}>
              {phase.status}
            </span>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5">
          {phase.points.map((pt, j) => (
            <li
              key={j}
              className={`rm-bullet flex items-start gap-2 font-body text-sm text-gray-300 ${active ? 'rm-bullet-in' : ''}`}
              style={{ transitionDelay: `${j * 120}ms` }}
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: hex, boxShadow: `0 0 4px ${hex}` }} />
              <span>{pt}</span>
            </li>
          ))}
        </ul>

        <div className="absolute bottom-5 right-6 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.25em]"
             style={{ color: hex }}>
          ENTER SECTOR
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

function HudCorners({ hex, active }: { hex: string; active: boolean }) {
  const base = 'absolute h-6 w-6 transition-all duration-500';
  const style = { borderColor: hex, opacity: active ? 1 : 0.5, boxShadow: active ? `0 0 8px ${hex}` : 'none' };
  return (
    <>
      <div className={`${base} left-3 top-3 border-l-2 border-t-2`} style={style} />
      <div className={`${base} right-3 top-3 border-r-2 border-t-2`} style={style} />
      <div className={`${base} bottom-3 left-3 border-b-2 border-l-2`} style={style} />
      <div className={`${base} bottom-3 right-3 border-b-2 border-r-2`} style={style} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BACKGROUND
   ═══════════════════════════════════════════════════════════════════ */

function RoadmapBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="rm-bg-grid absolute inset-0" />
      <div className="rm-bg-aurora absolute" style={{ background: 'radial-gradient(circle at 25% 40%, rgba(57,255,20,0.06), transparent 55%)', animationDuration: '28s' }} />
      <div className="rm-bg-aurora absolute" style={{ background: 'radial-gradient(circle at 75% 60%, rgba(255,0,168,0.06), transparent 55%)', animationDuration: '34s', animationDelay: '-8s' }} />
      {[...Array(10)].map((_, i) => (
        <span key={i} className="rm-bg-particle absolute rounded-full"
              style={{ left: `${8 + i * 9}%`, top: `${15 + (i % 4) * 22}%`, width: 2, height: 2,
                       background: 'rgba(0,240,255,0.4)', boxShadow: '0 0 4px rgba(0,240,255,0.4)',
                       animationDuration: `${8 + i}s`, animationDelay: `${i * 0.7}s` }} />
      ))}
      <RoadmapStyles />
    </div>
  );
}

function RoadmapStyles() {
  return (
    <style>{`
@keyframes rmBgGridDrift { 0% { background-position: 0 0; } 100% { background-position: 60px 60px; } }
@keyframes rmBgAuroraDrift {
  0% { transform: translate(0,0) scale(1); opacity: 0.5; }
  50% { transform: translate(40px,-30px) scale(1.15); opacity: 0.8; }
  100% { transform: translate(-30px,20px) scale(0.95); opacity: 0.55; }
}
@keyframes rmBgParticleFloat {
  0%,100% { transform: translateY(0) translateX(0); opacity: 0.3; }
  50% { transform: translateY(-20px) translateX(6px); opacity: 0.6; }
}
@keyframes rmImgZoom { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes rmSweep { 0% { transform: translateX(-120%) skewX(-15deg); } 100% { transform: translateX(220%) skewX(-15deg); } }
@keyframes rmParticleFloat {
  0%,100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-18px); opacity: 0.8; }
}
@keyframes rmStatusPulse {
  0%,100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}
@keyframes rmBulletIn {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}

.rm-bg-grid {
  background-image:
    linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at 50% 50%, black 25%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 25%, transparent 80%);
  animation: rmBgGridDrift 40s linear infinite;
}
.rm-bg-aurora { inset: -20%; filter: blur(80px); animation: rmBgAuroraDrift 30s ease-in-out infinite alternate; }
.rm-bg-particle { animation: rmBgParticleFloat 9s ease-in-out infinite; }

.rm-img-wrap { transform: translateZ(20px); }
.rm-img { transition: transform 0.8s ease; }
.rm-img-active { animation: rmImgZoom 14s ease-in-out infinite; }
.rm-card:hover .rm-img { transform: scale(1.05); }

.rm-scanlines {
  background: repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.25) 3px, rgba(0,0,0,0.25) 4px);
  mix-blend-mode: multiply;
}
.rm-sweep {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
  width: 40%;
  animation: rmSweep 7s ease-in-out infinite;
  animation-delay: 3s;
}
.rm-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.rm-particle { animation: rmParticleFloat 8s ease-in-out infinite; }

.rm-status-pulse { animation: rmStatusPulse 1.6s ease-in-out infinite; }

.rm-bullet { opacity: 0; transform: translateY(12px); }
.rm-bullet-in { animation: rmBulletIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

.rm-card { transform-style: preserve-3d; }
.rm-card[data-active="true"]:hover .rm-card-inner { filter: brightness(1.05); }

@media (prefers-reduced-motion: reduce) {
  .rm-bg-grid, .rm-bg-aurora, .rm-bg-particle, .rm-img-active, .rm-sweep,
  .rm-particle, .rm-status-pulse, .rm-bullet-in { animation: none !important; }
  .rm-bullet { opacity: 1; transform: none; }
}
`}</style>
  );
}
