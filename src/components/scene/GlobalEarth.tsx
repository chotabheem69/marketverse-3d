import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Sphere } from '@react-three/drei';
import { useMultipleQuotes } from '../../data/hooks';
import { useAppStore } from '../../store/appStore';
import { GLOBAL_INDICES, INDIA_INDICES } from '../../config/universe';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { getMarketStatus } from '../../utils/market-hours';
import * as THREE from 'three';

interface ExchangePin {
  name: string;
  lat: number;
  lon: number;
  symbol: string;
  indexName: string;
  market: string;
}

const EXCHANGES: ExchangePin[] = [
  { name: 'Mumbai (NSE)', lat: 19.076, lon: 72.877, symbol: '^NSEI', indexName: 'Nifty 50', market: 'NSE' },
  { name: 'New York (NYSE)', lat: 40.7128, lon: -74.006, symbol: '^GSPC', indexName: 'S&P 500', market: 'NYSE' },
  { name: 'London (LSE)', lat: 51.5074, lon: -0.1278, symbol: '^FTSE', indexName: 'FTSE 100', market: 'LSE' },
  { name: 'Tokyo (TSE)', lat: 35.6762, lon: 139.6503, symbol: '^N225', indexName: 'Nikkei 225', market: 'TSE' },
  { name: 'Hong Kong (HKEX)', lat: 22.3193, lon: 114.1694, symbol: '^HSI', indexName: 'Hang Seng', market: 'HKEX' },
  { name: 'Frankfurt (FWB)', lat: 50.1109, lon: 8.6821, symbol: '^GDAXI', indexName: 'DAX', market: 'FWB' },
  { name: 'São Paulo (B3)', lat: -23.5505, lon: -46.6333, symbol: '^BVSP', indexName: 'Bovespa', market: 'B3' },
  { name: 'NASDAQ', lat: 37.4, lon: -122.1, symbol: '^IXIC', indexName: 'NASDAQ', market: 'NASDAQ' },
];

// Convert lat/lon to 3D position on sphere
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function ExchangeColumn({ 
  pin, 
  globeRadius, 
  quote,
  onSelect,
}: { 
  pin: ExchangePin;
  globeRadius: number;
  quote: { price: number; changePercent: number } | undefined;
  onSelect: (pin: ExchangePin) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const currency = useAppStore((state) => state.currency);
  const marketStatus = getMarketStatus(pin.market);
  const isOpen = marketStatus.status === 'open' || marketStatus.status === 'pre-open';

  const position = latLonToVector3(pin.lat, pin.lon, globeRadius);
  const direction = position.clone().normalize();

  // Column height based on % change
  const height = quote ? Math.max(0.5, Math.abs(quote.changePercent) * 0.3 + 0.5) : 1;
  const color = quote 
    ? (quote.changePercent >= 0 ? '#10b981' : '#ef4444') 
    : '#64748b';

  useFrame(({ clock }) => {
    if (meshRef.current && isOpen) {
      // Pulse when market is open
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });

  return (
    <group position={position.toArray()}>
      {/* Column pointing outward from globe */}
      <group quaternion={new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
      )}>
        <mesh
          ref={meshRef}
          position={[0, height / 2, 0]}
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
            onSelect(pin);
          }}
        >
          <cylinderGeometry args={[0.15, 0.15, height, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={isOpen ? color : '#000000'}
            emissiveIntensity={isOpen ? 0.3 : 0}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* Open/closed indicator */}
        <mesh position={[0, height + 0.3, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color={isOpen ? '#10b981' : '#ef4444'} />
        </mesh>
      </group>

      {/* Label */}
      {hovered && (
        <Html
          position={[direction.x * 2, direction.y * 2 + 1, direction.z * 2]}
          center
          distanceFactor={10}
        >
          <div className="glass rounded-lg px-3 py-2 text-xs whitespace-nowrap">
            <p className="font-bold text-white">{pin.name}</p>
            <p className="text-slate-400">{pin.indexName}</p>
            {quote && (
              <>
                <p className="text-white mt-1">
                  {formatCurrency(quote.price, currency, false)}
                </p>
                <p className={quote.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {formatPercent(quote.changePercent)}
                </p>
              </>
            )}
            <p className={`mt-1 ${isOpen ? 'text-green-400' : 'text-red-400'}`}>
              {isOpen ? '🟢 Open' : '🔴 Closed'}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

function ConnectionArc({ start, end, globeRadius }: { 
  start: THREE.Vector3; 
  end: THREE.Vector3;
  globeRadius: number;
}) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(globeRadius * 1.3);
    
    for (let t = 0; t <= 1; t += 0.05) {
      const p = new THREE.Vector3();
      p.lerpVectors(start, end, t);
      const arcHeight = Math.sin(t * Math.PI);
      const elevated = p.clone().normalize().multiplyScalar(globeRadius + arcHeight * 2);
      pts.push(elevated);
    }
    return pts;
  }, [start, end, globeRadius]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#06b6d4" transparent opacity={0.3} />
    </line>
  );
}

export function GlobalEarth() {
  const setSelectedInstrument = useAppStore((state) => state.setSelectedInstrument);
  const globeRef = useRef<THREE.Mesh>(null);
  const globeRadius = 7;

  const allSymbols = useMemo(() => [
    ...GLOBAL_INDICES.map(i => i.symbol),
    ...INDIA_INDICES.map(i => i.symbol),
  ], []);
  const { data } = useMultipleQuotes(allSymbols);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  const handleSelectExchange = (pin: ExchangePin) => {
    const instrument = {
      id: pin.symbol,
      symbol: pin.symbol,
      name: pin.indexName,
      type: 'index' as const,
      region: 'GLOBAL' as const,
      currency: 'INR',
    };
    setSelectedInstrument(instrument);
  };

  // Connection arcs from Mumbai to other exchanges
  const mumbaiPos = latLonToVector3(19.076, 72.877, globeRadius);
  const arcExchanges = EXCHANGES.filter(e => e.name !== 'Mumbai (NSE)');

  return (
    <group>
      {/* Globe */}
      <group ref={globeRef}>
        {/* Earth sphere */}
        <Sphere args={[globeRadius, 64, 64]}>
          <meshStandardMaterial
            color="#1e3a5f"
            metalness={0.3}
            roughness={0.7}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Wireframe overlay */}
        <Sphere args={[globeRadius * 1.001, 32, 32]}>
          <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.1} />
        </Sphere>

        {/* Latitude/longitude lines */}
        {[-60, -30, 0, 30, 60].map(lat => (
          <mesh key={`lat-${lat}`} rotation={[lat * Math.PI / 180, 0, 0]}>
            <ringGeometry args={[globeRadius * Math.cos(lat * Math.PI / 180) - 0.02, 
                                 globeRadius * Math.cos(lat * Math.PI / 180) + 0.02, 64]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        ))}

        {/* Exchange columns */}
        {EXCHANGES.map(pin => {
          const quote = data?.get(pin.symbol);
          return (
            <ExchangeColumn
              key={pin.symbol}
              pin={pin}
              globeRadius={globeRadius}
              quote={quote ? { price: quote.price, changePercent: quote.changePercent } : undefined}
              onSelect={handleSelectExchange}
            />
          );
        })}

        {/* Connection arcs from Mumbai */}
        {arcExchanges.map(pin => {
          const pos = latLonToVector3(pin.lat, pin.lon, globeRadius);
          return (
            <ConnectionArc
              key={pin.symbol}
              start={mumbaiPos}
              end={pos}
              globeRadius={globeRadius}
            />
          );
        })}
      </group>

      {/* World clock */}
      <Html position={[-15, 8, 0]} center distanceFactor={20}>
        <div className="glass rounded-xl p-4 w-64">
          <h3 className="text-white font-bold mb-2 text-sm">🌍 World Clock</h3>
          <div className="space-y-2">
            {EXCHANGES.map(ex => {
              const status = getMarketStatus(ex.market);
              return (
                <div key={ex.market} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{ex.name.split('(')[0].trim()}</span>
                  <span className={status.status === 'open' ? 'text-green-400' : 'text-red-400'}>
                    {status.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Html>

      {/* Title */}
      <Text
        position={[0, 12, 0]}
        fontSize={1.5}
        color="#06b6d4"
        anchorX="center"
      >
        Global Earth
      </Text>
    </group>
  );
}
