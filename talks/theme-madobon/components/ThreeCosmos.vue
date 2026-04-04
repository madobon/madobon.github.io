<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  FogExp2,
  Group,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";

const root = ref<HTMLDivElement | null>(null);

let renderer: WebGLRenderer | null = null;
let animationFrame = 0;
let cleanup = () => {};

onMounted(() => {
  const element = root.value;
  if (!element) return;

  const scene = new Scene();
  scene.background = new Color("#050816");
  scene.fog = new FogExp2("#050816", 0.06);

  const camera = new PerspectiveCamera(48, 1, 0.1, 80);
  camera.position.set(0, 0, 7);

  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  element.append(renderer.domElement);

  const universe = new Group();
  scene.add(universe);

  const core = new Mesh(
    new IcosahedronGeometry(1.15, 1),
    new MeshBasicMaterial({
      color: "#ff9b6b",
      wireframe: true,
      transparent: true,
      opacity: 0.72,
    }),
  );
  universe.add(core);

  const shell = new Mesh(
    new IcosahedronGeometry(1.72, 2),
    new MeshBasicMaterial({
      color: "#7dd3fc",
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    }),
  );
  universe.add(shell);

  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let index = 0; index < particleCount; index += 1) {
    const i3 = index * 3;
    const radius = Math.random() * 18 + 2;
    const theta = Math.random() * Math.PI * 2;
    const spread = (Math.random() - 0.5) * 10;

    positions[i3] = Math.cos(theta) * radius + spread * 0.08;
    positions[i3 + 1] = (Math.random() - 0.5) * 12;
    positions[i3 + 2] = -Math.random() * 70;

    const color = new Color().setHSL(
      MathUtils.randFloat(0.52, 0.12),
      0.85,
      MathUtils.randFloat(0.62, 0.78),
    );
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute("position", new BufferAttribute(positions, 3));
  starGeometry.setAttribute("color", new BufferAttribute(colors, 3));

  const stars = new Points(
    starGeometry,
    new PointsMaterial({
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene.add(stars);

  const pointer = new Vector2(0, 0);
  const targetRotation = new Vector2(0, 0);
  const clock = new Clock();

  const resize = () => {
    const { clientWidth, clientHeight } = element;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer?.setSize(clientWidth, clientHeight, false);
  };

  const onPointerMove = (event: PointerEvent) => {
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    pointer.set(x * 2 - 1, y * 2 - 1);
    targetRotation.set(pointer.y * 0.35, pointer.x * 0.35);
  };

  const onPointerLeave = () => {
    targetRotation.set(0, 0);
  };

  const tick = () => {
    const elapsed = clock.getElapsedTime();
    const attribute = stars.geometry.getAttribute("position") as BufferAttribute;

    for (let index = 0; index < particleCount; index += 1) {
      const i3 = index * 3;
      let z = attribute.array[i3 + 2] as number;
      z += 0.18 + (index % 7) * 0.0025;

      if (z > 6) {
        z = -70;
        attribute.array[i3] = (Math.random() - 0.5) * 28;
        attribute.array[i3 + 1] = (Math.random() - 0.5) * 14;
      }

      attribute.array[i3 + 2] = z;
    }
    attribute.needsUpdate = true;

    universe.rotation.x = MathUtils.lerp(universe.rotation.x, targetRotation.x, 0.04);
    universe.rotation.y = MathUtils.lerp(universe.rotation.y, targetRotation.y, 0.04);
    universe.rotation.z += 0.0025;

    core.rotation.y -= 0.004;
    shell.rotation.x += 0.002;
    shell.rotation.y += 0.003;

    core.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.04);
    shell.scale.setScalar(1 + Math.cos(elapsed * 1.1) * 0.06);

    camera.position.x = MathUtils.lerp(camera.position.x, pointer.x * 0.55, 0.04);
    camera.position.y = MathUtils.lerp(camera.position.y, -pointer.y * 0.35, 0.04);
    camera.lookAt(0, 0, 0);

    renderer?.render(scene, camera);
    animationFrame = window.requestAnimationFrame(tick);
  };

  resize();
  tick();

  window.addEventListener("resize", resize);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerleave", onPointerLeave);

  cleanup = () => {
    window.removeEventListener("resize", resize);
    element.removeEventListener("pointermove", onPointerMove);
    element.removeEventListener("pointerleave", onPointerLeave);
    window.cancelAnimationFrame(animationFrame);
    starGeometry.dispose();
    core.geometry.dispose();
    shell.geometry.dispose();
    (core.material as MeshBasicMaterial).dispose();
    (shell.material as MeshBasicMaterial).dispose();
    (stars.material as PointsMaterial).dispose();
    renderer?.dispose();
  };
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <div class="cosmos-shell">
    <div ref="root" class="cosmos-canvas" />
    <div class="cosmos-overlay">
      <div class="cosmos-badge">Three.js</div>
      <h2>Float through a living starfield</h2>
      <p>
        Move the pointer and the scene leans with you while particles stream in from deep space.
      </p>
    </div>
  </div>
</template>

<style scoped>
.cosmos-shell {
  position: relative;
  margin-top: 1.75rem;
  min-height: 24rem;
  overflow: hidden;
  border: 1px solid rgba(125, 211, 252, 0.15);
  border-radius: 1.6rem;
  background:
    radial-gradient(circle at top, rgba(96, 165, 250, 0.16), transparent 30%),
    radial-gradient(circle at bottom left, rgba(249, 115, 22, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(5, 8, 22, 0.98), rgba(2, 6, 23, 0.94));
  box-shadow:
    inset 0 0 60px rgba(96, 165, 250, 0.08),
    0 30px 70px rgba(0, 0, 0, 0.35);
}

.cosmos-canvas {
  position: absolute;
  inset: 0;
}

.cosmos-overlay {
  position: relative;
  z-index: 1;
  display: flex;
  max-width: 22rem;
  min-height: 24rem;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1.4rem;
  background: linear-gradient(90deg, rgba(5, 8, 22, 0.72), transparent 85%);
}

.cosmos-badge {
  width: fit-content;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 999px;
  padding: 0.3rem 0.65rem;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.88);
}

.cosmos-overlay h2 {
  margin: 0;
  font-size: 2rem;
}

.cosmos-overlay p {
  margin: 0;
  color: rgba(226, 232, 240, 0.72);
  font-size: 0.95rem;
}
</style>
