import { useMemo, useState } from 'react';
import { Text, Float, Html, Line } from '@react-three/drei';
import { useCandles } from '../../data/hooks';
import { useAppStore } from '../../store/appStore';
import { calculateSMA } from '../../utils/finance';
import { scaleLinear } from 'd3-scale';
import * as THREE from 'three';
import type { TimeFrame } from '../../data/types';

const TIMEFRAMES: { label: string; value: TimeFrame }[] = [
  { label: '1M', value: '1M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: '3Y', value: '3Y' },
  { label: '5Y', value: '5Y' },
];

export function TerrainMode() {
  const selectedInstrument = useAppStore((state) => state.selectedInstrument);
  const [timeframe, setTimeframe] = useState<TimeFrame>('1Y');
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  const symbol = selectedInstrument?.id || '^NSEI';
  const { data } = useCandles(symbol, timeframe);
  const candles = data?.candles || [];

  const terrainData = useMemo(() => {
    if (candles.length < 2) return null;

    const prices = candles.map(c => c.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const width = 40;
    const depth = 20;
    const segmentsX = Math.min(candles.length - 1, 200);
    const segmentsZ = 40;

    const geometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    const priceScale = scaleLinear()
      .domain([minPrice, maxPrice])
      .range([0.5, 12]);

    for (let i = 0; i <= segmentsX; i++) {
      const candleIdx = Math.round((i / segmentsX) * (candles.length - 1));
      const price = candles[candleIdx]?.close || minPrice;
      const prevPrice = candleIdx > 0 ? candles[candleIdx - 1]?.close || price : price;
      const isUp = price >= prevPrice;
      
      const height = priceScale(price);
      
      for (let j = 0; j <= segmentsZ; j++) {
        const idx = j * (segmentsX + 1) + i;
        if (idx < positions.count) {
          // Create ridge effect - highest at center z
          const zFactor = 1 - Math.abs(j - segmentsZ / 2) / (segmentsZ / 2);
          positions.setY(idx, height * (0.6 + 0.4 * zFactor));
          
          // Color: green for up, red for down
          const r = isUp ? 0.06 : 0.94;
          const g = isUp ? 0.73 : 0.27;
          const b = isUp ? 0.45 : 0.27;
          colors[idx * 3] = r;
          colors[idx * 3 + 1] = g;
          colors[idx * 3 + 2] = b;
        }
      }
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    return { geometry, minPrice, maxPrice, segmentsX, width };
  }, [candles]);

  const sma20 = useMemo(() => {
    if (!showSMA20 || candles.length < 20) return null;
    const prices = candles.map(c => c.close);
    return calculateSMA(prices, 20);
  }, [candles, showSMA20]);

  const sma50 = useMemo(() => {
    if (!showSMA50 || candles.length < 50) return null;
    const prices = candles.map(c => c.close);
    return calculateSMA(prices, 50);
  }, [candles, showSMA50]);

  const sma200 = useMemo(() => {
    if (!showSMA200 || candles.length < 200) return null;
    const prices = candles.map(c => c.close);
    return calculateSMA(prices, 200);
  }, [candles, showSMA200]);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#0f172a" opacity={0.9} transparent />
      </mesh>

      {/* Terrain */}
      {terrainData && (
        <mesh geometry={terrainData.geometry} castShadow receiveShadow position={[0, 0, 0]}>
          <meshStandardMaterial 
            vertexColors
            side={THREE.DoubleSide}
            metalness={0.2}
            roughness={0.6}
          />
        </mesh>
      )}

      {/* SMA lines as glowing paths */}
      {sma50 && terrainData && (
        <SMALine 
          sma={sma50} 
          candles={candles} 
          terrainData={terrainData}
          color="#f59e0b"
        />
      )}
      {sma20 && terrainData && (
        <SMALine 
          sma={sma20} 
          candles={candles} 
          terrainData={terrainData}
          color="#06b6d4"
        />
      )}
      {sma200 && terrainData && (
        <SMALine 
          sma={sma200} 
          candles={candles} 
          terrainData={terrainData}
          color="#ec4899"
        />
      )}

      {/* Controls UI */}
      <Float speed={0.5} floatIntensity={0.2}>
        <group position={[-18, 14, -8]}>
          <Html center distanceFactor={20}>
            <div className="glass rounded-xl p-4 w-80">
              <h3 className="text-white font-bold mb-2">
                {selectedInstrument?.symbol || 'NIFTY 50'} - Terrain
              </h3>
              
              {/* Timeframe buttons */}
              <div className="flex gap-1 mb-3">
                {TIMEFRAMES.map(tf => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      timeframe === tf.value
                        ? 'bg-primary text-white'
                        : 'bg-muted text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {/* Overlay toggles */}
              <div className="flex flex-wrap gap-2">
                <ToggleButton 
                  label="SMA 20" 
                  active={showSMA20} 
                  color="#06b6d4"
                  onClick={() => setShowSMA20(!showSMA20)} 
                />
                <ToggleButton 
                  label="SMA 50" 
                  active={showSMA50} 
                  color="#f59e0b"
                  onClick={() => setShowSMA50(!showSMA50)} 
                />
                <ToggleButton 
                  label="SMA 200" 
                  active={showSMA200} 
                  color="#ec4899"
                  onClick={() => setShowSMA200(!showSMA200)} 
                />
                <ToggleButton 
                  label="Volume" 
                  active={showVolume} 
                  color="#10b981"
                  onClick={() => setShowVolume(!showVolume)} 
                />
              </div>
            </div>
          </Html>
        </group>
      </Float>

      {/* Title */}
      <Text
        position={[0, 16, -15]}
        fontSize={1.5}
        color="#06b6d4"
        anchorX="center"
      >
        Terrain Mode
      </Text>
    </group>
  );
}

function ToggleButton({ label, active, color, onClick }: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
        active
          ? 'border-current text-white'
          : 'border-slate-600 text-slate-500 hover:text-slate-300'
      }`}
      style={active ? { borderColor: color, backgroundColor: `${color}33` } : {}}
    >
      <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: active ? color : '#475569' }} />
      {label}
    </button>
  );
}

function SMALine({ sma, terrainData, color }: {
  sma: (number | null)[];
  candles: { close: number; time: number }[];
  terrainData: { minPrice: number; maxPrice: number; segmentsX: number; width: number };
  color: string;
}) {
  const points = useMemo(() => {
    const { minPrice, maxPrice, width } = terrainData;
    const priceScale = scaleLinear()
      .domain([minPrice, maxPrice])
      .range([0.5, 12]);

    const pts: [number, number, number][] = [];
    for (let i = 0; i < sma.length; i++) {
      const val = sma[i];
      if (val === null) continue;
      const x = (i / (sma.length - 1)) * width - width / 2;
      const y = priceScale(val) * 0.9 + 0.5;
      pts.push([x, y, 0]);
    }
    return pts;
  }, [sma, terrainData]);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.8}
    />
  );
}
