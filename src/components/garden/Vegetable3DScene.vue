<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  FogExp2,
  Clock,
  Vector2,
  Vector3,
  MathUtils,
  BufferGeometry,
  BufferAttribute,
  Points,
  PointsMaterial,
  AdditiveBlending,
  Texture,
  Sprite,
  SpriteMaterial,
  Raycaster,
  Plane,
} from "three";

interface VegetableData {
  name: string;
  variety: string;
  status: string;
  notes: string;
  startDate: string;
}

interface VegetableObject {
  mesh: Sprite;
  data: VegetableData;
  baseY: number;
  phase: number;
}

const props = defineProps<{
  vegetables: VegetableData[];
}>();

const emit = defineEmits<{
  (e: "select", vegetable: VegetableData): void;
}>();

const root = ref<HTMLDivElement | null>(null);

let renderer: WebGLRenderer | null = null;
let animationFrame = 0;
let cleanup = () => {};
let vegetables: VegetableObject[] = [];
let selectedVegetable: VegetableObject | null = null;

// パーティクルテクスチャ作成
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

// 野菜スプライトテクスチャ作成
const createVegetableTexture = (status: string, isSelected: boolean = false) => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const context = canvas.getContext("2d");
  if (!context) return null;

  // 色定義
  const colors: Record<string, { main: string; accent: string }> = {
    育苗中: { main: "#86efac", accent: "#22c55e" },
    定植済み: { main: "#4ade80", accent: "#16a34a" },
    収穫中: { main: "#f87171", accent: "#dc2626" },
    直播き: { main: "#fbbf24", accent: "#d97706" },
    定植待ち: { main: "#60a5fa", accent: "#2563eb" },
    発芽待ち: { main: "#a78bfa", accent: "#7c3aed" },
  };

  const color = colors[status] || colors["育苗中"];
  const size = isSelected ? 64 : 48;

  // 外側グラデーション
  const outerGradient = context.createRadialGradient(64, 64, 0, 64, 64, size);
  outerGradient.addColorStop(0, color.main);
  outerGradient.addColorStop(0.7, color.accent);
  outerGradient.addColorStop(1, "rgba(0,0,0,0)");

  context.fillStyle = outerGradient;
  context.beginPath();
  context.arc(64, 64, size, 0, Math.PI * 2);
  context.fill();

  // 収穫中の場合は実を追加
  if (status === "収穫中") {
    context.fillStyle = "#ef4444";
    context.beginPath();
    context.arc(64, 64, 16, 0, Math.PI * 2);
    context.fill();
  }

  // 枠線
  context.strokeStyle = isSelected ? "#ffffff" : "rgba(255,255,255,0.3)";
  context.lineWidth = isSelected ? 4 : 2;
  context.beginPath();
  context.arc(64, 64, size - 2, 0, Math.PI * 2);
  context.stroke();

  const texture = new Texture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// 野菜オブジェクト作成
const createVegetableObject = (data: VegetableData, index: number): VegetableObject => {
  const angle = (index / props.vegetables.length) * Math.PI * 2;
  const radius = 3.5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const baseY = Math.sin(angle * 3) * 0.8;

  const texture = createVegetableTexture(data.status);
  const material = new SpriteMaterial({
    map: texture || undefined,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  const mesh = new Sprite(material);
  mesh.position.set(x, baseY, z);
  mesh.scale.set(1.2, 1.2, 1);
  mesh.userData = { isVegetable: true, status: data.status };

  return {
    mesh,
    data,
    baseY,
    phase: Math.random() * Math.PI * 2,
  };
};

// 背景パーティクル作成
const createBackgroundParticles = (scene: Scene) => {
  const particleCount = 800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);

  for (let index = 0; index < particleCount; index += 1) {
    const i3 = index * 3;
    positions[i3] = (Math.random() - 0.5) * 30;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 20 - 5;

    const tone = new Color().setHSL(
      MathUtils.randFloat(0.25, 0.4),
      0.6,
      MathUtils.randFloat(0.5, 0.8),
    );
    colors[i3] = tone.r;
    colors[i3 + 1] = tone.g;
    colors[i3 + 2] = tone.b;
    speeds[index] = 0.01 + Math.random() * 0.02;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  const particleTexture = createParticleTexture();

  const particles = new Points(
    geometry,
    new PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: AdditiveBlending,
      depthWrite: false,
      map: particleTexture || undefined,
      alphaMap: particleTexture || undefined,
    }),
  );

  scene.add(particles);
  return { particles, geometry, speeds };
};

onMounted(() => {
  const element = root.value;
  if (!element) return;

  const scene = new Scene();
  scene.fog = new FogExp2("#0a1929", 0.02);

  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 2, 8);

  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  element.append(renderer.domElement);

  // 背景パーティクル
  const { particles, geometry, speeds } = createBackgroundParticles(scene);

  // 野菜オブジェクト作成
  props.vegetables.forEach((veg, index) => {
    const vegObj = createVegetableObject(veg, index);
    vegetables.push(vegObj);
    scene.add(vegObj.mesh);
  });

  const pointer = new Vector2(0, 0);
  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 1, 0), 0);
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

    // レイキャストでホバー検出
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(vegetables.map((v) => v.mesh));

    if (intersects.length > 0) {
      const hovered = intersects[0].object as Sprite;
      hovered.scale.set(1.5, 1.5, 1);
      element.style.cursor = "pointer";
    } else {
      element.style.cursor = "default";
    }
  };

  const onPointerLeave = () => {
    pointer.set(0, 0);
    element.style.cursor = "default";
  };

  const onClick = (event: MouseEvent) => {
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    pointer.set(x * 2 - 1, y * 2 - 1);

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(vegetables.map((v) => v.mesh));

    if (intersects.length > 0) {
      const clicked = intersects[0].object as Sprite;
      const vegObj = vegetables.find((v) => v.mesh === clicked);
      if (vegObj) {
        emit("select", vegObj.data);
      }
    }
  };

  const tick = () => {
    const elapsed = clock.getElapsedTime();

    // 背景パーティクル更新
    const attribute = geometry.getAttribute("position") as BufferAttribute;
    for (let index = 0; index < speeds.length; index += 1) {
      const i3 = index * 3;
      let z = attribute.array[i3 + 2] as number;
      z += speeds[index];
      if (z > 5) {
        z = -5;
        attribute.array[i3] = (Math.random() - 0.5) * 30;
        attribute.array[i3 + 1] = (Math.random() - 0.5) * 20;
      }
      attribute.array[i3 + 2] = z;
    }
    attribute.needsUpdate = true;

    // 野菜オブジェクト更新
    vegetables.forEach((vegObj, index) => {
      // 浮遊アニメーション
      vegObj.mesh.position.y = vegObj.baseY + Math.sin(elapsed * 1.5 + vegObj.phase) * 0.15;
      // 回転
      vegObj.mesh.rotation.y = Math.sin(elapsed * 0.5 + vegObj.phase) * 0.3;

      // ポインター方向を向く
      vegObj.mesh.lookAt(camera.position);
    });

    // カメラ操作
    camera.position.x = MathUtils.lerp(camera.position.x, pointer.x * 1.5, 0.02);
    camera.position.y = MathUtils.lerp(camera.position.y, 2 - pointer.y * 0.8, 0.02);
    camera.lookAt(0, 0.5, 0);

    renderer?.render(scene, camera);
    animationFrame = window.requestAnimationFrame(tick);
  };

  resize();
  tick();

  window.addEventListener("resize", resize);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerleave", onPointerLeave);
  element.addEventListener("click", onClick);

  cleanup = () => {
    window.removeEventListener("resize", resize);
    element.removeEventListener("pointermove", onPointerMove);
    element.removeEventListener("pointerleave", onPointerLeave);
    element.removeEventListener("click", onClick);
    window.cancelAnimationFrame(animationFrame);
    vegetables.forEach((vegObj) => {
      (vegObj.mesh.material as SpriteMaterial).map?.dispose();
      (vegObj.mesh.material as SpriteMaterial).dispose();
      scene.remove(vegObj.mesh);
    });
    geometry.dispose();
    (particles.material as PointsMaterial).dispose();
    renderer?.dispose();
  };
});

// 野菜データ更新時の処理
watch(
  () => props.vegetables,
  (newVegetables) => {
    // シーンのリセットと再構築
    vegetables = [];
    // 実際にはもっと効率的な更新が必要ですが、まずはシンプルに
  },
  { deep: true },
);

onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <div ref="root" class="vegetable-3d-scene" aria-label="3D vegetable garden" />
</template>

<style scoped>
.vegetable-3d-scene {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}
</style>
