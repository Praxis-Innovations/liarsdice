/**
 * Web hero dice — vanilla Three.js WebGL (not CSS 3D; filename is historical).
 * Native builds resolve `CssDice3D.tsx` instead and never load this module.
 */
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { DieFace } from "../shared/Die";
import { ScatteredDice, type ScatteredDieConfig } from "./AnimatedDice";
import type { DiceTableConfig } from "./DicePlatform";

type DieData = {
  face: DieFace;
  color: string;
  size: number;
  top?: number;
  left?: number;
  /** Physical near/far position on the tabletop. */
  tableDepth?: number;
  restRotate: string;
  throwOffsetX?: number;
  throwDistance?: number;
};

/**
 * Pip positions on the flat center of a rounded unit cube.
 * Keep within ~±0.22 so dots stay on the face, not the fillet.
 */
const PIP_LAYOUT: Record<DieFace, [number, number][]> = {
  1: [[0, 0]],
  2: [
    [-0.22, 0.22],
    [0.22, -0.22],
  ],
  3: [
    [-0.22, 0.22],
    [0, 0],
    [0.22, -0.22],
  ],
  4: [
    [-0.22, 0.22],
    [0.22, 0.22],
    [-0.22, -0.22],
    [0.22, -0.22],
  ],
  5: [
    [-0.22, 0.22],
    [0.22, 0.22],
    [0, 0],
    [-0.22, -0.22],
    [0.22, -0.22],
  ],
  6: [
    [-0.22, 0.22],
    [0.22, 0.22],
    [-0.22, 0],
    [0.22, 0],
    [-0.22, -0.22],
    [0.22, -0.22],
  ],
};

/**
 * Pip assignment so `rolled` lands on TOP — the face most visible under the
 * elevated table camera. Opposite faces sum to 7; side rings are valid die nets.
 */
function faceValues(rolledTop: DieFace) {
  const ring: Record<DieFace, [DieFace, DieFace, DieFace, DieFace]> = {
    // [front, right, back, left]
    1: [2, 3, 5, 4],
    2: [1, 3, 6, 4],
    3: [1, 5, 6, 2],
    4: [1, 2, 6, 5],
    5: [1, 4, 6, 3],
    6: [2, 4, 5, 3],
  };
  const [front, right, back, left] = ring[rolledTop];
  return {
    top: rolledTop,
    bottom: (7 - rolledTop) as DieFace,
    front,
    back,
    right,
    left,
  };
}

function toWorld(left: number, top: number, size: number, width: number, height: number) {
  return {
    x: left + size / 2 - width / 2,
    y: height / 2 - (top + size / 2),
  };
}

function createTable(table: DiceTableConfig, canvasWidth: number, canvasHeight: number): THREE.Group {
  const surfaceY = canvasHeight / 2 - table.surfaceTop;
  const centerX = table.left + table.width / 2 - canvasWidth / 2;
  const padDepth = Math.min(220, Math.max(130, table.width * 0.34));
  const group = new THREE.Group();

  // One off-center radial gradient creates a halo that feathers downward.
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const context = shadowCanvas.getContext("2d")!;
  const gradient = context.createRadialGradient(128, 94, 16, 128, 114, 142);
  const halo = new THREE.Color(table.haloColor);
  const { r, g, b } = halo;
  const haloRgb = `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`;
  gradient.addColorStop(0, `rgba(${haloRgb}, 0.22)`);
  gradient.addColorStop(0.48, `rgba(${haloRgb}, 0.11)`);
  gradient.addColorStop(1, `rgba(${haloRgb}, 0)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  shadowTexture.colorSpace = THREE.SRGBColorSpace;

  // One low oval reads as the landing zone without a duplicate shadow.
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(1, 64),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    }),
  );
  pad.rotation.x = -Math.PI / 2;
  // Slightly deeper than wide-screen default so the halo has more vertical presence.
  pad.scale.set(table.width * 0.54, padDepth * 0.7, 1);
  pad.position.set(centerX, surfaceY - 1, -padDepth * 0.08);
  group.add(pad);
  // Stash for explicit GPU cleanup — material.dispose() does not free maps.
  group.userData.disposables = [shadowTexture, pad.geometry, pad.material];

  return group;
}

function disposeObject3D(root: THREE.Object3D) {
  const extras = root.userData?.disposables as Array<THREE.Material | THREE.Texture | THREE.BufferGeometry> | undefined;
  extras?.forEach((item) => item.dispose());

  root.traverse((obj: THREE.Object3D) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.geometry?.dispose();
    const material = obj.material;
    const materials = Array.isArray(material) ? material : material ? [material] : [];
    for (const mat of materials) {
      const mapped = mat as THREE.MeshBasicMaterial;
      mapped.map?.dispose();
      mat.dispose();
    }
  });
}

type Side = "front" | "back" | "top" | "bottom" | "right" | "left";

const SIDE_ORIENT: Record<Side, { position: THREE.Vector3; quaternion: THREE.Quaternion }> = {
  front: {
    position: new THREE.Vector3(0, 0, 0.5),
    quaternion: new THREE.Quaternion(),
  },
  back: {
    position: new THREE.Vector3(0, 0, -0.5),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)),
  },
  top: {
    position: new THREE.Vector3(0, 0.5, 0),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
  },
  bottom: {
    position: new THREE.Vector3(0, -0.5, 0),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),
  },
  right: {
    position: new THREE.Vector3(0.5, 0, 0),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),
  },
  left: {
    position: new THREE.Vector3(-0.5, 0, 0),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)),
  },
};

function addFacePips(
  group: THREE.Group,
  side: Side,
  value: DieFace,
  pipColor: string,
  pipGeo: THREE.CircleGeometry,
) {
  const { position, quaternion } = SIDE_ORIENT[side];
  const pivot = new THREE.Group();
  pivot.position.copy(position);
  pivot.quaternion.copy(quaternion);

  const pipMat = new THREE.MeshStandardMaterial({
    color: pipColor,
    roughness: 0.4,
    metalness: 0,
    emissive: new THREE.Color(pipColor),
    emissiveIntensity: 0.06,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });

  for (const [x, y] of PIP_LAYOUT[value]) {
    // Flat disc flush with the face — not a protruding bubble
    const pip = new THREE.Mesh(pipGeo, pipMat);
    pip.position.set(x, y, 0.004);
    pivot.add(pip);
  }

  group.add(pivot);
}

/** One solid rounded cube + flat face pips. */
function createDie(color: string, face: DieFace, pipColor: string): THREE.Group {
  const group = new THREE.Group();
  const faces = faceValues(face);

  // Casino-style: modest fillet (0.14) so it stays cube-like, not a cushion
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(1, 1, 1, 7, 0.14),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
      metalness: 0,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.16,
    }),
  );
  group.add(body);

  const pipGeo = new THREE.CircleGeometry(0.072, 24);

  (Object.keys(faces) as Side[]).forEach((side) => {
    addFacePips(group, side, faces[side], pipColor, pipGeo);
  });

  return group;
}

/** Gravity-like ease: slow start, accelerate down, soft settle. */
function easeGravity(t: number) {
  if (t < 0.82) {
    const g = t / 0.82;
    return 0.92 * g * g;
  }
  // Soft bounce settle onto the platform
  const b = (t - 0.82) / 0.18;
  return 0.92 + 0.08 * (1 - Math.pow(1 - b, 3));
}

/**
 * Rest flat on the bottom face (pitch/roll = 0). Yaw varies by index/face so
 * neighbors don't look identical; `face` itself is applied in `faceValues` as TOP.
 */
function landEuler(face: DieFace, index: number, _restZ: number): THREE.Euler {
  const yaw =
    (index % 2 === 0 ? 0.54 : -0.54) + ((index % 3) - 1) * 0.07 + (face - 3.5) * 0.04;
  return new THREE.Euler(0, yaw, 0, "XYZ");
}

export function ScatteredCssDice({
  dice,
  pipColor = "#FFFFFF",
  width = 0,
  height = 0,
  table,
  verticalOffset = 0,
}: {
  dice: DieData[];
  pipColor?: string;
  width?: number;
  height?: number;
  table?: DiceTableConfig;
  /** Extra canvas space above the hero (used to start dice behind the nav). */
  verticalOffset?: number;
}) {
  const hostRef = useRef<View>(null);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    if (dice.length === 0 || width < 32 || height < 32) return;
    if (typeof document === "undefined") return;

    let cancelled = false;
    let cleanupScene: (() => void) | undefined;

    const mount = () => {
      if (cancelled) return;

      const raw = hostRef.current as unknown as HTMLElement | { getNode?: () => HTMLElement } | null;
      const host: HTMLElement | null =
        raw && typeof (raw as HTMLElement).appendChild === "function"
          ? (raw as HTMLElement)
          : raw && typeof (raw as { getNode?: () => HTMLElement }).getNode === "function"
            ? (raw as { getNode: () => HTMLElement }).getNode()
            : null;

      if (!host) {
        requestAnimationFrame(mount);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.pointerEvents = "none";
      canvas.style.display = "block";
      // Keep WebGL behind the semantic hero copy even in RN-web's DOM stacking contexts.
      canvas.style.zIndex = "0";
      host.appendChild(canvas);

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch (err) {
        console.error("[HeroDice3D] WebGL unavailable", err);
        canvas.remove();
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, height, false);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000);
      // Person-at-the-table angle: elevated enough to reveal the die tops
      // and table surface while dice remain physically flat.
      camera.position.set(0, height * 0.3, 650);
      camera.lookAt(0, -height * 0.08, 0);

      // Bright, even lighting — enough fill that faces never crush to black
      scene.add(new THREE.AmbientLight(0xffffff, 1.15));
      const key = new THREE.DirectionalLight(0xffffff, 0.65);
      key.position.set(120, 180, 220);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.45);
      fill.position.set(-150, 80, 120);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 0.25);
      rim.position.set(40, -100, 160);
      scene.add(rim);

      const sceneTable = table
        ? {
            ...table,
            top: table.top + verticalOffset,
            surfaceTop: table.surfaceTop + verticalOffset,
          }
        : undefined;
      const tableMesh = sceneTable ? createTable(sceneTable, width, height) : null;
      if (tableMesh) scene.add(tableMesh);

      type AnimDie = {
        mesh: THREE.Group;
        start: THREE.Vector3;
        land: THREE.Vector3;
        startQuat: THREE.Quaternion;
        landQuat: THREE.Quaternion;
        size: number;
        delay: number;
      };

      const animDice: AnimDie[] = dice.map((die, index) => {
        const mesh = createDie(die.color, die.face, pipColor);
        const land = toWorld(die.left ?? 0, (die.top ?? 0) + verticalOffset, die.size, width, height);
        const tableDepth = die.tableDepth ?? 0;
        const euler = landEuler(die.face, index, 0);
        // Always begin at the top of the extended canvas (behind the navbar).
        const canvasTopY = height / 2 - die.size / 2;
        const start = {
          x: land.x + (die.throwOffsetX ?? 0) * 0.15,
          y: canvasTopY + (index % 3) * 10,
        };
        const landQuat = new THREE.Quaternion().setFromEuler(euler);
        const spins = [
          [2.2, -3.1, 1.4],
          [-2.8, 2.4, -1.9],
          [3.4, 1.6, 2.7],
          [-1.7, -2.9, 3.2],
          [2.9, 3.5, -2.1],
          [-3.3, 1.8, 2.4],
        ][index % 6];
        const startQuat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(spins[0] * Math.PI, spins[1] * Math.PI, spins[2] * Math.PI),
        );

        mesh.position.set(start.x, start.y, tableDepth);
        mesh.scale.setScalar(die.size);
        mesh.quaternion.copy(startQuat);
        scene.add(mesh);

        return {
          mesh,
          start: new THREE.Vector3(start.x, start.y, tableDepth),
          land: new THREE.Vector3(land.x, land.y, tableDepth),
          startQuat,
          landQuat,
          size: die.size,
          delay: 0.04 + index * 0.08,
        };
      });

      const duration = 1.05;
      const q = new THREE.Quaternion();
      const started = performance.now();
      let frame = 0;
      let alive = true;

      const tick = (now: number) => {
        if (!alive) return;
        const elapsed = (now - started) / 1000;

        for (const d of animDice) {
          const t = Math.max(0, Math.min(1, (elapsed - d.delay) / duration));
          const e = easeGravity(t);
          // Vertical drop only — X stays put
          d.mesh.position.x = THREE.MathUtils.lerp(d.start.x, d.land.x, Math.min(1, e * 1.1));
          d.mesh.position.y = THREE.MathUtils.lerp(d.start.y, d.land.y, e);
          d.mesh.position.z = THREE.MathUtils.lerp(d.start.z, d.land.z, e);
          d.mesh.scale.setScalar(d.size);
          q.slerpQuaternions(d.startQuat, d.landQuat, e);
          d.mesh.quaternion.copy(q);
        }

        renderer.render(scene, camera);
        frame = requestAnimationFrame(tick);
      };

      renderer.render(scene, camera);
      setWebglReady(true);
      frame = requestAnimationFrame(tick);

      cleanupScene = () => {
        alive = false;
        cancelAnimationFrame(frame);
        animDice.forEach((d) => {
          scene.remove(d.mesh);
          disposeObject3D(d.mesh);
        });
        if (tableMesh) {
          scene.remove(tableMesh);
          disposeObject3D(tableMesh);
        }
        renderer.dispose();
        canvas.remove();
        setWebglReady(false);
      };
    };

    mount();

    return () => {
      cancelled = true;
      cleanupScene?.();
    };
  }, [dice, height, pipColor, table, verticalOffset, width]);

  if (width < 32 || height < 32 || dice.length === 0) {
    return null;
  }

  return (
    <>
      {!webglReady ? <ScatteredDice dice={dice as ScatteredDieConfig[]} pipColor={pipColor} /> : null}
      <View
        ref={hostRef}
        collapsable={false}
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, width, height, zIndex: 0 }}
      />
    </>
  );
}

