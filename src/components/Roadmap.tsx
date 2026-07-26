import { useEffect, useRef, useState } from 'react';
import { Rocket, Skull, Music, Globe, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

const PHASES = [
  {
    phase: 'PHASE 01',
    title: 'JACK IN',
    status: 'COMPLETE',
    icon: Rocket,
    color: 'green',
    hex: '#39FF14',
    img: 'https://ik.imagekit.io/zznoau6lx/a.JPG',
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
    color: 'cyan',
    hex: '#00F0FF',
    img: 'https://ik.imagekit.io/zznoau6lx/b.jpg',
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
    color: 'magenta',
    hex: '#FF00A8',
    img: 'https://ik.imagekit.io/zznoau6lx/c.jpg',
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
    color: 'yellow',
    hex: '#FFE600',
    img: 'https://ik.imagekit.io/zznoau6lx/d.jpg',
    points: [
      'CyberDAO governance launch',
      'Cross-chain bridge to the metaverse',
      'IRL Night City meetups (we wish)',
      'The moon. Obviously the moon.',
    ],
  },
];

const colorText: Record<string, string> = {
  green: 'text-cyber-green',
  cyan: 'text-cyber-cyan',
  magenta: 'text-cyber-magenta',
  yellow: 'text-cyber-yellow',
};

export default function Roadmap() {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const dragInstance = useRef<Draggable | null>(null);
  const reduce = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // Compute card width (responsive) — 80% of viewport
  const cardWidth = () => Math.max(320, window.innerWidth * 0.8);
  const gap = () => Math.max(16, window.innerWidth * 0.02);

  // Snap to a given index
  const snapTo = (idx: number, animate = true) => {
    const track = trackRef.current;
    if (!track) return;
    const cw = cardWidth();
    const g = gap();
    const total = cw + g;
    const leftPadding = (window.innerWidth - cw) / 2;
    const x = -(idx * total - leftPadding);
    if (animate && !reduce.current) {
      gsap.to(track, { x, duration: 0.9, ease: 'power3.out' });
    } else {
      gsap.set(track, { x });
    }
    if (dragInstance.current) {
      dragInstance.current.update(true);
    }
  };

  // Update card transforms based on current track position
  const updateCards = (trackX: number) => {
    const cw = cardWidth();
    const g = gap();
    const total = cw + g;
    const leftPadding = (window.innerWidth - cw) / 2;
    const center = -trackX + window.innerWidth / 2;
    let nearest = 0;
    let nearestDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = leftPadding + i * total + cw / 2;
      const dist = cardCenter - center;
      const abs = Math.abs(dist);
      if (abs < nearestDist) { nearestDist = abs; nearest = i; }
      const norm = Math.min(1, abs / (cw * 0.9));
      const scale = 1 - norm * 0.1;
      const opacity = 1 - norm * 0.45;
      const blur = norm * 4;
      const rotateY = (dist / (cw * 0.9)) * 8;
      // parallax layers
      const img = card.querySelector('.rm-img') as HTMLElement | null;
      const overlay = card.querySelector('.rm-overlay') as HTMLElement | null;
      const hud = card.querySelector('.rm-hud') as HTMLElement | null;
      const title = card.querySelector('.rm-title') as HTMLElement | null;
      gsap.set(card, {
        scale,
        opacity,
        filter: blur > 0.1 ? `blur(${blur}px)` : 'blur(0px)',
        rotateY,
        transformPerspective: 1200,
        transformOrigin: 'center center',
      });
      if (img) gsap.set(img, { x: -dist * 0.04 });
      if (overlay) gsap.set(overlay, { x: -dist * 0.025 });
      if (hud) gsap.set(hud, { x: -dist * 0.06 });
      if (title) gsap.set(title, { x: -dist * 0.015 });
    });
    if (nearest !== active) setActive(nearest);
  };

  // Initialize Draggable
  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;

    const setup = () => {
      const cw = cardWidth();
      const g = gap();
      const total = cw + g;
      const leftPadding = (window.innerWidth - cw) / 2;
      const maxX = 0 + leftPadding;
      const minX = -((PHASES.length - 1) * total - leftPadding);

      snapTo(0, false);
      updateCards(gsap.getProperty(track, 'x') as number);

      if (dragInstance.current) dragInstance.current.kill();

      dragInstance.current = Draggable.create(track, {
        type: 'x',
        bounds: { minX, maxX },
        inertia: !reduce.current,
        edgeResistance: 0.65,
        dragResistance: 0,
        zIndexBoost: false,
        onDrag: function () { updateCards(this.x); },
        onThrowUpdate: function () { updateCards(this.x); },
        onDragEnd: function () {
          const cw2 = cardWidth();
          const g2 = gap();
          const total2 = cw2 + g2;
          const idx = Math.round((-this.x - leftPadding) / total2);
          const clamped = Math.max(0, Math.min(PHASES.length - 1, idx));
          snapTo(clamped, true);
        },
      })[0];
    };

    setup();
    const onResize = () => setup();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (dragInstance.current) dragInstance.current.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reveal animation when a card becomes active
  useEffect(() => {
    const card = cardRefs.current[active];
    if (!card || reduce.current) return;
    const bullets = card.querySelectorAll('.rm-bullet');
    const title = card.querySelector('.rm-title-text');
    const tl = gsap.timeline();
    tl.fromTo(title, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
      .fromTo(bullets, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08 }, '-=0.3');
  }, [active]);

  const go = (dir: number) => {
    const next = Math.max(0, Math.min(PHASES.length - 1, active + dir));
    snapTo(next, true);
  };

  // wheel / trackpad horizontal
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let accum = 0;
    let lock = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; // already horizontal
      accum += e.deltaY;
      if (lock) return;
      if (Math.abs(accum) > 60) {
        lock = true;
        go(accum > 0 ? 1 : -1);
        accum = 0;
        setTimeout(() => { lock = false; }, 700);
      }
    };
    wrap.addEventListener('wheel', onWheel, { passive: true });
    return () => wrap.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <section id="roadmap" className="relative overflow-hidden py-24">
      {/* ── Background ── */}
      <div className="rm-bg" aria-hidden>
        <div className="rm-bg-grid" />
        <div className="rm-bg-aurora rm-bg-aurora-cyan" />
        <div className="rm-bg-aurora rm-bg-aurora-magenta" />
        <div className="rm-bg-aurora rm-bg-aurora-green" />
        <div className="rm-bg-particles">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="rm-particle" style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 6) * 1.3}s`,
              animationDuration: `${8 + (i % 5) * 2}s`,
            }} />
          ))}
        </div>
        <div className="rm-bg-hud-lines">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="rm-hud-line" style={{ top: `${10 + i * 16}%`, animationDelay: `${i * 0.7}s` }} />
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 px-5">
        <div className="mx-auto mb-12 max-w-5xl text-center reveal-glitch">
          <div className="font-mono text-xs tracking-[0.4em] text-cyber-green animate-flicker">// THE MISSION LOG</div>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
            ROAD<span className="text-cyber-green text-glow-cyan rgb-hover">MAP</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-lg text-gray-400">
            We don't make promises. We make threats. Here's the plan — subject to cyberpsycho disruption.
          </p>
        </div>
      </div>

      {/* ── Carousel ── */}
      <div ref={wrapRef} className="rm-viewport relative z-10">
        <div ref={trackRef} className="rm-track">
          {PHASES.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="rm-card"
                style={{ width: '80vw', ['--ph-color' as string]: p.hex }}
              >
                {/* Image hero */}
                <div className="rm-art">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="rm-img"
                    loading="lazy"
                    draggable={false}
                  />
                  {/* Scanlines */}
                  <div className="rm-scanlines" />
                  {/* Light sweep */}
                  <div className="rm-sweep" />
                  {/* Noise */}
                  <div className="rm-noise" />
                  {/* RGB glow edge */}
                  <div className="rm-rgb-glow" />
                  {/* Floating particles */}
                  <div className="rm-card-particles">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <span key={j} className="rm-cparticle" style={{
                        left: `${(j * 13 + 7) % 95}%`,
                        top: `${(j * 23 + 11) % 90}%`,
                        animationDelay: `${j * 0.6}s`,
                        animationDuration: `${6 + (j % 4)}s`,
                      }} />
                    ))}
                  </div>
                  {/* Phase tag on image */}
                  <div className="rm-phase-tag">
                    <Icon className="h-4 w-4" />
                    <span>{p.phase}</span>
                  </div>
                </div>

                {/* Info panel (glassmorphism + HUD) */}
                <div className="rm-info">
                  {/* HUD overlay decorations */}
                  <div className="rm-hud">
                    <span className="rm-corner rm-corner-tl" />
                    <span className="rm-corner rm-corner-tr" />
                    <span className="rm-corner rm-corner-bl" />
                    <span className="rm-corner rm-corner-br" />
                    <div className="rm-hud-strip">
                      <span className="rm-hud-dot" />
                      <span className="rm-hud-text">SYS://ROADMAP.NODE.{String(i + 1).padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="rm-title">
                    <div className="rm-title-text">
                      <h3 className={`font-display text-3xl font-black tracking-wide ${colorText[p.color]}`}>
                        {p.title}
                      </h3>
                      <div className="rm-status">
                        <span className="rm-status-dot" />
                        <span className={`font-mono text-xs tracking-widest ${colorText[p.color]}`}>{p.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bullets */}
                  <ul className="rm-bullets">
                    {p.points.map((pt, j) => (
                      <li key={j} className="rm-bullet">
                        <span className="rm-bullet-marker" />
                        <span className="font-body text-sm text-gray-300">{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="rm-cta">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-gray-500">ACCESS FILE</span>
                    <span className="rm-cta-icon">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="relative z-10 mt-10 flex items-center justify-center gap-6">
        <button onClick={() => go(-1)} className="rm-nav-btn" aria-label="Previous phase">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="rm-dots">
          {PHASES.map((_, i) => (
            <button
              key={i}
              onClick={() => snapTo(i, true)}
              className={`rm-dot ${i === active ? 'rm-dot-active' : ''}`}
              style={i === active ? { background: PHASES[i].hex, boxShadow: `0 0 8px ${PHASES[i].hex}` } : undefined}
              aria-label={`Go to phase ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={() => go(1)} className="rm-nav-btn" aria-label="Next phase">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <style>{`
.rm-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
.rm-bg-grid {
  position: absolute; inset: -50px;
  background-image:
    linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at 50% 50%, black 10%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 10%, transparent 70%);
  animation: grid-move 30s linear infinite;
}
.rm-bg-aurora {
  position: absolute; border-radius: 50%; filter: blur(100px);
  animation: rmAurora 50s ease-in-out infinite alternate;
}
.rm-bg-aurora-cyan { width: 600px; height: 600px; left: 5%; top: 10%; background: radial-gradient(circle, rgba(0,240,255,0.10), transparent 70%); }
.rm-bg-aurora-magenta { width: 540px; height: 540px; right: 5%; top: 30%; background: radial-gradient(circle, rgba(255,0,168,0.08), transparent 70%); animation-delay: -12s; }
.rm-bg-aurora-green { width: 420px; height: 420px; left: 40%; bottom: 5%; background: radial-gradient(circle, rgba(57,255,20,0.06), transparent 70%); animation-delay: -24s; }
@keyframes rmAurora {
  0% { transform: translate(0,0) scale(1); }
  50% { transform: translate(40px,-30px) scale(1.1); }
  100% { transform: translate(-30px,25px) scale(0.95); }
}
.rm-bg-particles { position: absolute; inset: 0; }
.rm-particle {
  position: absolute; width: 2px; height: 2px; border-radius: 50%;
  background: rgba(0,240,255,0.4); box-shadow: 0 0 4px rgba(0,240,255,0.5);
  animation: rmFloat 10s ease-in-out infinite;
}
@keyframes rmFloat {
  0%,100% { transform: translateY(0); opacity: 0.2; }
  50% { transform: translateY(-30px); opacity: 0.6; }
}
.rm-bg-hud-lines { position: absolute; inset: 0; }
.rm-hud-line {
  position: absolute; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,240,255,0.08), transparent);
  animation: rmHudSweep 8s linear infinite;
}
@keyframes rmHudSweep {
  0% { transform: translateX(-30%); opacity: 0; }
  50% { opacity: 0.5; }
  100% { transform: translateX(30%); opacity: 0; }
}

.rm-viewport {
  width: 100%;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}
.rm-viewport:active { cursor: grabbing; }
.rm-track {
  display: flex;
  gap: 2vw;
  padding: 40px 0;
  will-change: transform;
  touch-action: pan-y;
}
.rm-card {
  flex: 0 0 80vw;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(8,10,18,0.7);
  backdrop-filter: blur(6px);
  border: 1px solid color-mix(in srgb, var(--ph-color) 30%, transparent);
  box-shadow: 0 0 30px color-mix(in srgb, var(--ph-color) 15%, transparent), inset 0 0 20px rgba(0,0,0,0.4);
  will-change: transform, opacity, filter;
  transform-style: preserve-3d;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}
.rm-card:hover {
  border-color: color-mix(in srgb, var(--ph-color) 60%, transparent);
  box-shadow: 0 0 50px color-mix(in srgb, var(--ph-color) 30%, transparent), inset 0 0 20px rgba(0,0,0,0.4);
}

.rm-art {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 52%;
  overflow: hidden;
}
.rm-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center 30%;
  will-change: transform;
  animation: rmZoom 18s ease-in-out infinite alternate;
}
@keyframes rmZoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.08); }
}
.rm-card:hover .rm-img { animation-duration: 10s; }

.rm-scanlines {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 2px, transparent 3px);
  mix-blend-mode: multiply;
  pointer-events: none;
}
.rm-sweep {
  position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.08) 45%, transparent 60%);
  animation: rmSweep 6s ease-in-out infinite;
  pointer-events: none;
}
@keyframes rmSweep {
  0% { transform: translateX(-100%); }
  60%,100% { transform: translateX(100%); }
}
.rm-noise {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  opacity: 0.04; mix-blend-mode: overlay; pointer-events: none;
}
.rm-rgb-glow {
  position: absolute; inset: 0;
  box-shadow: inset 0 0 60px color-mix(in srgb, var(--ph-color) 40%, transparent);
  pointer-events: none;
}
.rm-card-particles { position: absolute; inset: 0; pointer-events: none; }
.rm-cparticle {
  position: absolute; width: 2px; height: 2px; border-radius: 50%;
  background: var(--ph-color); box-shadow: 0 0 4px var(--ph-color);
  animation: rmFloat 8s ease-in-out infinite;
}
.rm-phase-tag {
  position: absolute; top: 14px; left: 14px;
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px;
  background: rgba(5,5,7,0.7);
  backdrop-filter: blur(4px);
  border: 1px solid color-mix(in srgb, var(--ph-color) 40%, transparent);
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px; letter-spacing: 0.2em;
  color: var(--ph-color);
}

.rm-info {
  position: relative;
  padding: 20px 24px 24px;
  background: linear-gradient(180deg, rgba(17,17,26,0.5), rgba(5,5,7,0.85));
}
.rm-hud { position: absolute; inset: 0; pointer-events: none; }
.rm-corner {
  position: absolute; width: 12px; height: 12px;
  border: 2px solid color-mix(in srgb, var(--ph-color) 60%, transparent);
}
.rm-corner-tl { top: 6px; left: 6px; border-right: none; border-bottom: none; }
.rm-corner-tr { top: 6px; right: 6px; border-left: none; border-bottom: none; }
.rm-corner-bl { bottom: 6px; left: 6px; border-right: none; border-top: none; }
.rm-corner-br { bottom: 6px; right: 6px; border-left: none; border-top: none; }
.rm-card:hover .rm-corner { animation: rmCornerFlick 0.4s steps(2); }
@keyframes rmCornerFlick { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.rm-hud-strip {
  position: absolute; top: 8px; right: 18px;
  display: flex; align-items: center; gap: 5px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 8px; letter-spacing: 0.15em;
  color: color-mix(in srgb, var(--ph-color) 70%, transparent);
}
.rm-hud-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--ph-color); box-shadow: 0 0 4px var(--ph-color);
  animation: rmBlink 1.6s ease-in-out infinite;
}
@keyframes rmBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

.rm-title { padding-top: 14px; }
.rm-title-text { will-change: transform, opacity; }
.rm-status {
  display: flex; align-items: center; gap: 6px;
  margin-top: 6px;
}
.rm-status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--ph-color); box-shadow: 0 0 6px var(--ph-color);
  animation: rmPulse 2s ease-in-out infinite;
}
@keyframes rmPulse {
  0%,100% { transform: scale(1); box-shadow: 0 0 6px var(--ph-color); }
  50% { transform: scale(1.3); box-shadow: 0 0 12px var(--ph-color); }
}

.rm-bullets { margin-top: 16px; display: flex; flex-direction: column; gap: 9px; }
.rm-bullet { display: flex; align-items: flex-start; gap: 10px; will-change: transform, opacity; }
.rm-bullet-marker {
  flex: 0 0 6px; width: 6px; height: 6px; margin-top: 7px;
  background: var(--ph-color); transform: rotate(45deg);
  box-shadow: 0 0 5px var(--ph-color);
}

.rm-cta {
  margin-top: 18px;
  display: flex; align-items: center; gap: 8px;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--ph-color) 20%, transparent);
}
.rm-cta-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px;
  border: 1px solid color-mix(in srgb, var(--ph-color) 50%, transparent);
  color: var(--ph-color);
  transition: transform 0.3s ease, background 0.3s ease;
}
.rm-card:hover .rm-cta-icon { transform: translate(2px,-2px); background: color-mix(in srgb, var(--ph-color) 15%, transparent); }

.rm-nav-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px;
  border: 1px solid rgba(0,240,255,0.3);
  background: rgba(8,10,18,0.6);
  color: rgba(0,240,255,0.8);
  transition: all 0.3s ease;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);
}
.rm-nav-btn:hover { background: rgba(0,240,255,0.12); color: #00F0FF; border-color: rgba(0,240,255,0.6); }
.rm-dots { display: flex; align-items: center; gap: 10px; }
.rm-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  transition: all 0.3s ease;
}
.rm-dot-active { width: 22px; border-radius: 4px; }

@media (max-width: 640px) {
  .rm-card { flex: 0 0 85vw; }
  .rm-art { padding-bottom: 60%; }
  .rm-info { padding: 16px 18px 18px; }
}
`}</style>
    </section>
  );
}
