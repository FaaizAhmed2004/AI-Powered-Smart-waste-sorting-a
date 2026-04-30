import { useEffect, useState, useRef } from "react";

interface Coin {
  id: number;
  x: number;
  delay: number;
  size: number;
  drift: number;
}

interface CoinAnimationProps {
  points: number;
  onComplete?: () => void;
}

// Inject keyframes once into the document head
const injectStyles = () => {
  if (document.getElementById("coin-anim-styles")) return;
  const style = document.createElement("style");
  style.id = "coin-anim-styles";
  style.textContent = `
    @keyframes coinFly {
      0%   { transform: translateY(0)      scale(0.6) rotate(0deg);   opacity: 1; }
      70%  { opacity: 1; }
      100% { transform: translateY(-90vh)  scale(1.3) rotate(720deg); opacity: 0; }
    }
    @keyframes pointsPop {
      0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
      25%  { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
      60%  { transform: translate(-50%, -50%) scale(1.0); opacity: 1; }
      85%  { transform: translate(-50%, -50%) scale(1.0); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
    }
    @keyframes shimmer {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
};

const CoinAnimation = ({ points, onComplete }: CoinAnimationProps) => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [visible, setVisible] = useState(true);
  const injected = useRef(false);

  useEffect(() => {
    if (!injected.current) {
      injectStyles();
      injected.current = true;
    }

    const count = Math.max(8, Math.min(points, 25));
    const generated: Coin[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      delay: Math.random() * 800,
      size: 24 + Math.random() * 22,
      drift: (Math.random() - 0.5) * 60,
    }));
    setCoins(generated);

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Points banner */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          animation: "pointsPop 2.4s ease-in-out forwards",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "white",
            fontWeight: 900,
            fontSize: "2.5rem",
            padding: "1rem 2rem",
            borderRadius: "1.25rem",
            boxShadow: "0 8px 32px rgba(245,158,11,0.5), 0 0 0 4px rgba(253,230,138,0.6)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            border: "3px solid #fde68a",
          }}
        >
          <span style={{ fontSize: "2.8rem" }}>🪙</span>
          <span>+{points}</span>
          <span style={{ fontSize: "1.5rem", opacity: 0.9 }}>pts</span>
        </div>
      </div>

      {/* Flying coins */}
      {coins.map((coin) => (
        <div
          key={coin.id}
          style={{
            position: "absolute",
            bottom: "5rem",
            left: `${coin.x}%`,
            fontSize: `${coin.size}px`,
            animation: `coinFly 1.9s ease-out forwards`,
            animationDelay: `${coin.delay}ms`,
            opacity: 0,
            animationFillMode: "both",
          }}
        >
          🪙
        </div>
      ))}

      {/* Confetti-like sparkles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`spark-${i}`}
          style={{
            position: "absolute",
            bottom: "5rem",
            left: `${8 + i * 7.5}%`,
            fontSize: `${12 + Math.random() * 10}px`,
            animation: `coinFly ${1.2 + Math.random() * 0.8}s ease-out forwards`,
            animationDelay: `${Math.random() * 500}ms`,
            animationFillMode: "both",
            opacity: 0,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

export default CoinAnimation;
