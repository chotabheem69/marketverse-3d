import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useAppStore } from '../store/appStore';
import { IndiaEquityCity } from './scene/IndiaEquityCity';
import { TerrainMode } from './scene/TerrainMode';
import { MFGalaxy } from './scene/MFGalaxy';
import { CryptoReactor } from './scene/CryptoReactor';
import { GlobalEarth } from './scene/GlobalEarth';
import { WatchlistSkyline } from './scene/WatchlistSkyline';
import { GameControls } from './scene/GameControls';

export function Scene() {
  const controlsRef = useRef<any>(null);
  const currentWorld = useAppStore((state) => state.currentWorld);
  const gameMode = useAppStore((state) => state.gameMode);

  const renderWorld = () => {
    switch (currentWorld) {
      case 'india-city':
        return <IndiaEquityCity />;
      case 'terrain':
        return <TerrainMode />;
      case 'mf-galaxy':
        return <MFGalaxy />;
      case 'crypto-reactor':
        return <CryptoReactor />;
      case 'global-earth':
        return <GlobalEarth />;
      case 'watchlist':
        return <WatchlistSkyline />;
      default:
        return <IndiaEquityCity />;
    }
  };

  return (
    <Canvas
      camera={{ position: [0, 15, 35], fov: 60 }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      gl={{ antialias: true, alpha: false }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#06b6d4" />
      
      {/* Environment */}
      <fog attach="fog" args={['#0a0e1a', 30, 150]} />
      <color attach="background" args={['#0a0e1a']} />
      
      {/* Grid floor */}
      <gridHelper args={[200, 100, '#1e293b', '#1e293b']} position={[0, -0.01, 0]} />
      
      {/* Current world */}
      {renderWorld()}
      
      {/* Controls - either orbit or FPS-style */}
      {gameMode ? (
        <GameControls 
          enabled={true} 
          speed={0.3} 
          lookSpeed={0.002}
          bounds={{ minX: -80, maxX: 80, minY: 2, maxY: 40, minZ: -80, maxZ: 80 }}
        />
      ) : (
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
      )}
      
      {/* Performance stats (dev only) */}
      {import.meta.env.DEV && <Stats />}
    </Canvas>
  );
}
