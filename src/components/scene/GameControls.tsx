// WASD + Mouse look game-style camera controls
// W/S = forward/backward, A/D = left/right, Mouse = look around
// Raycasting: auto-detect what crosshair points at and open details

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../store/appStore';
import { findInstrumentById } from '../../data/registry';

interface GameControlsProps {
  enabled: boolean;
  speed?: number;
  lookSpeed?: number;
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    minZ?: number;
    maxZ?: number;
  };
}

export function GameControls({ 
  enabled, 
  speed = 0.25, 
  lookSpeed = 0.002,
  bounds = {}
}: GameControlsProps) {
  const { camera, gl, scene } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isPointerLocked = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());
  const [isLocked, setIsLocked] = useState(false);
  
  // Store access
  const setGameHoveredId = useAppStore((state) => state.setGameHoveredId);
  const setSelectedInstrument = useAppStore((state) => state.setSelectedInstrument);
  const setDetailPanelOpen = useAppStore((state) => state.setDetailPanelOpen);
  
  // Track what we were hovering to detect changes
  const lastHoveredRef = useRef<string | null>(null);
  // Dwell timer - only open panel after looking at something for a bit
  const dwellStartRef = useRef<number | null>(null);
  const DWELL_TIME = 400; // ms to look at something before auto-opening

  // Initialize camera direction from current orientation
  useEffect(() => {
    if (!enabled) return;
    euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
  }, [enabled, camera]);

  // Keyboard events
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      keys.current[e.code] = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keys.current = {};
    };
  }, [enabled]);

  // Pointer lock for mouse look
  useEffect(() => {
    if (!enabled) return;

    const canvas = gl.domElement;

    const handleClick = (e: MouseEvent) => {
      // If currently looking at a hovered item, clicking opens it
      const currentHovered = lastHoveredRef.current;
      if (currentHovered && isPointerLocked.current) {
        // Find the instrument by ID and open it
        const instrument = findInstrumentById(currentHovered);
        if (instrument) {
          setSelectedInstrument(instrument);
          setDetailPanelOpen(true);
        }
        return;
      }
      
      if (!isPointerLocked.current) {
        canvas.requestPointerLock();
      }
    };

    const handleLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
      setIsLocked(isPointerLocked.current);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;

      euler.current.y -= e.movementX * lookSpeed;
      euler.current.x -= e.movementY * lookSpeed;
      
      // Clamp vertical look (prevent flipping)
      euler.current.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.current.x));

      camera.quaternion.setFromEuler(euler.current);
    };

    canvas.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handleLockChange);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handleLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      if (isPointerLocked.current) {
        document.exitPointerLock();
      }
    };
  }, [enabled, gl, camera, lookSpeed, setSelectedInstrument, setDetailPanelOpen]);

  // Raycasting + Movement
  useFrame(() => {
    if (!enabled) return;

    const moveSpeed = keys.current['ShiftLeft'] || keys.current['ShiftRight'] ? speed * 2.5 : speed;

    // Calculate movement direction based on camera yaw only
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    
    const yawQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, euler.current.y, 0, 'YXZ')
    );
    forward.applyQuaternion(yawQuat);
    right.applyQuaternion(yawQuat);

    const movement = new THREE.Vector3();

    if (keys.current['KeyW']) movement.add(forward);
    if (keys.current['KeyS']) movement.sub(forward);
    if (keys.current['KeyD']) movement.add(right);
    if (keys.current['KeyA']) movement.sub(right);
    if (keys.current['Space']) movement.y += 1;
    if (keys.current['ControlLeft'] || keys.current['KeyC']) movement.y -= 1;

    if (movement.lengthSq() > 0) {
      movement.normalize().multiplyScalar(moveSpeed);
      camera.position.add(movement);

      // Apply bounds
      const { minX = -100, maxX = 100, minY = 1, maxY = 50, minZ = -100, maxZ = 100 } = bounds;
      camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x));
      camera.position.y = Math.max(minY, Math.min(maxY, camera.position.y));
      camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));
    }

    // === RAYCASTING: Detect what crosshair is pointing at ===
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.current.far = 100; // Only detect within 100 units
    
    // Get all meshes with userData.hoverable = true
    const hoverables: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if ((obj as any).userData?.hoverable && (obj as any).userData?.instrumentId) {
        hoverables.push(obj);
      }
    });
    
    const intersects = raycaster.current.intersectObjects(hoverables, false);
    
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const instrumentId = (hit as any).userData.instrumentId as string;
      
      if (instrumentId !== lastHoveredRef.current) {
        // New target!
        lastHoveredRef.current = instrumentId;
        setGameHoveredId(instrumentId);
        dwellStartRef.current = Date.now();
      } else {
        // Same target - check dwell time
        if (dwellStartRef.current && Date.now() - dwellStartRef.current > DWELL_TIME) {
          // Auto-open detail panel if not already open
          const currentInstrument = useAppStore.getState().selectedInstrument;
          if (!currentInstrument || currentInstrument.id !== instrumentId) {
            const instrument = findInstrumentById(instrumentId);
            if (instrument) {
              setSelectedInstrument(instrument);
              setDetailPanelOpen(true);
            }
          }
        }
      }
    } else {
      // Not pointing at anything
      if (lastHoveredRef.current !== null) {
        lastHoveredRef.current = null;
        setGameHoveredId(null);
        dwellStartRef.current = null;
      }
    }
  });

  return null;
}

// findInstrumentById is imported from ../../data/registry

// Crosshair overlay (rendered in HTML, not 3D)
export function Crosshair({ visible, isHovering }: { visible: boolean; isHovering?: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
      <div className="relative w-8 h-8">
        {/* Outer ring - changes color when hovering something */}
        <div className={`absolute inset-0 rounded-full border-2 transition-all duration-200 ${
          isHovering ? 'border-cyan-400 scale-125' : 'border-white/40'
        }`} />
        {/* Cross lines */}
        <div className={`absolute top-1/2 left-0 w-full h-px -translate-y-1/2 transition-colors ${
          isHovering ? 'bg-cyan-400' : 'bg-white/40'
        }`} />
        <div className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transition-colors ${
          isHovering ? 'bg-cyan-400' : 'bg-white/40'
        }`} />
        {/* Center dot */}
        <div className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-colors ${
          isHovering ? 'bg-cyan-400' : 'bg-white/60'
        }`} />
      </div>
    </div>
  );
}

// Instructions overlay
export function GameControlsHint({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <div className="fixed bottom-28 left-4 z-40">
      <button
        onClick={onToggle}
        className={`glass glass-hover px-3 py-2 rounded-lg text-xs transition-all ${
          active ? 'text-cyan-400 border-cyan-500/30' : 'text-slate-400'
        }`}
        title="Toggle game controls (G)"
      >
        {active ? '🎮 Game Mode ON' : '🎮 Game Mode'}
      </button>
      
      {active && (
        <div className="mt-2 glass rounded-lg p-3 text-xs text-slate-400 max-w-xs">
          <p className="text-white font-medium mb-2">🎮 Game Controls</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span>Move</span>
              <span className="text-white font-mono">W A S D</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Look</span>
              <span className="text-white font-mono">Mouse</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Up / Down</span>
              <span className="text-white font-mono">Space / C</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Sprint</span>
              <span className="text-white font-mono">Shift</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Select</span>
              <span className="text-white font-mono">Click / Look 0.4s</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Exit look</span>
              <span className="text-white font-mono">Esc</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-cyan-400/70 text-[10px]">🎯 Look at any tower to auto-view details. Click to pin open.</p>
            <p className="text-cyan-400/70 text-[10px]">🖱️ Click canvas to start looking around</p>
          </div>
        </div>
      )}
    </div>
  );
}
