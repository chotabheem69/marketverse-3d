import { Text } from '@react-three/drei';

export function GlobalEarth() {
  return (
    <group>
      <Text
        position={[0, 5, 0]}
        fontSize={2}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
      >
        Global Earth
      </Text>
      <Text
        position={[0, 3, 0]}
        fontSize={0.8}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        World markets on a 3D globe - coming soon...
      </Text>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1e293b" opacity={0.5} transparent />
      </mesh>
    </group>
  );
}
