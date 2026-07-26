import { useEffect, useRef, useState } from 'react';
import { Brain, Zap, AlertTriangle } from 'lucide-react';

const PHASES = [
  { pct: 20, label: 'Twitchy', color: '#39FF14', desc: 'Mild tremors. You checked the chart twice.' },
  { pct: 45, label: 'Hyper-Reflex', color: '#00F0FF', desc: 'Sandevistan kicks in. Fingers blur across the swap button.' },
  { pct: 70, label: 'Overclocked', color: '#FFE600', desc: 'Heart rate 180. You\'re diamond-handling a memecoin at 3 AM.' },
  { pct: 90, label: 'Cyberpsycho', color: '#FF00A8', desc: 'Reality is a construct. There is only $CYBER.' },
  { pct: 100, label: 'FLATLINE', color: '#FF2D2D', desc: 'You\'ve become the chart. The chart is you. GG.' },
];

export default function CyberpsychoMeter() {
  const [level, setLevel] = useState(0);
  const [auto, setAuto] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <section id="meter" ref={sectionRef} className="relative px-5 py-24">
      <div className="mx-auto max-w-3xl">
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

        <div className="reveal-pop clip-cyber scan-card border border-cyber-magenta/40 bg-cyber-panel/60 p-8 box-glow-cyan">
          {/* Bar */}
          <div className="relative h-10 w-full overflow-hidden border border-cyber-cyan/30 bg-cyber-darker">
            <div
              className="h-full transition-all duration-100 ease-linear"
              style={{
                width: `${level}%`,
                background: `linear-gradient(90deg, #39FF14, #00F0FF, #FFE600, #FF00A8, #FF2D2D)`,
                boxShadow: `0 0 20px ${current.color}`,
              }}
            />
            {/* Tick marks */}
            {[20, 40, 60, 80].map((t) => (
              <div key={t} className="absolute top-0 h-full w-px bg-cyber-dark/60" style={{ left: `${t}%` }} />
            ))}
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
                style={{ color: current.color, textShadow: `0 0 12px ${current.color}` }}
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
      </div>
    </section>
  );
}
