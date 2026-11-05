// Performance detection and adaptive quality

import { useState, useEffect } from 'react';

export interface PerformanceConfig {
  dpr: number;
  bloom: boolean;
  shadows: boolean;
  particles: boolean;
  maxInstances: number;
}

export function usePerformanceConfig(): PerformanceConfig {
  const [config, setConfig] = useState<PerformanceConfig>({
    dpr: 2,
    bloom: true,
    shadows: true,
    particles: true,
    maxInstances: 1000,
  });

  useEffect(() => {
    // Detect device capabilities
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const deviceMemory = (navigator as any).deviceMemory || 4;

    // Check WebGL capabilities
    let gpuTier = 'high';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
          if (renderer.includes('intel') || renderer.includes('mali') || renderer.includes('adreno 5')) {
            gpuTier = 'low';
          } else if (renderer.includes('adreno 6') || renderer.includes('apple')) {
            gpuTier = 'medium';
          }
        }
      }
    } catch (e) {
      gpuTier = 'low';
    }

    if (isMobile || deviceMemory < 4 || hardwareConcurrency < 4 || gpuTier === 'low') {
      setConfig({
        dpr: 1,
        bloom: false,
        shadows: false,
        particles: false,
        maxInstances: 200,
      });
    } else if (gpuTier === 'medium' || hardwareConcurrency < 8) {
      setConfig({
        dpr: 1.5,
        bloom: true,
        shadows: true,
        particles: true,
        maxInstances: 500,
      });
    }

    // Respect reduced motion preference
    if (prefersReducedMotion) {
      setConfig(prev => ({
        ...prev,
        bloom: false,
        particles: false,
      }));
    }
  }, []);

  return config;
}

/**
 * Throttle updates to a maximum rate
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  intervalMs: number
): T {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return ((...args: any[]) => {
    const now = Date.now();
    const remaining = intervalMs - (now - lastCall);

    if (remaining <= 0) {
      lastCall = now;
      fn(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        timeout = null;
        fn(...args);
      }, remaining);
    }
  }) as T;
}

/**
 * Batch WebSocket messages
 */
export class MessageBatcher {
  private buffer: any[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private onFlush: (messages: any[]) => void;

  constructor(onFlush: (messages: any[]) => void, intervalMs: number = 250) {
    this.onFlush = onFlush;
    this.flushInterval = setInterval(() => this.flush(), intervalMs);
  }

  add(message: any) {
    this.buffer.push(message);
  }

  flush() {
    if (this.buffer.length > 0) {
      this.onFlush([...this.buffer]);
      this.buffer = [];
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}
