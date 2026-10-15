"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import type * as THREE from "three";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface SolarSceneData {
  panels: number;
  systemKwp: number;
  roofType: "flat" | "sloped";
  orientation: string;
  orientationLabel?: string;
  month: string;
}

const ROOF_W = 17;
const ROOF_D = 13;
const PANEL_X = 1.4; // panel cell pitch along X
const PANEL_Z = 2.2; // panel cell pitch along Z

/**
 * Panel azimuth (rotation around Y, radians). +Z is "south" (camera side);
 * +X is "east". Panels are swung to face the sun for the chosen orientation,
 * and "mixed" installs split into alternating east/west banks.
 */
const ORIENTATION_AZIMUTH: Record<string, number> = {
  south: 0,
  southeast: Math.PI / 4,
  east: Math.PI / 2,
  southwest: -Math.PI / 4,
  west: -Math.PI / 2,
  mixed: 0,
};

function normalizeOrientation(raw: string): string {
  const s = (raw || "south").toLowerCase().trim();
  if (s in ORIENTATION_AZIMUTH) return s;
  if ((s.includes("east") && s.includes("west")) || s.includes("مختلط") || s.includes("شرق وغرب")) return "mixed";
  if (s.includes("southeast") || s.includes("جنوب شرق")) return "southeast";
  if (s.includes("southwest") || s.includes("جنوب غرب")) return "southwest";
  if (s.includes("south") || s.includes("جنوب")) return "south";
  if (s.includes("east") || s.includes("شرق")) return "east";
  if (s.includes("west") || s.includes("غرب")) return "west";
  return "south";
}

function sunPositionFor(orientation: string): [number, number, number] {
  const norm = normalizeOrientation(orientation);
  switch (norm) {
    case "east":
      return [13, 9, 3];
    case "west":
      return [-13, 9, 3];
    case "southeast":
      return [11, 9, 7];
    case "southwest":
      return [-11, 9, 7];
    case "south":
      return [6, 10, 9];
    case "mixed":
    default:
      return [9, 12, 5];
  }
}

/** Ease-out-cubic grow-from-ground animation for a group. */
function useGrowIn(ref: React.RefObject<THREE.Group | null>, delay = 0, duration = 700) {
  useEffect(() => {
    const g = ref.current;
    if (!g) return;
    g.scale.set(0.001, 0.001, 0.001);
    const t0 = performance.now();
    let raf = 0;
    const loop = () => {
      const k = Math.min(1, Math.max(0, (performance.now() - t0) / duration - delay / 1000));
      const e = 1 - Math.pow(1 - k, 3);
      g.scale.setScalar(Math.max(0.001, e));
      if (k < 1) raf = requestAnimationFrame(loop);
      else g.scale.setScalar(1);
    };
    loop();
    // Backstop: even if rAF is throttled, the group must never stay hidden.
    const t = setTimeout(() => g.scale.setScalar(1), duration + delay + 150);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [ref, delay, duration]);
}

function usePanelGrow(ref: React.RefObject<THREE.Group | null>, delay: number) {
  useGrowIn(ref, delay, 550);
}

function SolarPanel({ x, z, tilt, azimuth, delay }: { x: number; z: number; tilt: number; azimuth: number; delay: number }) {
  const ref = useRef<THREE.Group>(null);
  usePanelGrow(ref, delay);
  // y = 0.22 lifts the array onto the roof surface: the slab top sits at local
  // y = +0.14, so without this the panels were buried inside the slab and invisible.
  return (
    <group ref={ref} position={[x, 0.22, z]} rotation={[0, azimuth, 0]}>
      <group rotation={[tilt, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.06, 0.12, 1.84]} />
          <meshStandardMaterial color="#101c33" metalness={0.65} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.07, 0]} castShadow>
          <boxGeometry args={[0.96, 0.02, 1.74]} />
          <meshStandardMaterial color="#0284c7" metalness={0.75} roughness={0.15} emissive="#0369a1" emissiveIntensity={0.65} />
        </mesh>
        <mesh position={[0, -0.07, 0]}>
          <boxGeometry args={[1.12, 0.03, 1.9]} />
          <meshStandardMaterial color="#2a3a20" metalness={0.2} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function PanelArray({ count, tilt, orientation }: { count: number; tilt: number; orientation: string }) {
  const cols = Math.max(2, Math.floor((ROOF_W - 1.0) / PANEL_X));
  const maxRows = Math.max(2, Math.floor((ROOF_D - 1.4) / PANEL_Z));
  const rows = Math.min(maxRows, Math.max(1, Math.ceil(count / cols)));
  const shown = Math.min(count, cols * rows);
  const mixed = orientation === "mixed";
  const azimuth = ORIENTATION_AZIMUTH[orientation] ?? 0;

  const cells = useMemo(() => {
    const list: { x: number; z: number; azimuth: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (list.length >= shown) break;
        const x = -((cols - 1) * PANEL_X) / 2 + c * PANEL_X;
        const z = -((rows - 1) * PANEL_Z) / 2 + r * PANEL_Z;
        // East–west ("mixed") arrays: alternate rows face opposite ways.
        const az = mixed ? (r % 2 === 0 ? Math.PI / 2 : -Math.PI / 2) : azimuth;
        list.push({ x, z, azimuth: az });
      }
    }
    return list;
  }, [cols, rows, shown, mixed, azimuth]);

  return (
    <group>
      {cells.map((c, i) => (
        <SolarPanel key={i} x={c.x} z={c.z} tilt={tilt} azimuth={c.azimuth} delay={i * 0.03} />
      ))}
    </group>
  );
}

function Building({ tilt, panelCount, orientation }: { tilt: number; panelCount: number; orientation: string }) {
  const scaffold = useRef<THREE.Group>(null);
  useGrowIn(scaffold, 0, 800);

  return (
    <group ref={scaffold}>
      {/* main building body */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[ROOF_W - 3.5, 2.4, ROOF_D - 3.5]} />
        <meshStandardMaterial color="#1c2a40" metalness={0.35} roughness={0.7} />
      </mesh>
      {/* parapet / roof slab */}
      <group position={[0, 2.75, 0]} rotation={[tilt, 0, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[ROOF_W, 0.28, ROOF_D]} />
          <meshStandardMaterial color="#26364d" metalness={0.3} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[ROOF_W - 0.6, 0.06, ROOF_D - 0.6]} />
          <meshStandardMaterial color="#33455f" metalness={0.25} roughness={0.5} />
        </mesh>
        <PanelArray count={panelCount} tilt={tilt} orientation={orientation} />
      </group>
      {/* antennas / vents for detail */}
      {["vent", "ac"].map((k, i) => (
        <mesh key={k} position={i === 0 ? [-5, 2.95, -3.2] : [6, 2.95, 3.4]} castShadow>
          <boxGeometry args={[1.1, 0.4, 1.1]} />
          <meshStandardMaterial color="#2b3a50" metalness={0.3} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Sun({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.6}>
      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.85, 32, 32]} />
          <meshBasicMaterial color="#ffdf80" />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.7, 32, 32]} />
          <meshBasicMaterial color="#ffce54" transparent opacity={0.22} />
        </mesh>
        <mesh>
          <sphereGeometry args={[3.0, 24, 24]} />
          <meshBasicMaterial color="#ffd166" transparent opacity={0.07} />
        </mesh>
        <pointLight intensity={60} distance={60} decay={2} color="#ffd166" />
      </group>
    </Float>
  );
}

function EnergyRing() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (a.current) a.current.rotation.z += delta * 0.4;
    if (b.current) b.current.rotation.z -= delta * 0.28;
  });
  const r = Math.hypot(ROOF_W, ROOF_D) / 2 + 0.8;
  return (
    <group position={[0, 2.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={a}>
        <torusGeometry args={[r, 0.03, 8, 80]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} />
      </mesh>
      <mesh ref={b}>
        <torusGeometry args={[r - 1.1, 0.02, 8, 80]} />
        <meshBasicMaterial color="#3c9c4b" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function getOrientFallbackLabel(key: string, t: (k: any) => string): string {
  switch (key) {
    case "south": return t("orientSouth");
    case "southeast": return t("orientSoutheast");
    case "southwest": return t("orientSouthwest");
    case "east": return t("orientEast");
    case "west": return t("orientWest");
    case "mixed": return t("orientMixed");
    default: return key;
  }
}

export function SolarScene({ data }: { data: SolarSceneData }) {
  const { t, isAr } = useLanguage();
  const panels = Math.max(0, Math.min(data.panels, 240));
  const tilt = data.roofType === "sloped" ? 0.22 : 0.06;
  const normOrientation = normalizeOrientation(data.orientation);
  const sun = useMemo(() => sunPositionFor(normOrientation), [normOrientation]);
  const displayOrient = data.orientationLabel ?? getOrientFallbackLabel(normOrientation, t);

  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-2xl bg-[#04070d] sm:h-[400px]">
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [13, 9, 14], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={["#04070d", 34, 64]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={sun}
          intensity={2.4}
          color="#fff1c2"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <Stars radius={90} depth={50} count={2600} factor={4} saturation={0} fade speed={0.6} />
        <OrbitControls
          target={[0, 1.5, 0]}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.9}
          minDistance={7}
          maxDistance={34}
          minPolarAngle={0.45}
          maxPolarAngle={1.35}
        />

        <group key={`build-${panels}-${data.roofType}`}>
          <Building tilt={tilt} panelCount={panels} orientation={normOrientation} />
        </group>
        <EnergyRing />
        <Sun position={sun} />
        <Sparkles
          count={110}
          scale={[ROOF_W + 2, 9, ROOF_D + 2]}
          position={[0, 3.2, 0]}
          size={3.2}
          speed={0.35}
          color="#ffd166"
          opacity={0.75}
        />
      </Canvas>

      {/* Overlay readout */}
      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-solar-300/40 bg-dune-950/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-solar-300 backdrop-blur">
          {t("live3dModel")}
        </span>
        <span className="rounded-full border border-leaf-400/30 bg-dune-950/70 px-2.5 py-1 text-[10px] font-semibold text-leaf-300 backdrop-blur">
          {data.month}
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
        <p className="rounded-xl bg-dune-950/70 px-3 py-2 text-xs leading-tight text-dune-200 backdrop-blur">
          <b className="text-solar-300">{data.panels} {isAr ? "لوح" : "panels"}</b> · {data.systemKwp.toFixed(1)} {isAr ? "ك.و.ب" : "kWp"}
          <span className="block text-[10px] text-dune-400">{t("dragToOrbit")}</span>
        </p>
        <span className="rounded-full bg-dune-950/70 px-2.5 py-1 text-[10px] font-medium text-dune-300 backdrop-blur">
          {data.roofType === "sloped" ? t("slopedRoofText") : t("flatRoofText")} · {t("facing")} {displayOrient}
        </span>
      </div>
    </div>
  );
}
