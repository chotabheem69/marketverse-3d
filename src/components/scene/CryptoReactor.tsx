import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import { useCoinMarketData } from '../../data/hooks';
import { useAppStore } from '../../store/appStore';
import { TOP_CRYPTO } from '../../config/universe';
import { formatCurrency, formatPercent, formatMarketCap } from '../../utils/formatters';
import { fetchBTCdominance } from '../../data/providers/coingecko';
import * as THREE from 'three';
import type { Instrument } from '../../data/types';

function CryptoPillar({ 
  coin, 
  angle, 
  radius, 
  price,
  changePercent,
  marketCap,
  onSelect,
}: {
  coin: typeof TOP_CRYPTO[0];
  angle: number;
  radius: number;
  price: number;
  changePercent: number;
  marketCap: number;
  onSelect: (coin: typeof TOP_CRYPTO[0]) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const currency = useAppStore((state) => state.currency);
  const usdToInr = 83.5;

  // Height based on market cap (log scale)
  const height = useMemo(() => {
    if (marketCap <= 0) return 2;
    const logScale = Math.log10(marketCap);
    return Math.max(2, Math.min(15, logScale * 1.2));
  }, [marketCap]);

  const color = changePercent >= 0 ? '#10b981' : '#ef4444';

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Pulse effect based on price change
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.05 * Math.abs(changePercent) / 5;
      meshRef.current.scale.set(pulse, 1, pulse);
    }
  });

  const displayPrice = currency === 'INR' ? price * usdToInr : price;

  return (
    <group position={[Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius]}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(coin);
        }}
        castShadow
      >
        <cylinderGeometry args={[0.6, 0.8, height, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.3}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Glow ring at base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2 + 0.05, 0]}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, height / 2 + 0.8, 0]}
        fontSize={0.5}
        color={hovered ? '#ffffff' : '#94a3b8'}
        anchorX="center"
      >
        {coin.symbol}
      </Text>

      {/* Tooltip */}
      {hovered && (
        <Html position={[0, height / 2 + 2, 0]} center distanceFactor={15}>
          <div className="glass rounded-lg px-3 py-2 text-xs whitespace-nowrap">
            <p className="font-bold text-white">{coin.name}</p>
            <p className="text-white mt-1">
              {formatCurrency(displayPrice, currency, currency === 'INR')}
            </p>
            <p className={changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
              24h: {formatPercent(changePercent)}
            </p>
            <p className="text-slate-400">
              MCap: {formatMarketCap(marketCap, currency)}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

function CentralCore({ btcDominance }: { btcDominance: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  const size = 2 + (btcDominance / 100) * 3;

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[size, 1]} />
        <meshStandardMaterial
          color="#f7931a"
          emissive="#f7931a"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
          wireframe
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[size * 0.7, 32, 32]} />
        <meshStandardMaterial
          color="#f7931a"
          emissive="#f7931a"
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* BTC dominance label */}
      <Text
        position={[0, size + 1.5, 0]}
        fontSize={0.8}
        color="#f7931a"
        anchorX="center"
      >
        BTC Dom: {btcDominance.toFixed(1)}%
      </Text>
    </group>
  );
}

export function CryptoReactor() {
  const setSelectedInstrument = useAppStore((state) => state.setSelectedInstrument);
  const currency = useAppStore((state) => state.currency);
  const setCurrency = useAppStore((state) => state.setCurrency);
  const useDemoData = useAppStore((state) => state.useDemoData);
  const [btcDominance, setBtcDominance] = useState(52.5);

  const coinIds = useMemo(() => TOP_CRYPTO.map(c => c.id), []);
  const { data } = useCoinMarketData(coinIds, currency === 'INR' ? 'inr' : 'usd');

  // Fetch BTC dominance
  useEffect(() => {
    fetchBTCdominance(useDemoData).then(setBtcDominance);
  }, [useDemoData]);

  const handleSelectCoin = (coin: typeof TOP_CRYPTO[0]) => {
    const instrument: Instrument = {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      type: 'crypto',
      region: 'GLOBAL',
      currency: 'USD',
    };
    setSelectedInstrument(instrument);
  };

  return (
    <group>
      {/* Dark reactor floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Reactor rings */}
      {[8, 14, 20].map((radius, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[radius - 0.1, radius + 0.1, 64]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.2 - i * 0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Central BTC core */}
      <CentralCore btcDominance={btcDominance} />

      {/* Crypto pillars in circular arrangement */}
      {TOP_CRYPTO.slice(1, 21).map((coin, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 10 + (i % 3) * 3;
        const quote = data?.quotes?.get(coin.id);
        const price = quote?.price || 0;
        const changePercent = quote?.changePercent || 0;
        const marketCap = quote?.marketCap || 0;

        return (
          <CryptoPillar
            key={coin.id}
            coin={coin}
            angle={angle}
            radius={radius}
            price={price}
            changePercent={changePercent}
            marketCap={marketCap}
            onSelect={handleSelectCoin}
          />
        );
      })}

      {/* Energy beams */}
      {[0, 1, 2, 3].map(i => (
        <EnergyBeam key={i} angle={(i / 4) * Math.PI * 2} />
      ))}

      {/* USD/INR Toggle */}
      <Float speed={0.5} floatIntensity={0.3}>
        <group position={[15, 8, 0]}>
          <Html center distanceFactor={20}>
            <button
              onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
              className="glass rounded-xl px-6 py-3 text-white font-medium hover:bg-primary/20 transition-colors"
            >
              {currency === 'INR' ? '₹ INR' : '$ USD'}
            </button>
          </Html>
        </group>
      </Float>

      {/* Title */}
      <Text
        position={[0, 18, 0]}
        fontSize={1.5}
        color="#06b6d4"
        anchorX="center"
      >
        Crypto Reactor
      </Text>
    </group>
  );
}

function EnergyBeam({ angle }: { angle: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.1 + Math.sin(clock.getElapsedTime() * 2 + angle) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[Math.cos(angle) * 15, 8, Math.sin(angle) * 15]} rotation={[0, angle + Math.PI / 2, 0]}>
      <planeGeometry args={[0.1, 16]} />
      <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}
