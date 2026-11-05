import { useMemo, useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import { useMultipleQuotes } from '../../data/hooks';
import { useAppStore } from '../../store/appStore';
import { NIFTY_50, INDIA_INDICES } from '../../config/universe';
import { getChangeColor, getTowerHeight, getSectorColor, generateGridPositions } from '../../hooks/useStockColor';
import { formatCurrency, formatPercent, formatVolume } from '../../utils/formatters';
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
  onHover, 
  onClick 
}: { 
  data: StockTowerData;
  price: number | undefined;
  changePercent: number | undefined;
  volume: number | undefined;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const currency = useAppStore((state) => state.currency);
  
  const height = price ? getTowerHeight(price * 1e7) : 5; // Rough proxy for market cap
  const color = changePercent !== undefined ? getChangeColor(changePercent) : '#64748b';
  const sectorColor = getSectorColor(data.sector);

  useFrame(() => {
    if (meshRef.current) {
      // Smooth scale animation
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, 1, targetScale),
        0.1
      );
    }
  });

  return (
    <group position={[data.position[0], height / 2, data.position[1]]}>
      <mesh
        ref={meshRef}
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
          onClick();
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.5, height, 1.5]} />
        <meshStandardMaterial 
          color={hovered ? sectorColor : color}
          metalness={0.3}
          roughness={0.4}
          emissive={hovered ? sectorColor : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, height / 2 + 0.8, 0]}
        fontSize={0.4}
        color={hovered ? '#ffffff' : '#94a3b8'}
        anchorX="center"
        anchorY="bottom"
      >
        {data.stock.symbol.replace('.NS', '')}
      </Text>

      {/* Tooltip on hover */}
      {hovered && (
        <Html
          position={[0, height / 2 + 1.5, 0]}
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none' }}
        >
          <div className="glass rounded-lg px-3 py-2 text-xs whitespace-nowrap">
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
          </div>
        </Html>
      )}
    </group>
  );
}

function SectorPlate({ name, position }: { name: string; position: [number, number] }) {
  return (
    <group position={[position[0], 0.01, position[1]]}>
      {/* Ground plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial 
          color={getSectorColor(name)} 
          opacity={0.15} 
          transparent
        />
      </mesh>
      
      {/* Border */}
      <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(12, 10)]} />
        <lineBasicMaterial color={getSectorColor(name)} opacity={0.5} transparent />
      </lineSegments>
      
      {/* Label */}
      <Text
        position={[0, 0.1, -5.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.8}
        color={getSectorColor(name)}
        anchorX="center"
        anchorY="middle"
      >
        {name.toUpperCase()}
      </Text>
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
      <group position={[0, 15, -20]}>
        <Html center distanceFactor={20}>
          <div className="glass rounded-xl px-6 py-3 flex gap-6 text-sm">
            {INDIA_INDICES.map((idx) => {
              const quote = data?.get(idx.symbol);
              if (!quote) return null;
              return (
                <div key={idx.symbol} className="flex items-center gap-2">
                  <span className="text-slate-400">{idx.name}</span>
                  <span className="text-white font-mono">
                    {formatCurrency(quote.price, currency, false)}
                  </span>
                  <span className={quote.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
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

export function IndiaEquityCity() {
  const setSelectedInstrument = useAppStore((state) => state.setSelectedInstrument);

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
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0f172a" opacity={0.8} transparent />
      </mesh>

      {/* Market ticker */}
      <MarketTicker />

      {/* Sector plates and stock towers */}
      {Object.entries(stocksBySector).map(([sector, stocks]) => {
        const sectorPos = SECTOR_POSITIONS[sector] || [0, 0];
        
        return (
          <group key={sector}>
            <SectorPlate
              name={sector}
              position={sectorPos}
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
                  onHover={() => {}}
                  onClick={() => handleTowerClick(stockData.stock)}
                />
              );
            })}
          </group>
        );
      })}

      {/* Ambient particles for atmosphere */}
      <Particles />
    </group>
  );
}

function Particles() {
  const points = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 30 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.1}
        color="#06b6d4"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
