import { useRef, useState } from 'react';
import { Text, Html } from '@react-three/drei';
import { useAppStore } from '../../store/appStore';
import { useMultipleQuotes } from '../../data/hooks';
import { getChangeColor, getTowerHeight } from '../../hooks/useStockColor';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import * as THREE from 'three';

function WatchlistTower({
  instrumentId,
  position,
  price,
  changePercent,
  onRemove,
  onClick,
}: {
  instrumentId: string;
  position: [number, number];
  price: number | undefined;
  changePercent: number | undefined;
  onRemove: () => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const currency = useAppStore((state) => state.currency);

  const height = price ? getTowerHeight(price * 1e7) : 5;
  const color = changePercent !== undefined ? getChangeColor(changePercent) : '#64748b';

  return (
    <group position={[position[0], height / 2, position[1]]}>
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
          onClick();
        }}
        castShadow
      >
        <boxGeometry args={[1.5, height, 1.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.1}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      <Text
        position={[0, height / 2 + 0.5, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
      >
        {instrumentId.replace('.NS', '').split('-')[0]}
      </Text>

      {hovered && (
        <Html position={[0, height / 2 + 1.5, 0]} center distanceFactor={15}>
          <div className="glass rounded-lg px-3 py-2 text-xs whitespace-nowrap">
            {price !== undefined && (
              <p className="text-white">{formatCurrency(price, currency)}</p>
            )}
            {changePercent !== undefined && (
              <p className={changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatPercent(changePercent)}
              </p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="mt-1 text-red-400 hover:text-red-300 text-xs"
            >
              Remove ✕
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

export function WatchlistSkyline() {
  const { watchlist, removeFromWatchlist, setSelectedInstrument } = useAppStore();
  const { data } = useMultipleQuotes(watchlist);

  const handleClick = (instrumentId: string) => {
    setSelectedInstrument({
      id: instrumentId,
      symbol: instrumentId.replace('.NS', '').split('-')[0],
      name: instrumentId,
      type: 'stock',
      region: 'IN',
      currency: 'INR',
    });
  };

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#0f172a" opacity={0.9} transparent />
      </mesh>

      {watchlist.length === 0 ? (
        <Html center position={[0, 5, 0]}>
          <div className="glass rounded-xl p-8 text-center max-w-md">
            <p className="text-4xl mb-4">⭐</p>
            <h3 className="text-xl font-bold text-white mb-2">Your Watchlist is Empty</h3>
            <p className="text-slate-400 text-sm">
              Click any stock tower in India City or use the command palette (Ctrl+K) to add instruments to your watchlist.
            </p>
          </div>
        </Html>
      ) : (
        watchlist.map((id, i) => {
          const cols = Math.ceil(Math.sqrt(watchlist.length));
          const row = Math.floor(i / cols);
          const col = i % cols;
          const position: [number, number] = [
            (col - cols / 2) * 3,
            (row - Math.ceil(watchlist.length / cols) / 2) * 3,
          ];
          const quote = data?.get(id);

          return (
            <WatchlistTower
              key={id}
              instrumentId={id}
              position={position}
              price={quote?.price}
              changePercent={quote?.changePercent}
              onRemove={() => removeFromWatchlist(id)}
              onClick={() => handleClick(id)}
            />
          );
        })
      )}

      <Text
        position={[0, 12, -10]}
        fontSize={1.5}
        color="#06b6d4"
        anchorX="center"
      >
        My Watchlist ({watchlist.length})
      </Text>
    </group>
  );
}
