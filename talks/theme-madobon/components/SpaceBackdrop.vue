<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  FogExp2,
  MathUtils,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Texture,
  Vector2,
  WebGLRenderer,
} from "three";

const root = ref<HTMLDivElement | null>(null);

let renderer: WebGLRenderer | null = null;
let animationFrame = 0;
let cleanup = () => {};

const createParticleTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);

  const texture = new Texture(canvas);
  texture.needsUpdate = true;
  return texture;
};

onMounted(() => {
  const element = root.value;
  if (!element) return;

  const scene = new Scene();
  scene.fog = new FogExp2("#050816", 0.04);

  const camera = new PerspectiveCamera(52, 1, 0.1, 120);
  camera.position.set(0, 0, 12);

  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  element.append(renderer.domElement);

  const particleCount = 2200;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);

  for (let index = 0; index < particleCount; index += 1) {
    const i3 = index * 3;
    positions[i3] = (Math.random() - 0.5) * 48;
    positions[i3 + 1] = (Math.random() - 0.5) * 28;
    positions[i3 + 2] = -Math.random() * 100;

    const tone = new Color().setHSL(
      MathUtils.randFloat(0.52, 0.12),
      0.7,
      MathUtils.randFloat(0.55, 0.8),
    );
    colors[i3] = tone.r;
    colors[i3 + 1] = tone.g;
    colors[i3 + 2] = tone.b;
    speeds[index] = 0.03 + Math.random() * 0.06;
  }

  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute("position", new BufferAttribute(positions, 3));
  starGeometry.setAttribute("color", new BufferAttribute(colors, 3));
  const particleTexture = createParticleTexture();

  const stars = new Points(
    starGeometry,
    new PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.68,
      blending: AdditiveBlending,
      depthWrite: false,
      map: particleTexture ?? undefined,
      alphaMap: particleTexture ?? undefined,
    }),
  );
  scene.add(stars);

  const pointer = new Vector2(0, 0);
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
  };

  const onPointerLeave = () => {
    pointer.set(0, 0);
  };

  const tick = () => {
    const elapsed = clock.getElapsedTime();
    const attribute = stars.geometry.getAttribute("position") as BufferAttribute;

    for (let index = 0; index < particleCount; index += 1) {
      const i3 = index * 3;
      let z = attribute.array[i3 + 2] as number;
      z += speeds[index];

      if (z > 10) {
        z = -100;
        attribute.array[i3] = (Math.random() - 0.5) * 48;
        attribute.array[i3 + 1] = (Math.random() - 0.5) * 28;
      }

      attribute.array[i3 + 2] = z;
    }
    attribute.needsUpdate = true;

    stars.rotation.z = Math.sin(elapsed * 0.08) * 0.08;
    stars.rotation.x = MathUtils.lerp(stars.rotation.x, -pointer.y * 0.08, 0.025);
    stars.rotation.y = MathUtils.lerp(stars.rotation.y, pointer.x * 0.12, 0.025);

    camera.position.x = MathUtils.lerp(camera.position.x, pointer.x * 0.6, 0.02);
    camera.position.y = MathUtils.lerp(camera.position.y, -pointer.y * 0.35, 0.02);
    camera.lookAt(0, 0, -18);

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
    (stars.material as PointsMaterial).dispose();
    particleTexture?.dispose();
    renderer?.dispose();
  };
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <div ref="root" class="space-backdrop" aria-hidden="true" />
</template>

<style scoped>
.space-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  opacity: 0.95;
}
</style>
