import { Rocket, Skull, Music, Globe } from 'lucide-react';

const PHASES = [
  {
    phase: 'PHASE 01',
    title: 'JACK IN',
    status: 'COMPLETE',
    icon: Rocket,
    color: 'green',
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
    points: [
      'CyberDAO governance launch',
      'Cross-chain bridge to the metaverse',
      'IRL Night City meetups (we wish)',
      'The moon. Obviously the moon.',
    ],
  },
];

const colorMap: Record<string, { text: string; border: string; dot: string; status: string }> = {
  green: { text: 'text-cyber-green', border: 'border-cyber-green/40', dot: 'bg-cyber-green', status: 'text-cyber-green' },
  cyan: { text: 'text-cyber-cyan', border: 'border-cyber-cyan/40', dot: 'bg-cyber-cyan', status: 'text-cyber-cyan' },
  magenta: { text: 'text-cyber-magenta', border: 'border-cyber-magenta/40', dot: 'bg-cyber-magenta', status: 'text-cyber-magenta' },
  yellow: { text: 'text-cyber-yellow', border: 'border-cyber-yellow/40', dot: 'bg-cyber-yellow', status: 'text-cyber-yellow' },
};

export default function Roadmap() {
  return (
    <section id="roadmap" className="relative px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center reveal-glitch">
          <div className="font-mono text-xs tracking-[0.4em] text-cyber-green animate-flicker">// THE MISSION LOG</div>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
            ROAD<span className="text-cyber-green text-glow-cyan rgb-hover">MAP</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-lg text-gray-400">
            We don't make promises. We make threats. Here's the plan — subject to cyberpsycho disruption.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-cyber-green via-cyber-cyan to-cyber-magenta md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-10">
            {PHASES.map((p, i) => {
              const c = colorMap[p.color];
              const left = i % 2 === 0;
              return (
                <div key={i} className={`relative flex ${left ? 'md:justify-start' : 'md:justify-end'}`}>
                  <div className={`w-full pl-16 md:w-1/2 md:pl-0 ${left ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className={`reveal-${left ? 'left' : 'right'} clip-cyber scan-card holo-card border ${c.border} bg-cyber-panel/60 p-6 transition-all hover:bg-cyber-panel/80`}>
                      <div className={`flex items-center gap-2 ${left ? 'md:justify-end' : ''}`}>
                        <p.icon className={`h-5 w-5 ${c.text}`} />
                        <span className="font-mono text-xs tracking-widest text-gray-400">{p.phase}</span>
                      </div>
                      <h3 className={`mt-2 font-display text-2xl font-black tracking-wide ${c.text}`}>{p.title}</h3>
                      <span className={`mt-1 inline-block font-mono text-xs tracking-widest ${c.status}`}>
                        ● {p.status}
                      </span>
                      <ul className={`mt-4 space-y-2 ${left ? 'md:text-right' : ''}`}>
                        {p.points.map((pt, j) => (
                          <li key={j} className="font-body text-sm text-gray-300">— {pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Node */}
                  <div className={`absolute left-6 top-6 -translate-x-1/2 md:left-1/2`}>
                    <div className={`h-4 w-4 rounded-full ${c.dot} ring-4 ring-cyber-darker`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
