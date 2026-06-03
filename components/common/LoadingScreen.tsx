'use client';
import Image from 'next/image';

interface Props {
  message?: string;
  fullscreen?: boolean;
}

export default function LoadingScreen({ message = 'Chargement', fullscreen = true }: Props) {
  const wrapper = fullscreen
    ? { position: 'fixed' as const, inset: 0 as const, zIndex: 9999, background: '#1A1F0E' }
    : { minHeight: '60vh' };

  return (
    <div className="flex flex-col items-center justify-center" style={wrapper}>
      {/* Logo + rings */}
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>

        {/* Outer spinning ring */}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1.5px solid transparent',
            borderTopColor: 'rgba(232,185,106,0.75)',
            borderRightColor: 'rgba(232,185,106,0.15)',
            animation: 'spinRing 1.6s linear infinite',
          }}
        />

        {/* Inner counter-spinning ring */}
        <div
          style={{
            position: 'absolute', inset: 14, borderRadius: '50%',
            border: '0.5px solid transparent',
            borderTopColor: 'rgba(232,185,106,0.3)',
            borderLeftColor: 'rgba(232,185,106,0.1)',
            animation: 'spinRing 3s linear infinite reverse',
          }}
        />

        {/* Static decorative ring */}
        <div
          style={{
            position: 'absolute', inset: 28, borderRadius: '50%',
            border: '0.5px solid rgba(232,185,106,0.08)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            position: 'relative', width: 160, height: 160,
            animation: 'logoPulse 2s ease-in-out infinite',
          }}
        >
          <Image
            src="/images/noBack.png"
            alt="La Catena"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Text + bouncing dots */}
      <div className="flex items-center gap-2 mt-8">
        <span style={{
          fontSize: 9, letterSpacing: '5px',
          textTransform: 'uppercase', color: 'rgba(232,185,106,0.45)',
        }}>
          {message}
        </span>
        <span className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 3, height: 3, borderRadius: '50%',
                background: 'rgba(232,185,106,0.55)',
                display: 'inline-block',
                animation: `dotBounce 1.3s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </span>
      </div>

      {/* Keyframes injectés inline pour garantir leur exécution */}
      <style>{`
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes logoPulse {
          0%, 100% { opacity: 0.75; filter: drop-shadow(0 0 8px rgba(232,185,106,0.2)) brightness(1); }
          50%       { opacity: 1;    filter: drop-shadow(0 0 28px rgba(232,185,106,0.7)) brightness(1.2); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%           { transform: translateY(-5px); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
