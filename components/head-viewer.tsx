"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface Pose {
  pitch: number;
  yaw: number;
  roll: number;
}

const DEG = 180 / Math.PI;

// Sign calibration for the orbit -> DB-column mapping (see emitPose). Flip these
// if the returned faces turn opposite to the mesh.
const TURN_SIGN = -1; // azimuth -> pitch column (left/right turn)
const TILT_SIGN = 1; // elevation -> roll column (up/down tilt)

export function HeadViewer({
  onPoseChange,
  onReady,
}: {
  onPoseChange: (pose: Pose) => void;
  onReady?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onPoseRef = useRef(onPoseChange);
  onPoseRef.current = onPoseChange;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // black & white: white backdrop

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.maxPolarAngle = (8 * Math.PI) / 10;
    controls.minPolarAngle = (2.5 * Math.PI) / 10;
    controls.minAzimuthAngle = (-5 * Math.PI) / 10;
    controls.maxAzimuthAngle = (5 * Math.PI) / 10;

    // monochrome lighting
    const ambient = new THREE.HemisphereLight(0xffffff, 0x444444, 1.4);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(20, 25, 20);
    scene.add(ambient, key);

    // Derive the DB pose columns from the orbit state. NOTE: stare's
    // head_pose_from_matrix labels are rotated vs. intuition for this data —
    // the `pitch` column actually carries left/right turn, `roll` carries
    // up/down, and `yaw` carries in-plane tilt. So map the horizontal orbit
    // (azimuth) to pitch and the vertical orbit (elevation) to roll.
    const emitPose = () => {
      const azDeg = controls.getAzimuthalAngle() * DEG; // horizontal turn
      const elevDeg = (Math.PI / 2 - controls.getPolarAngle()) * DEG; // up/down
      onPoseRef.current({
        pitch: Math.round(TURN_SIGN * azDeg), // DB pitch col = left/right
        roll: Math.round(TILT_SIGN * elevDeg), // DB roll col = up/down
        yaw: 0, // DB yaw col = in-plane roll (orbit produces none)
      });
    };

    // Throttle pose emission so faces update *during* the drag (leading + trailing
    // edge), not only after release, while still capping the query rate.
    const THROTTLE_MS = 110;
    let lastEmit = 0;
    let trailingTimer: ReturnType<typeof setTimeout> | null = null;
    const now = () =>
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const onControlsChange = () => {
      const elapsed = now() - lastEmit;
      if (elapsed >= THROTTLE_MS) {
        lastEmit = now();
        emitPose();
      } else {
        if (trailingTimer) clearTimeout(trailingTimer);
        trailingTimer = setTimeout(() => {
          lastEmit = now();
          emitPose();
        }, THROTTLE_MS - elapsed);
      }
    };
    controls.addEventListener("change", onControlsChange);

    const loader = new OBJLoader();
    loader.setPath("/models/");
    let frame = 0;
    loader.load("headmodel.obj", (obj) => {
      const mesh = obj.children[0] as THREE.Mesh;
      mesh.material = new THREE.MeshStandardMaterial({
        color: 0xdedede,
        roughness: 0.85,
        metalness: 0.0,
      });
      const box = new THREE.Box3().setFromObject(obj);
      const center = new THREE.Vector3();
      box.getCenter(center);
      mesh.position.set(-center.x, -center.y, -center.z);
      const size = new THREE.Vector3();
      box.getSize(size);
      const scale = 9 / Math.max(size.x, size.y, size.z);
      obj.scale.setScalar(scale);
      // face points -Z in the source mesh; rotate to face the camera (+Z)
      obj.rotation.set(0, Math.PI, 0);
      scene.add(obj);

      const animate = () => {
        frame = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
      emitPose(); // initial frontal search
      onReadyRef.current?.(); // mesh loaded + first frame rendered
    });

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      controls.removeEventListener("change", onControlsChange);
      if (trailingTimer) clearTimeout(trailingTimer);
      cancelAnimationFrame(frame);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="aspect-square w-full overflow-hidden rounded-lg border bg-white"
    />
  );
}
