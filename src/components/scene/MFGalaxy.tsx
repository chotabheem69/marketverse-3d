import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import { useNavHistory } from '../../data/hooks';
import { useAppStore } from '../../store/appStore';
import { POPULAR_FUNDS } from '../../config/universe';
import { calculateCAGR, calculateVolatility, calculateMaxDrawdown } from '../../utils/finance';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import * as THREE from 'three';
import type { Instrument } from '../../data/types';

const CATEGORY_COLORS: Record<string, string> = {
  'large-cap': '#3b82f6',
  'flexi-cap': '#8b5cf6',
  'mid-cap': '#f59e0b',
  'small-cap': '#ef4444',
  'elss': '#10b981',
  'debt': '#06b6d4',
  'hybrid': '#ec4899',
};

function FundOrb({ 
  fund, 
  position, 
  onSelect 
}: { 
  fund: typeof POPULAR_FUNDS[0];
  position: [number, number, number];
  onSelect: (fund: typeof POPULAR_FUNDS[0]) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { data } = useNavHistory(fund.schemeCode);
  const color = CATEGORY_COLORS[fund.category] || '#64748b';

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + position[0]) * 0.2;
    }
  });

  // Calculate metrics from NAV history
  const metrics = useMemo(() => {
    if (!data?.navHistory || data.navHistory.length < 252) {
      return { nav: 0, return1Y: 0, return3Y: 0, volatility: 0, maxDrawdown: 0 };
    }
    const navs = data.navHistory.map(n => n.nav);
    const current = navs[navs.length - 1];
    const nav1Y = navs.length > 252 ? navs[navs.length - 252] : navs[0];
    const nav3Y = navs.length > 756 ? navs[navs.length - 756] : navs[0];
    
    return {
      nav: current,
      return1Y: nav1Y > 0 ? ((current - nav1Y) / nav1Y) * 100 : 0,
      return3Y: nav3Y > 0 ? calculateCAGR(nav3Y, current, 3) : 0,
      volatility: calculateVolatility(navs.slice(-252)),
      maxDrawdown: calculateMaxDrawdown(navs.slice(-756)),
    };
  }, [data]);

  return (
    <group position={position}>
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
          onSelect(fund);
        }}
      >
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.4 : 0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.35}
        color={hovered ? '#ffffff' : '#94a3b8'}
        anchorX="center"
        maxWidth={4}
      >
        {fund.name}
      </Text>

      {/* Tooltip */}
      {hovered && (
        <Html position={[0, -1.5, 0]} center distanceFactor={15}>
          <div className="glass rounded-lg px-3 py-2 text-xs whitespace-nowrap">
            <p className="font-bold text-white">{fund.name}</p>
            <p className="text-slate-400">{fund.amc} · {fund.category}</p>
            <p className="text-white mt-1">NAV: {formatCurrency(metrics.nav, 'INR', false)}</p>
            <p className={metrics.return1Y >= 0 ? 'text-green-400' : 'text-red-400'}>
              1Y: {formatPercent(metrics.return1Y)}
            </p>
            <p className={metrics.return3Y >= 0 ? 'text-green-400' : 'text-red-400'}>
              3Y CAGR: {formatPercent(metrics.return3Y)}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

export function MFGalaxy() {
  const setSelectedInstrument = useAppStore((state) => state.setSelectedInstrument);
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(5);

  // Calculate positions for each fund (risk-return scatter)
  const fundPositions = useMemo(() => {
    return POPULAR_FUNDS.map((fund, i) => {
      // Spread funds across 3D space
      const angle = (i / POPULAR_FUNDS.length) * Math.PI * 2;
      const radius = 6 + (i % 3) * 3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (i % 5) * 2 - 4;
      return { fund, position: [x, y, z] as [number, number, number] };
    });
  }, []);

  const handleSelectFund = (fund: typeof POPULAR_FUNDS[0]) => {
    const instrument: Instrument = {
      id: `MF-${fund.schemeCode}`,
      symbol: fund.schemeCode,
      name: fund.name,
      type: 'fund',
      region: 'IN',
      category: fund.category,
      currency: 'INR',
    };
    setSelectedInstrument(instrument);
  };

  return (
    <group>
      {/* Starfield background */}
      <Stars />

      {/* Central nebula */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Fund orbs */}
      {fundPositions.map(({ fund, position }) => (
        <FundOrb
          key={fund.schemeCode}
          fund={fund}
          position={position}
          onSelect={handleSelectFund}
        />
      ))}

      {/* SIP Simulator Panel */}
      <Float speed={0.5} floatIntensity={0.3}>
        <group position={[15, 5, 0]}>
          <Html center distanceFactor={20}>
            <div className="glass rounded-xl p-4 w-80">
              <h3 className="text-white font-bold mb-3">📊 SIP Simulator</h3>
              <p className="text-xs text-slate-400 mb-3">Educational tool only. Not financial advice.</p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Monthly SIP Amount</label>
                  <input
                    type="range"
                    min={1000}
                    max={50000}
                    step={1000}
                    value={sipAmount}
                    onChange={(e) => setSipAmount(parseInt(e.target.value))}
                    className="w-full mt-1"
                  />
                  <p className="text-sm text-white">{formatCurrency(sipAmount, 'INR')}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Investment Period</label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={sipYears}
                    onChange={(e) => setSipYears(parseInt(e.target.value))}
                    className="w-full mt-1"
                  />
                  <p className="text-sm text-white">{sipYears} years</p>
                </div>

                {/* Projection */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-slate-400">Assumed return: 12% CAGR</p>
                  <p className="text-sm text-slate-300">
                    Invested: {formatCurrency(sipAmount * 12 * sipYears, 'INR')}
                  </p>
                  <p className="text-lg font-bold text-green-400">
                    Est. Value: {formatCurrency(
                      sipAmount * (((Math.pow(1.01, sipYears * 12) - 1) / 0.01) * 1.01),
                      'INR'
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    Wealth gain: {formatCurrency(
                      sipAmount * (((Math.pow(1.01, sipYears * 12) - 1) / 0.01) * 1.01) - (sipAmount * 12 * sipYears),
                      'INR'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Html>
        </group>
      </Float>

      {/* Title */}
      <Text
        position={[0, 12, 0]}
        fontSize={1.5}
        color="#8b5cf6"
        anchorX="center"
      >
        Mutual Fund Galaxy
      </Text>
    </group>
  );
}

function Stars() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 2000;
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = (Math.random() - 0.5) * 200;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;
      
      colors[i3] = 0.8 + Math.random() * 0.2;
      colors[i3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i3 + 2] = 0.9 + Math.random() * 0.1;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}
