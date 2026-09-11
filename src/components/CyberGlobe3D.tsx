import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Globe,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Zap,
  ShieldAlert,
  Send,
  Eye,
  Crosshair,
  CheckCircle2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export interface NodePoint {
  id: string;
  name: string;
  location: string;
  type: string;
  eps: number;
  lat: number;
  lng: number;
  color: number;
  status: 'HEALTHY' | 'ELEVATED' | 'ALERT';
  sampleLog: string;
  targetPort: number;
  towerHeight: number;
}

const NODES: NodePoint[] = [
  {
    id: 'n1',
    name: 'AWS CloudTrail (US-East)',
    location: 'Virginia, USA',
    type: 'JSON Stream',
    eps: 450,
    lat: 38.8951,
    lng: -77.0364,
    color: 0x06b6d4,
    status: 'HEALTHY',
    sampleLog: '{"eventVersion":"1.08","eventName":"ConsoleLogin","sourceIPAddress":"203.0.113.45"}',
    targetPort: 443,
    towerHeight: 14,
  },
  {
    id: 'n2',
    name: 'Suricata NIDS (Frankfurt)',
    location: 'Frankfurt, Germany',
    type: 'CEF Alerts',
    eps: 630,
    lat: 50.1109,
    lng: 8.6821,
    color: 0xf43f5e,
    status: 'ALERT',
    sampleLog: 'CEF:0|Suricata|IDP|6.0.4|2001219|ET SCAN Potential SSH Scan|3|src=192.168.1.105 dst=198.51.100.12',
    targetPort: 22,
    towerHeight: 20,
  },
  {
    id: 'n3',
    name: 'Palo Alto NGFW (Tokyo DC)',
    location: 'Tokyo, Japan',
    type: 'Syslog Feed',
    eps: 1240,
    lat: 35.6762,
    lng: 139.6503,
    color: 0x10b981,
    status: 'HEALTHY',
    sampleLog: '<134>1 2026-09-02T10:32:01Z fw01.tokyo firewall 1024 - - src=192.168.1.50 dst=10.0.0.1 action=DENY',
    targetPort: 443,
    towerHeight: 16,
  },
  {
    id: 'n4',
    name: 'Windows AD DC (London)',
    location: 'London, UK',
    type: 'Security XML',
    eps: 820,
    lat: 51.5074,
    lng: -0.1278,
    color: 0xf59e0b,
    status: 'ELEVATED',
    sampleLog: '<Event><System><EventID>4625</EventID></System><EventData><Data Name="IpAddress">10.0.0.12</Data></EventData></Event>',
    targetPort: 3389,
    towerHeight: 15,
  },
  {
    id: 'n5',
    name: 'Nginx Proxy (Singapore)',
    location: 'Singapore',
    type: 'Access CSV',
    eps: 310,
    lat: 1.3521,
    lng: 103.8198,
    color: 0xa855f7,
    status: 'HEALTHY',
    sampleLog: '2026-09-02T10:32:15Z,192.168.1.88,GET /api/v1/auth,401,10.0.0.5,443',
    targetPort: 8080,
    towerHeight: 12,
  },
  {
    id: 'n6',
    name: 'ULPF Hub (Mumbai Core)',
    location: 'Mumbai, India',
    type: 'OCSF Collector',
    eps: 3450,
    lat: 19.076,
    lng: 72.8777,
    color: 0x06b6d4,
    status: 'HEALTHY',
    sampleLog: '{"event":{"category":"network","action":"NORMALIZED"},"integrity":{"sha256":"verified"}}',
    targetPort: 514,
    towerHeight: 24,
  },
];

// Accurate Real World Continents
const REAL_WORLD_CONTINENTS: [number, number][][] = [
  // North America
  [
    [71, -156], [71, -128], [69, -114], [62, -92], [58, -94], [51, -80], [55, -78],
    [58, -65], [52, -56], [47, -53], [44, -64], [41, -70], [35, -75], [30, -81],
    [25, -80], [25, -81], [29, -84], [30, -88], [29, -95], [26, -97], [21, -97],
    [19, -96], [16, -93], [15, -88], [10, -83], [8, -77], [8, -82], [10, -85],
    [14, -92], [16, -98], [18, -104], [23, -106], [24, -110], [28, -112], [32, -117],
    [34, -120], [38, -123], [46, -124], [49, -125], [54, -130], [58, -137], [60, -140],
    [60, -149], [58, -154], [55, -162], [59, -164], [65, -168], [71, -156]
  ],
  // Greenland
  [[78, -20], [70, -22], [65, -38], [60, -44], [65, -52], [72, -56], [78, -68], [83, -30], [78, -20]],
  // South America
  [
    [12, -72], [11, -63], [7, -58], [4, -51], [0, -50], [-2, -44], [-5, -35],
    [-8, -35], [-13, -39], [-18, -39], [-23, -42], [-28, -48], [-33, -53], [-38, -57],
    [-46, -65], [-52, -68], [-55, -66], [-54, -73], [-48, -75], [-42, -74], [-33, -72],
    [-24, -70], [-17, -72], [-14, -76], [-5, -81], [1, -79], [6, -77], [9, -76], [12, -72]
  ],
  // Europe
  [
    [71, 26], [70, 20], [66, 12], [62, 5], [58, 6], [54, 8], [53, 5], [49, 1],
    [48, -4], [44, -1], [43, -9], [37, -9], [36, -6], [36, -2], [41, 2], [43, 4],
    [43, 9], [41, 15], [38, 16], [40, 18], [45, 13], [44, 28], [46, 31], [46, 38],
    [42, 42], [41, 29], [40, 26], [37, 24], [41, 20], [54, 20], [60, 28], [65, 24], [71, 26]
  ],
  // British Isles
  [[58, -5], [55, -2], [53, 0], [51, 1], [50, -5], [52, -5], [54, -3], [58, -5]],
  // Africa
  [
    [37, 10], [35, 11], [31, 25], [31, 32], [28, 34], [22, 37], [15, 40], [12, 44],
    [12, 51], [5, 48], [-4, 39], [-11, 40], [-16, 40], [-25, 33], [-33, 27], [-34, 18],
    [-30, 18], [-23, 14], [-15, 12], [-5, 12], [4, 9], [5, 2], [5, -4], [8, -13],
    [12, -16], [15, -17], [21, -17], [26, -15], [32, -8], [36, -5], [37, 10]
  ],
  // India Subcontinent
  [
    [35, 74], [31, 70], [25, 68], [23, 68], [21, 70], [19, 73], [15, 74], [10, 76],
    [8, 77], [9, 79], [13, 80], [16, 82], [20, 86], [22, 89], [21, 92], [26, 90],
    [28, 88], [30, 80], [35, 74]
  ],
  // Asia
  [
    [75, 100], [72, 125], [70, 140], [65, 175], [60, 162], [52, 142], [43, 132],
    [40, 128], [38, 120], [34, 120], [30, 122], [26, 119], [22, 114], [21, 108],
    [16, 107], [10, 104], [1, 104], [6, 100], [13, 100], [18, 96], [22, 92],
    [35, 74], [42, 53], [47, 51], [55, 60], [68, 65], [75, 100]
  ],
  // Australia
  [
    [-12, 132], [-12, 136], [-15, 136], [-11, 142], [-18, 146], [-23, 151], [-29, 153],
    [-34, 151], [-38, 146], [-38, 140], [-34, 136], [-32, 132], [-34, 120], [-35, 116],
    [-29, 114], [-22, 114], [-17, 123], [-14, 128], [-12, 132]
  ]
];

export const CyberGlobe3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodePoint>(NODES[1]);
  const [autoRotate, setAutoRotate] = useState(true);

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const packetCometsRef = useRef<{ mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; offset: number; speed: number }[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 460;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1500);
    camera.position.z = 240;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Dark Base Sphere
    const sphereGeo = new THREE.SphereGeometry(80, 48, 48);
    const baseSphereMat = new THREE.MeshBasicMaterial({ color: 0x070b14, transparent: true, opacity: 0.98 });
    const baseSphere = new THREE.Mesh(sphereGeo, baseSphereMat);
    globeGroup.add(baseSphere);

    // Subtle Slate Wireframe
    const wireframeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, wireframe: true, transparent: true, opacity: 0.4 });
    const wireframeSphere = new THREE.Mesh(sphereGeo, wireframeMat);
    globeGroup.add(wireframeSphere);

    function latLngToVector3(lat: number, lng: number, radius = 80): THREE.Vector3 {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    // Draw Crisp Vector Coastlines
    const coastlinesGroup = new THREE.Group();
    globeGroup.add(coastlinesGroup);

    REAL_WORLD_CONTINENTS.forEach((polygon) => {
      const points = polygon.map(([lat, lng]) => latLngToVector3(lat, lng, 80.5));
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.8,
      });
      const line = new THREE.Line(curveGeo, lineMat);
      coastlinesGroup.add(line);
    });

    // Add Nodes & Towers
    const interactiveMeshes: THREE.Mesh[] = [];
    const targetCorePos = latLngToVector3(NODES[5].lat, NODES[5].lng, 80.6);

    NODES.forEach((node) => {
      const surfacePos = latLngToVector3(node.lat, node.lng, 80.6);
      const topPos = latLngToVector3(node.lat, node.lng, 80.6 + node.towerHeight);

      const nodeGeo = new THREE.SphereGeometry(2.8, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: node.color });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(surfacePos);
      nodeMesh.userData = { nodeData: node };
      globeGroup.add(nodeMesh);
      interactiveMeshes.push(nodeMesh);

      // Laser Line
      const laserGeo = new THREE.BufferGeometry().setFromPoints([surfacePos, topPos]);
      const laserMat = new THREE.LineBasicMaterial({ color: node.color, transparent: true, opacity: 0.8 });
      const laser = new THREE.Line(laserGeo, laserMat);
      globeGroup.add(laser);
    });

    // Trajectory Arcs & Packets
    packetCometsRef.current = [];
    NODES.slice(0, 5).forEach((source, idx) => {
      const startPos = latLngToVector3(source.lat, source.lng, 80.6 + source.towerHeight);
      const midPos = startPos.clone().add(targetCorePos).multiplyScalar(0.5).normalize().multiplyScalar(115);

      const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, targetCorePos);
      const points = curve.getPoints(40);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({ color: source.color, transparent: true, opacity: 0.5 });
      const arc = new THREE.Line(curveGeo, curveMat);
      globeGroup.add(arc);

      const cometGeo = new THREE.SphereGeometry(1.4, 8, 8);
      const cometMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cometMesh = new THREE.Mesh(cometGeo, cometMat);
      globeGroup.add(cometMesh);

      packetCometsRef.current.push({
        mesh: cometMesh,
        curve: curve,
        offset: idx * 0.2,
        speed: 0.006,
      });
    });

    // Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const domElement = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x += deltaY * 0.005;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const data = intersects[0].object.userData.nodeData;
        if (data) {
          soundFx.playBeep();
          setSelectedNode(data);
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.min(380, Math.max(130, camera.position.z + e.deltaY * 0.15));
    };

    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('mousemove', onMouseMove);
    domElement.addEventListener('click', onClick);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mouseup', onMouseUp);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.002;
      }

      packetCometsRef.current.forEach((item) => {
        item.offset = (item.offset + item.speed) % 1.0;
        const pos = item.curve.getPoint(item.offset);
        item.mesh.position.copy(pos);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('mousemove', onMouseMove);
      domElement.removeEventListener('click', onClick);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('mouseup', onMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [autoRotate]);

  return (
    <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Global SOC Ingestion & Telemetry Station
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              WebGL Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5">
            Cross-border log traffic streams mapped to physical collector endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              soundFx.playClick();
              setAutoRotate(!autoRotate);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              autoRotate ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{autoRotate ? 'Orbit: Auto' : 'Orbit: Paused'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Globe + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* 3D Canvas Viewport (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <div
            ref={containerRef}
            className="w-full h-[460px] rounded-xl bg-[#090d16] border border-slate-800/60 relative cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center"
          >
            <div className="absolute top-3 left-3 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 pointer-events-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>ACTIVE ENDPOINTS: 6</span>
            </div>

            <div className="absolute bottom-3 left-3 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 pointer-events-none">
              Selected: <strong className="text-slate-200">{selectedNode.name}</strong> ({selectedNode.location})
            </div>
          </div>
        </div>

        {/* Selected Node Telemetry Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-[#090d16] border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between space-y-4">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Node Inspector
                </span>
                <h4 className="text-sm font-semibold text-white">{selectedNode.name}</h4>
                <p className="text-xs text-slate-400">{selectedNode.location}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                  selectedNode.status === 'ALERT'
                    ? 'bg-rose-950/60 border-rose-900/60 text-rose-400'
                    : selectedNode.status === 'ELEVATED'
                    ? 'bg-amber-950/60 border-amber-900/60 text-amber-400'
                    : 'bg-emerald-950/60 border-emerald-900/60 text-emerald-400'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-[#0f1422] border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block font-sans">Protocol</span>
                <span className="text-slate-200 font-semibold">{selectedNode.type}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0f1422] border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block font-sans">Throughput</span>
                <span className="text-emerald-400 font-semibold">{selectedNode.eps.toLocaleString()} eps</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0f1422] border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block font-sans">Target Port</span>
                <span className="text-amber-400 font-semibold">Port {selectedNode.targetPort}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0f1422] border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block font-sans">OCSF Schema</span>
                <span className="text-cyan-400 font-semibold">Mapped ✓</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                Sample Raw Payload:
              </span>
              <pre className="bg-[#0f1422] border border-slate-800/60 p-2.5 rounded-lg text-[11px] font-mono text-slate-300 whitespace-pre-wrap break-all max-h-32 overflow-y-auto leading-relaxed">
                {selectedNode.sampleLog}
              </pre>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
              Select Endpoint Node:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {NODES.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedNode(n);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-mono truncate transition-all text-center border ${
                    selectedNode.id === n.id
                      ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                      : 'bg-[#0f1422] border-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {n.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
