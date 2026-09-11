import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Layers,
  ShieldCheck,
  Zap,
  Sparkles,
  RotateCw,
  Play,
  RefreshCw,
  Sliders,
  Flame,
  Activity,
  Cpu,
  Lock,
  Compass,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

type CoreState = 'INGEST' | 'NORMALIZING' | 'VAULT_LOCKED';

export const HologramCore3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coreState, setCoreState] = useState<CoreState>('NORMALIZING');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isIonizing, setIsIonizing] = useState(false);
  const [wireframeOnly, setWireframeOnly] = useState(true);

  // References to Three.js objects
  const groupRef = useRef<THREE.Group | null>(null);
  const coreIcoRef = useRef<THREE.Mesh | null>(null);
  const ringXRef = useRef<THREE.Mesh | null>(null);
  const ringYRef = useRef<THREE.Mesh | null>(null);
  const ringZRef = useRef<THREE.Mesh | null>(null);
  const outerShieldRef = useRef<THREE.Mesh | null>(null);
  const shockwaveRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 340;

    // 1. Scene, Camera, WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1500);
    camera.position.z = 145;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    groupRef.current = masterGroup;

    // Background Cyber Dust
    const bgDustCount = 300;
    const bgDustGeo = new THREE.BufferGeometry();
    const bgDustPos = new Float32Array(bgDustCount * 3);
    for (let i = 0; i < bgDustCount; i++) {
      bgDustPos[i * 3] = (Math.random() - 0.5) * 350;
      bgDustPos[i * 3 + 1] = (Math.random() - 0.5) * 350;
      bgDustPos[i * 3 + 2] = (Math.random() - 0.5) * 350;
    }
    bgDustGeo.setAttribute('position', new THREE.BufferAttribute(bgDustPos, 3));
    const bgDustMat = new THREE.PointsMaterial({ color: 0x06b6d4, size: 1.2, transparent: true, opacity: 0.35 });
    const bgDust = new THREE.Points(bgDustGeo, bgDustMat);
    scene.add(bgDust);

    // =========================================================================
    // ⚛️ LAYER 1: INNER QUANTUM ICOSAHEDRON (CORE ENGINE)
    // =========================================================================
    const icoGeo = new THREE.IcosahedronGeometry(22, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreIco = new THREE.Mesh(icoGeo, icoMat);
    masterGroup.add(coreIco);
    coreIcoRef.current = coreIco;

    // Inner Glowing Fusion Core (Solid sphere inside icosahedron)
    const fusionGeo = new THREE.SphereGeometry(12, 24, 24);
    const fusionMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
    });
    const fusionCore = new THREE.Mesh(fusionGeo, fusionMat);
    coreIco.add(fusionCore);

    // =========================================================================
    // 🪐 LAYER 2: 3-AXIS GYROSCOPE GIMBAL RINGS (COUNTER-ROTATING)
    // =========================================================================
    // Ring X (Cyan)
    const ringXGeo = new THREE.TorusGeometry(32, 0.7, 16, 64);
    const ringXMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.7 });
    const ringX = new THREE.Mesh(ringXGeo, ringXMat);
    masterGroup.add(ringX);
    ringXRef.current = ringX;

    // Ring Y (Emerald)
    const ringYGeo = new THREE.TorusGeometry(36, 0.7, 16, 64);
    const ringYMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.65 });
    const ringY = new THREE.Mesh(ringYGeo, ringYMat);
    ringY.rotation.x = Math.PI / 2;
    masterGroup.add(ringY);
    ringYRef.current = ringY;

    // Ring Z (Purple/Gold)
    const ringZGeo = new THREE.TorusGeometry(40, 0.8, 16, 64);
    const ringZMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.6 });
    const ringZ = new THREE.Mesh(ringZGeo, ringZMat);
    ringZ.rotation.y = Math.PI / 2;
    masterGroup.add(ringZ);
    ringZRef.current = ringZ;

    // =========================================================================
    // 🛡️ LAYER 3: OUTER GEODESIC INTEGRITY SHIELD (OCTAHEDRON)
    // =========================================================================
    const shieldGeo = new THREE.OctahedronGeometry(48, 1);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const outerShield = new THREE.Mesh(shieldGeo, shieldMat);
    masterGroup.add(outerShield);
    outerShieldRef.current = outerShield;

    // Shockwave Ring for Ionization Bursts
    const shockwaveGeo = new THREE.RingGeometry(1, 2, 48);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    masterGroup.add(shockwave);
    shockwaveRef.current = shockwave;

    // =========================================================================
    // ✨ LAYER 4: ORBITING QUANTUM DATA PARTICLES (SWIRLING ATOMS)
    // =========================================================================
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleOriginals = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 26 + Math.random() * 32;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      particlePos[i * 3] = x;
      particlePos[i * 3 + 1] = y;
      particlePos[i * 3 + 2] = z;

      particleOriginals[i * 3] = x;
      particleOriginals[i * 3 + 1] = y;
      particleOriginals[i * 3 + 2] = z;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 2.2,
      transparent: true,
      opacity: 0.9,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particles);
    particlesRef.current = particles;

    // =========================================================================
    // 🖱️ MOUSE ORBIT DRAG & PARALLAX
    // =========================================================================
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const domElement = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      masterGroup.rotation.y += deltaX * 0.01;
      masterGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // =========================================================================
    // 🌀 60 FPS ANIMATION LOOP
    // =========================================================================
    let reqId: number;
    let clock = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      clock += 0.02 * speedMultiplier;

      // Gyroscope counter-rotations
      if (ringX) ringX.rotation.x += 0.012 * speedMultiplier;
      if (ringY) ringY.rotation.y += 0.016 * speedMultiplier;
      if (ringZ) ringZ.rotation.z -= 0.014 * speedMultiplier;

      // Inner Core rotation & breathing pulse
      if (coreIco) {
        coreIco.rotation.x += 0.01 * speedMultiplier;
        coreIco.rotation.y += 0.015 * speedMultiplier;
        const scale = 1 + Math.sin(clock * 2) * 0.05;
        coreIco.scale.set(scale, scale, scale);
      }

      // Outer shield rotation
      if (outerShield) {
        outerShield.rotation.x -= 0.006 * speedMultiplier;
        outerShield.rotation.y -= 0.008 * speedMultiplier;
      }

      // Orbiting particles rotation & wobble
      if (particles) {
        particles.rotation.y += 0.008 * speedMultiplier;
        particles.rotation.x = Math.sin(clock) * 0.15;
      }

      // Background dust rotation
      bgDust.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [speedMultiplier]);

  // Update Material Colors on State Change
  useEffect(() => {
    if (!coreIcoRef.current || !outerShieldRef.current) return;

    if (coreState === 'INGEST') {
      (coreIcoRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x06b6d4);
      (outerShieldRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x3b82f6);
    } else if (coreState === 'NORMALIZING') {
      (coreIcoRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x22c55e);
      (outerShieldRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x06b6d4);
    } else if (coreState === 'VAULT_LOCKED') {
      (coreIcoRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b);
      (outerShieldRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
    }
  }, [coreState]);

  // Trigger 3D Ionization Shockwave Blast
  const handleTriggerIonization = () => {
    soundFx.playBeep();
    setIsIonizing(true);
    setSpeedMultiplier(3.5);

    if (coreIcoRef.current) {
      coreIcoRef.current.scale.set(1.5, 1.5, 1.5);
    }

    // Animate shockwave expanding ring
    if (shockwaveRef.current) {
      let radius = 2;
      let opacity = 0.9;
      shockwaveRef.current.visible = true;

      const shockwaveInterval = setInterval(() => {
        radius += 3.5;
        opacity -= 0.05;
        if (shockwaveRef.current) {
          shockwaveRef.current.scale.set(radius, radius, radius);
          (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, opacity);
        }

        if (opacity <= 0) {
          clearInterval(shockwaveInterval);
          if (shockwaveRef.current) {
            shockwaveRef.current.visible = false;
            shockwaveRef.current.scale.set(1, 1, 1);
          }
        }
      }, 30);
    }

    setTimeout(() => {
      soundFx.playSuccess();
      setIsIonizing(false);
      setSpeedMultiplier(1);
      if (coreIcoRef.current) {
        coreIcoRef.current.scale.set(1, 1, 1);
      }
    }, 1200);
  };

  return (
    <div className="bg-[#171f33] border border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden flex flex-col justify-between space-y-4">
      
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header & Mode Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_#06b6d4]">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <span>3D Quantum Normalization Chamber</span>
              <span className="px-2 py-0.2 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-[10px] font-bold">
                WebGL 60FPS
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              3-Axis Gyroscope Matrix with real-time OCSF packet ionization.
            </p>
          </div>
        </div>

        {/* State Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="text-slate-400">Core State:</span>
          <span
            className={`px-2 py-0.5 rounded-md font-bold border ${
              coreState === 'INGEST'
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : coreState === 'NORMALIZING'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                : 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
            }`}
          >
            {coreState}
          </span>
        </div>
      </div>

      {/* 3D WebGL Holographic Viewport */}
      <div
        ref={containerRef}
        className="w-full h-80 rounded-2xl bg-gradient-to-b from-[#070c18] via-[#0b1326] to-[#070c18] border border-cyan-500/40 flex items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing shadow-[inset_0_0_35px_rgba(6,182,212,0.15)]"
      >
        {/* HUD Viewfinder corner brackets */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-300 bg-black/70 px-2.5 py-1 rounded-lg border border-cyan-500/40 pointer-events-none flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>QUANTUM GYROSCOPE: 3-AXIS GIMBAL ACTIVE</span>
        </div>

        <div className="absolute top-3 right-3 text-[10px] font-mono text-emerald-400 bg-black/70 px-2.5 py-1 rounded-lg border border-emerald-500/40 pointer-events-none">
          IONIZATION: 99.8% STABLE
        </div>

        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-black/70 px-2.5 py-1 rounded-lg border border-slate-800 pointer-events-none">
          🖱️ Click & Drag to Orbit 3D Core
        </div>

        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-amber-400 bg-black/70 px-2.5 py-1 rounded-lg border border-amber-500/40 pointer-events-none">
          SHA-256 VAULT SEALED
        </div>
      </div>

      {/* Interactive Command Bar */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800">
        
        {/* State Switchers */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Mode:</span>
            {[
              { id: 'INGEST', label: '1. Ingest Feed', color: 'text-cyan-300 border-cyan-500' },
              { id: 'NORMALIZING', label: '2. Normalizing', color: 'text-emerald-300 border-emerald-500' },
              { id: 'VAULT_LOCKED', label: '3. SHA-256 Vault', color: 'text-amber-300 border-amber-500' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  soundFx.playClick();
                  setCoreState(m.id as CoreState);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all ${
                  coreState === m.id
                    ? `bg-[#0f172a] ${m.color} font-bold shadow-sm`
                    : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Speed:</span>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => {
                  soundFx.playClick();
                  setSpeedMultiplier(s);
                }}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  speedMultiplier === s
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-[#0f172a] text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-[11px] font-mono text-slate-400">
            Interactive Shockwave Burst Simulation:
          </span>

          <button
            onClick={handleTriggerIonization}
            disabled={isIonizing}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              isIonizing
                ? 'bg-emerald-500 text-black shadow-[0_0_25px_rgba(34,197,94,0.6)] scale-105'
                : 'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105'
            }`}
          >
            <Zap className={`w-4 h-4 ${isIonizing ? 'animate-bounce' : ''}`} />
            <span>{isIonizing ? 'Ionizing 3D Shockwave...' : '⚡ Quantum Ionize Burst'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
