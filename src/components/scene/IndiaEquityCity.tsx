import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import { useMultipleQuotes } from '../../data/hooks';
import { useAppStore } from '../../store/appStore';
import { NIFTY_50, INDIA_INDICES } from '../../config/universe';
import { getChangeColor, getTowerHeight, getSectorColor, generateGridPositions } from '../../hooks/useStockColor';
import { formatCurrency, formatPercent, formatVolume } from '../../utils/formatters';
import { registerInstruments } from '../../data/registry';
import * as THREE from 'three';
import type { Instrument } from '../../data/types';

// Sector layout positions
const SECTOR_POSITIONS: Record<string, [number, number]> = {
  'Banking': [-15, -10],
  'IT': [0, -10],
  'Energy': [15, -10],
  'Auto': [-15, 5],
  'FMCG': [0, 5],
  'Pharma': [15, 5],
  'Metals': [-15, 18],
  'Power': [0, 18],
  'Telecom': [15, 18],
  'Consumer Goods': [-15, -22],
  'Financial Services': [0, -22],
  'Construction': [15, -22],
  'Infrastructure': [-15, -35],
  'Cement': [0, -35],
  'Insurance': [15, -35],
  'Conglomerate': [-15, 30],
  'Healthcare': [0, 30],
  'Mining': [15, 30],
};

// Sector icons for billboard signs
const SECTOR_ICONS: Record<string, string> = {
  'Banking': '🏦',
  'IT': '💻',
  'Energy': '⚡',
  'Auto': '🚗',
  'FMCG': '🛒',
  'Pharma': '💊',
  'Metals': '⚙️',
  'Power': '🔌',
  'Telecom': '📡',
  'Consumer Goods': '🏪',
  'Financial Services': '💰',
  'Construction': '🏗️',
  'Infrastructure': '🛣️',
  'Cement': '🧱',
  'Insurance': '🛡️',
  'Conglomerate': '🏢',
  'Healthcare': '🏥',
  'Mining': '⛏️',
};

interface StockTowerData {
  stock: typeof NIFTY_50[0];
  position: [number, number];
  sector: string;
}

function StockTower({ 
  data, 
  price, 
  changePercent, 
  volume,
  isAnyPanelOpen,
  onHover, 
  onClick 
}: { 
  data: StockTowerData;
  price: number | undefined;
  changePercent: number | undefined;
  volume: number | undefined;
  isAnyPanelOpen: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const currency = useAppStore((state) => state.currency);
  const gameHoveredId = useAppStore((state) => state.gameHoveredId);
  
  const isGameHovered = gameHoveredId === data.stock.symbol;
  const isHighlighted = hovered || isGameHovered;
  
  const height = price ? getTowerHeight(price * 1e7) : 5;
  const color = changePercent !== undefined ? getChangeColor(changePercent) : '#64748b';
  const sectorColor = getSectorColor(data.sector);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const targetScale = isHighlighted ? 1.1 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, 1, targetScale),
        0.1
      );
    }
    // Pulsing base glow
    if (glowRef.current) {
      const pulse = 0.4 + Math.sin(clock.getElapsedTime() * 2 + data.position[0]) * 0.15;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = isHighlighted ? 0.9 : pulse;
      material.color.set(isGameHovered ? '#06b6d4' : (hovered ? sectorColor : color));
    }
  });

  return (
    <group position={[data.position[0], height / 2, data.position[1]]}>
      {/* Base glow ring */}
      <mesh 
        ref={glowRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -height / 2 + 0.05, 0]}
      >
        <ringGeometry args={[0.9, 1.8, 32]} />
        <meshBasicMaterial 
          color={hovered ? sectorColor : color}
          transparent 
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main tower */}
      <mesh
        ref={meshRef}
        userData={{ hoverable: true, instrumentId: data.stock.symbol }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          setHovered(false);
          onHover(false);
          onClick();
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.5, height, 1.5]} />
        <meshStandardMaterial 
          color={isHighlighted && !isAnyPanelOpen ? (isGameHovered ? '#06b6d4' : sectorColor) : color}
          metalness={0.5}
          roughness={0.3}
          emissive={isHighlighted && !isAnyPanelOpen ? (isGameHovered ? '#06b6d4' : sectorColor) : color}
          emissiveIntensity={isHighlighted && !isAnyPanelOpen ? 0.6 : 0.1}
        />
      </mesh>

      {/* Roof antenna/light */}
      <mesh position={[0, height / 2 + 0.3, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color={changePercent && changePercent >= 0 ? '#10b981' : '#ef4444'} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, height / 2 + 0.8, 0]}
        fontSize={0.4}
        color={isHighlighted && !isAnyPanelOpen ? '#ffffff' : '#cbd5e1'}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {data.stock.symbol.replace('.NS', '')}
      </Text>

      {/* Tooltip on hover (orbit mode only - game mode uses auto-open) */}
      {hovered && !isAnyPanelOpen && (
        <Html
          position={[0, height / 2 + 2, 0]}
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none' }}
        >
          <div className="glass rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
            <p className="font-bold text-white">{data.stock.name}</p>
            <p className="text-slate-400">{data.sector}</p>
            {price !== undefined && (
              <>
                <p className="text-white mt-1">
                  {formatCurrency(price, currency)}
                </p>
                {changePercent !== undefined && (
                  <p className={changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatPercent(changePercent)}
                  </p>
                )}
                {volume !== undefined && (
                  <p className="text-slate-400">Vol: {formatVolume(volume)}</p>
                )}
              </>
            )}
            <p className="text-cyan-400 mt-1 text-[10px]">Click for details</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function SectorPlate({ name, position }: { name: string; position: [number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.12 + Math.sin(clock.getElapsedTime() * 0.5 + position[0]) * 0.03;
    }
  });

  return (
    <group position={[position[0], 0.01, position[1]]}>
      {/* Ground plate */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial 
          color={getSectorColor(name)} 
          opacity={0.15} 
          transparent
          emissive={getSectorColor(name)}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Border (neon outline) */}
      <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(12, 10)]} />
        <lineBasicMaterial color={getSectorColor(name)} opacity={0.6} transparent />
      </lineSegments>

      {/* Corner accents */}
      {[[-6, -5], [6, -5], [-6, 5], [6, 5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 8]} />
          <meshBasicMaterial color={getSectorColor(name)} />
        </mesh>
      ))}
      
      {/* Billboard Sign - floating above sector */}
      <Float speed={1.5} floatIntensity={0.3} rotationIntensity={0}>
        <group position={[0, 3, -6]}>
          {/* Sign background */}
          <mesh>
            <planeGeometry args={[4, 1.2]} />
            <meshStandardMaterial 
              color="#0f172a"
              emissive={getSectorColor(name)}
              emissiveIntensity={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Sign border */}
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(4, 1.2)]} />
            <lineBasicMaterial color={getSectorColor(name)} />
          </lineSegments>
          {/* Icon */}
          <Text
            position={[-1.4, 0, 0.01]}
            fontSize={0.6}
            anchorX="center"
            anchorY="middle"
          >
            {SECTOR_ICONS[name] || '📊'}
          </Text>
          {/* Text */}
          <Text
            position={[0.3, 0, 0.01]}
            fontSize={0.45}
            color={getSectorColor(name)}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {name.toUpperCase()}
          </Text>
        </group>
      </Float>
    </group>
  );
}

function MarketTicker() {
  const indexSymbols = INDIA_INDICES.map(i => i.symbol);
  const { data } = useMultipleQuotes(indexSymbols);
  const currency = useAppStore((state) => state.currency);

  if (!data) return null;

  return (
    <Float speed={1} floatIntensity={0.3} rotationIntensity={0}>
      <group position={[0, 18, -25]}>
        <Html center distanceFactor={25}>
          <div className="glass rounded-xl px-6 py-3 flex gap-6 text-sm shadow-2xl">
            {INDIA_INDICES.map((idx) => {
              const quote = data?.get(idx.symbol);
              if (!quote) return null;
              return (
                <div key={idx.symbol} className="flex items-center gap-2">
                  <span className="text-slate-400">{idx.name}</span>
                  <span className="text-white font-mono font-bold">
                    {formatCurrency(quote.price, currency, false)}
                  </span>
                  <span className={`font-medium ${quote.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercent(quote.changePercent)}
                  </span>
                </div>
              );
            })}
          </div>
        </Html>
      </group>
    </Float>
  );
}

// Animated trade flow particles - represent trading activity
function TradeParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 300;

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spawn around the city
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = Math.random() * 20 + 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 80;

      // Movement direction
      velocities[i3] = (Math.random() - 0.5) * 0.05;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.05;

      // Color: cyan/teal mix
      colors[i3] = 0.1 + Math.random() * 0.3;
      colors[i3 + 1] = 0.7 + Math.random() * 0.3;
      colors[i3 + 2] = 0.8 + Math.random() * 0.2;
    }
    return { positions, velocities, colors };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3] += velocities[i3];
      arr[i3 + 1] += velocities[i3 + 1];
      arr[i3 + 2] += velocities[i3 + 2];

      // Wrap around bounds
      if (arr[i3] > 30) arr[i3] = -30;
      if (arr[i3] < -30) arr[i3] = 30;
      if (arr[i3 + 1] > 25) arr[i3 + 1] = 2;
      if (arr[i3 + 1] < 2) arr[i3 + 1] = 25;
      if (arr[i3 + 2] > 40) arr[i3 + 2] = -40;
      if (arr[i3 + 2] < -40) arr[i3 + 2] = 40;
    }
    posAttr.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// Animated road network with moving dots (representing trading activity)
function RoadNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create roads connecting sectors
  const roads = useMemo(() => {
    const roadList: Array<{ start: [number, number]; end: [number, number] }> = [];
    const sectors = Object.values(SECTOR_POSITIONS);
    
    // Connect adjacent sectors
    for (let i = 0; i < sectors.length; i++) {
      for (let j = i + 1; j < sectors.length; j++) {
        const dx = sectors[i][0] - sectors[j][0];
        const dz = sectors[i][1] - sectors[j][1];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 20) {
          roadList.push({ start: sectors[i], end: sectors[j] });
        }
      }
    }
    return roadList;
  }, []);

  return (
    <group ref={groupRef}>
      {roads.map((road, i) => {
        const dx = road.end[0] - road.start[0];
        const dz = road.end[1] - road.start[1];
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);
        const cx = (road.start[0] + road.end[0]) / 2;
        const cz = (road.start[1] + road.end[1]) / 2;

        return (
          <mesh
            key={i}
            position={[cx, 0.02, cz]}
            rotation={[-Math.PI / 2, 0, angle]}
          >
            <planeGeometry args={[0.3, length]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} />
          </mesh>
        );
      })}
    </group>
  );
}

// Central monument - NIFTY 50 symbol
function CentralMonument() {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -clock.getElapsedTime() * 0.2;
      ring2Ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer ring */}
      <mesh ref={ringRef} position={[0, 15, 0]}>
        <torusGeometry args={[8, 0.1, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} />
      </mesh>
      {/* Inner ring */}
      <mesh ref={ring2Ref} position={[0, 15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6, 0.1, 16, 100]} />
        <meshBasicMaterial color="#14b8a6" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Sky glow - hemisphere lighting effect
function SkyGlow() {
  return (
    <>
      <hemisphereLight args={['#06b6d4', '#0a0e1a', 0.3]} />
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[120, 32, 32]} />
        <meshBasicMaterial color="#0a1628" side={THREE.BackSide} />
      </mesh>
    </>
  );
}

export function IndiaEquityCity() {
  const setSelectedInstrument = useAppStore((state) => state.setSelectedInstrument);
  const isDetailPanelOpen = useAppStore((state) => state.isDetailPanelOpen);

  // Register all Indian instruments for raycasting lookup
  useEffect(() => {
    const instruments: Instrument[] = NIFTY_50.map(s => ({
      id: s.symbol,
      symbol: s.symbol.replace('.NS', ''),
      name: s.name,
      type: 'stock',
      region: 'IN',
      sector: s.sector,
      currency: 'INR',
    }));
    registerInstruments(instruments);
  }, []);

  // Group stocks by sector
  const stocksBySector = useMemo(() => {
    const grouped: Record<string, StockTowerData[]> = {};
    
    for (const stock of NIFTY_50) {
      const sector = stock.sector;
      if (!grouped[sector]) {
        grouped[sector] = [];
      }
      
      const sectorPos = SECTOR_POSITIONS[sector] || [0, 0];
      const sectorStocks = grouped[sector];
      const positions = generateGridPositions(
        NIFTY_50.filter(s => s.sector === sector).length,
        2.5,
        sectorPos[0],
        sectorPos[1]
      );
      
      const idx = sectorStocks.length;
      if (idx < positions.length) {
        grouped[sector].push({
          stock,
          position: positions[idx],
          sector,
        });
      }
    }
    
    return grouped;
  }, []);

  const allStockSymbols = useMemo(() => NIFTY_50.map(s => s.symbol), []);
  const { data: quotesData } = useMultipleQuotes(allStockSymbols);

  const handleTowerClick = useCallback((stock: typeof NIFTY_50[0]) => {
    const instrument: Instrument = {
      id: stock.symbol,
      symbol: stock.symbol.replace('.NS', ''),
      name: stock.name,
      type: 'stock',
      region: 'IN',
      sector: stock.sector,
      currency: 'INR',
    };
    setSelectedInstrument(instrument);
  }, [setSelectedInstrument]);

  return (
    <group>
      {/* Sky and atmosphere */}
      <SkyGlow />

      {/* Central monument */}
      <CentralMonument />

      {/* Road network */}
      <RoadNetwork />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[150, 120]} />
        <meshStandardMaterial color="#0f172a" opacity={0.9} transparent />
      </mesh>

      {/* Market ticker */}
      <MarketTicker />

      {/* Sector plates and stock towers */}
      {Object.entries(stocksBySector).map(([sector, stocks]) => {
        const sectorPos = SECTOR_POSITIONS[sector] || [0, 0];
        
        return (
          <group key={sector}>
            <SectorPlate name={sector} position={sectorPos} />
            
            {/* Sector-specific point light */}
            <pointLight
              position={[sectorPos[0], 8, sectorPos[1]]}
              color={getSectorColor(sector)}
              intensity={0.5}
              distance={15}
              decay={2}
            />
            
            {stocks.map((stockData) => {
              const quote = quotesData?.get(stockData.stock.symbol);
              return (
                <StockTower
                  key={stockData.stock.symbol}
                  data={stockData}
                  price={quote?.price}
                  changePercent={quote?.changePercent}
                  volume={quote?.volume}
                  isAnyPanelOpen={isDetailPanelOpen}
                  onHover={() => {}}
                  onClick={() => handleTowerClick(stockData.stock)}
                />
              );
            })}
          </group>
        );
      })}

      {/* Animated trade particles */}
      <TradeParticles />

      {/* Ambient atmospheric particles */}
      <AtmosphericParticles />
    </group>
  );
}

function AtmosphericParticles() {
  const points = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 30 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        color="#06b6d4"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}
