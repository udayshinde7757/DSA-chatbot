/**
 * DsaScene3D — Three.js WebGL background scene for AlgoMate
 *
 * Renders (all GPU-accelerated, no DOM elements):
 *  • Floating 3D binary-tree nodes wired with edges
 *  • Graph network of spheres & lines
 *  • Upward-drifting algorithmic particle text (canvas)
 *  • Dynamic light orbs that drift and shift colour
 *  • Mouse-parallax camera drift
 *
 * Falls back gracefully when WebGL is unavailable.
 */

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ─────────────────────────── helpers ──────────────────────────── */

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 43758.5453123;
  return x - Math.floor(x);
}

function randomBetween(min: number, max: number, seed: number) {
  return min + seededRand(seed) * (max - min);
}

/* ─────────────────────────── main component ────────────────────── */

export function DsaScene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── renderer ── */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return; // WebGL unavailable → graceful fallback
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    /* ── scene / camera ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 22);

    /* ── materials ── */
    const amberMat = new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.85 });
    const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.85 });
    const purpleMat = new THREE.MeshBasicMaterial({ color: 0x7b2ffc, transparent: true, opacity: 0.7 });
    const lineMats = [
      new THREE.LineBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.25 }),
      new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.20 }),
      new THREE.LineBasicMaterial({ color: 0x7b2ffc, transparent: true, opacity: 0.15 }),
    ];

    /* ── geometry pool ── */
    const sphereGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const smallSphereGeo = new THREE.SphereGeometry(0.06, 6, 6);

    /* ── Binary Tree (left region) ── */
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-10, 3, -6);
    scene.add(treeGroup);

    const treeNodes: THREE.Vector3[] = [];
    function addNode(parent: THREE.Vector3 | null, x: number, y: number, z: number, depth: number) {
      if (depth > 3) return;
      const pos = new THREE.Vector3(x, y, z);
      treeNodes.push(pos);
      const sphere = new THREE.Mesh(sphereGeo, depth % 2 === 0 ? amberMat : cyanMat);
      sphere.position.copy(pos);
      treeGroup.add(sphere);

      if (parent) {
        const points = [parent.clone(), pos];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        treeGroup.add(new THREE.Line(lineGeo, lineMats[0]));
      }

      const spread = 2.0 / depth;
      addNode(pos, x - spread, y - 1.5, z + 0.3, depth + 1);
      addNode(pos, x + spread, y - 1.5, z - 0.3, depth + 1);
    }
    addNode(null, 0, 4, 0, 1);

    /* ── Graph Network (right region) ── */
    const graphGroup = new THREE.Group();
    graphGroup.position.set(8, -2, -8);
    scene.add(graphGroup);

    const graphPositions: THREE.Vector3[] = Array.from({ length: 9 }, (_, i) =>
      new THREE.Vector3(
        randomBetween(-3, 3, i * 7.1),
        randomBetween(-2.5, 2.5, i * 13.3),
        randomBetween(-1.5, 1.5, i * 17.9),
      ),
    );

    graphPositions.forEach((pos, i) => {
      const mat = [amberMat, cyanMat, purpleMat][i % 3];
      const node = new THREE.Mesh(i === 0 ? sphereGeo : smallSphereGeo, mat);
      node.position.copy(pos);
      graphGroup.add(node);
    });

    // Connect nearest neighbours
    graphPositions.forEach((a, i) => {
      graphPositions.forEach((b, j) => {
        if (j <= i) return;
        if (a.distanceTo(b) < 2.8) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([a, b]);
          graphGroup.add(new THREE.Line(lineGeo, lineMats[1]));
        }
      });
    });

    /* ── Floating particles (top background) ── */
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = randomBetween(-22, 22, i * 2.1) ;
      particlePositions[i * 3 + 1] = randomBetween(-14, 14, i * 3.7);
      particlePositions[i * 3 + 2] = randomBetween(-16, -4, i * 5.3);
      particleSpeeds[i] = 0.005 + seededRand(i * 11.7) * 0.015;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ── Hash table mesh (center-bottom) ── */
    const hashGroup = new THREE.Group();
    hashGroup.position.set(0, -6, -5);
    scene.add(hashGroup);
    const boxGeo = new THREE.BoxGeometry(0.6, 0.3, 0.25);
    for (let col = 0; col < 6; col++) {
      for (let row = 0; row < 3; row++) {
        const filled = seededRand(col * 3 + row + 99) > 0.4;
        if (!filled) continue;
        const mat = col % 3 === 0 ? amberMat : col % 3 === 1 ? cyanMat : purpleMat;
        const box = new THREE.Mesh(boxGeo, mat);
        box.position.set(col * 0.75 - 1.8, row * 0.4 - 0.4, 0);
        box.material = (mat as THREE.MeshBasicMaterial).clone();
        (box.material as THREE.MeshBasicMaterial).opacity = 0.35 + seededRand(col + row * 7) * 0.4;
        hashGroup.add(box);
      }
    }

    /* ── Ambient light orbs ── */
    const orbs = [
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.12 })), speed: 0.0008, radius: 12, phase: 0 },
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.10 })), speed: 0.0012, radius: 9, phase: 2.1 },
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), new THREE.MeshBasicMaterial({ color: 0x7b2ffc, transparent: true, opacity: 0.09 })), speed: 0.0006, radius: 14, phase: 4.2 },
    ];
    orbs.forEach(o => scene.add(o.mesh));

    /* ── Mouse parallax ── */
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    /* ── Resize ── */
    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    /* ── Render loop ── */
    let rafId: number;
    let t = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      t += 0.01;

      // Rotate structural groups
      treeGroup.rotation.y = Math.sin(t * 0.15) * 0.18;
      treeGroup.rotation.x = Math.sin(t * 0.10) * 0.08;
      graphGroup.rotation.y = t * 0.12;
      graphGroup.rotation.x = Math.sin(t * 0.08) * 0.06;
      hashGroup.rotation.y = Math.sin(t * 0.07) * 0.12;
      hashGroup.rotation.z = Math.sin(t * 0.05) * 0.04;

      // Float particles upward
      const positions = particleGeo.attributes["position"] as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        positions.array[i * 3 + 1] += particleSpeeds[i];
        if ((positions.array[i * 3 + 1] as number) > 14) {
          positions.array[i * 3 + 1] = -14;
        }
      }
      positions.needsUpdate = true;

      // Orbit light orbs
      orbs.forEach(o => {
        o.mesh.position.x = Math.cos(t * o.speed * 100 + o.phase) * o.radius;
        o.mesh.position.y = Math.sin(t * o.speed * 80 + o.phase) * o.radius * 0.5;
        o.mesh.position.z = Math.sin(t * o.speed * 60 + o.phase) * 5 - 8;
      });

      // Parallax camera drift
      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="dsa-3d-canvas"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
