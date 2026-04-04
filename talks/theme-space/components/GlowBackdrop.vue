<script setup lang="ts">
import { useNav } from "@slidev/client";
import { computed, ref, watch } from "vue";

type Point = [number, number];
type Range = [number, number];
type Motion = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
};
type Distribution =
  | "full"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | "topmost";

const { currentSlideRoute } = useNav();

const slideMeta = computed<Record<string, unknown>>(
  () =>
    (currentSlideRoute.value.meta?.slide as { frontmatter?: Record<string, unknown> })
      ?.frontmatter ?? {},
);

const distribution = computed<Distribution>(
  () => (slideMeta.value.glow as Distribution | undefined) ?? "full",
);
const opacity = computed(() => Number(slideMeta.value.glowOpacity ?? 0.5));
const hue = computed(() => Number(slideMeta.value.glowHue ?? 0));
const seed = computed(() => String(slideMeta.value.glowSeed ?? currentSlideRoute.value.no));

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(input: string) {
  let state = hashString(input) || 1;
  return () => {
    state += 0x6d2b79f5;
    let temp = Math.imul(state ^ (state >>> 15), 1 | state);
    temp ^= temp + Math.imul(temp ^ (temp >>> 7), 61 | temp);
    return ((temp ^ (temp >>> 14)) >>> 0) / 4294967296;
  };
}

function intersection(a: Range, b: Range): Range {
  return [Math.max(a[0], b[0]), Math.min(a[1], b[1])];
}

function distributionToLimits(value: Distribution) {
  const min = -0.18;
  const max = 1.18;
  let x: Range = [min, max];
  let y: Range = [min, max];

  for (const token of value.split("-")) {
    switch (token) {
      case "topmost":
        y = intersection(y, [-0.45, 0.02]);
        break;
      case "top":
        y = intersection(y, [min, 0.56]);
        break;
      case "bottom":
        y = intersection(y, [0.44, max]);
        break;
      case "left":
        x = intersection(x, [min, 0.56]);
        break;
      case "right":
        x = intersection(x, [0.44, max]);
        break;
      case "center":
        x = intersection(x, [0.22, 0.78]);
        y = intersection(y, [0.22, 0.78]);
        break;
      case "full":
        x = intersection(x, [0, 1]);
        y = intersection(y, [0, 1]);
        break;
      default:
        break;
    }
  }

  return { x, y };
}

function distanceSquared([x1, y1]: Point, [x2, y2]: Point) {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2;
}

function useMotion(key: string) {
  function generateMotion(): Motion {
    const limits = distributionToLimits(distribution.value);
    const rng = createRng(`${seed.value}-${currentSlideRoute.value.no}-${key}`);

    function randomBetween([a, b]: Range) {
      return rng() * (b - a) + a;
    }

    return {
      x: randomBetween(limits.x) * 30 - 15,
      y: randomBetween(limits.y) * 20 - 10,
      scale: 0.98 + rng() * 0.28,
      rotate: -7 + rng() * 14,
    };
  }

  const motion = ref<Motion>(generateMotion());

  watch(
    () => currentSlideRoute.value.no,
    () => {
      motion.value = generateMotion();
    },
  );

  return motion;
}

function usePoly(pointCount: number) {
  function generatePoints(): Point[] {
    const limits = distributionToLimits(distribution.value);
    const rng = createRng(`${seed.value}-${currentSlideRoute.value.no}-${pointCount}`);
    const overflow = 0.26;
    const disturbChance = 0.4;
    const disturb = 0.26;

    function randomBetween([a, b]: Range) {
      return rng() * (b - a) + a;
    }

    function offset(value: number) {
      const expanded = value * (1 + overflow * 2) - overflow;
      return rng() < disturbChance ? expanded + (rng() - 0.5) * disturb : expanded;
    }

    return Array.from({ length: pointCount }, () => [
      offset(randomBetween(limits.x)),
      offset(randomBetween(limits.y)),
    ]);
  }

  const points = ref<Point[]>(generatePoints());
  const polygon = computed(() =>
    points.value.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(", "),
  );

  function jumpPoints() {
    const next = [...generatePoints()];
    points.value = points.value.map((point) => {
      let index = 0;
      let best = Number.POSITIVE_INFINITY;
      for (let cursor = 0; cursor < next.length; cursor += 1) {
        const distance = distanceSquared(point, next[cursor]);
        if (distance < best) {
          best = distance;
          index = cursor;
        }
      }
      const [closest] = next.splice(index, 1);
      return closest;
    });
  }

  watch(
    () => currentSlideRoute.value.no,
    () => {
      jumpPoints();
    },
  );

  return polygon;
}

const poly1 = usePoly(12);
const poly2 = usePoly(8);
const poly3 = usePoly(5);
const motion1 = useMotion("primary");
const motion2 = useMotion("secondary");
const motion3 = useMotion("tertiary");
</script>

<template>
  <div
    class="space-glow-backdrop transform-gpu overflow-hidden pointer-events-none"
    :style="{ filter: `blur(76px) hue-rotate(${hue}deg)` }"
    aria-hidden="true"
  >
    <div
      class="space-glow-shape space-glow-primary"
      :style="{
        clipPath: `polygon(${poly1})`,
        opacity: opacity * 1.02,
        transform: `translate3d(${motion1.x}%, ${motion1.y}%, 0) scale(${motion1.scale}) rotate(${motion1.rotate}deg)`,
      }"
    />
    <div
      class="space-glow-shape space-glow-secondary"
      :style="{
        clipPath: `polygon(${poly2})`,
        opacity: opacity * 0.9,
        transform: `translate3d(${motion2.x}%, ${motion2.y}%, 0) scale(${motion2.scale}) rotate(${motion2.rotate}deg)`,
      }"
    />
    <div
      class="space-glow-shape space-glow-tertiary"
      :style="{
        clipPath: `polygon(${poly3})`,
        opacity: opacity * 0.54,
        transform: `translate3d(${motion3.x}%, ${motion3.y}%, 0) scale(${motion3.scale}) rotate(${motion3.rotate}deg)`,
      }"
    />
  </div>
</template>

<style scoped>
.space-glow-backdrop,
.space-glow-shape {
  transition:
    clip-path 2.5s ease,
    transform 2.9s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 2.2s ease,
    filter 2.2s ease;
}

.space-glow-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.space-glow-shape {
  position: absolute;
  inset: 0;
  aspect-ratio: 16 / 9;
  mix-blend-mode: screen;
}

.space-glow-primary {
  background:
    radial-gradient(ellipse at 30% 26%, rgba(210, 255, 244, 0.22), rgba(210, 255, 244, 0) 34%),
    linear-gradient(
      168deg,
      rgba(96, 255, 184, 0) 0%,
      rgba(96, 255, 184, 0.18) 14%,
      rgba(96, 255, 184, 0.92) 34%,
      rgba(74, 255, 213, 0.62) 58%,
      rgba(96, 255, 184, 0.1) 80%,
      rgba(96, 255, 184, 0) 100%
    );
}

.space-glow-secondary {
  background:
    radial-gradient(ellipse at 54% 30%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 28%),
    linear-gradient(
      176deg,
      rgba(92, 220, 255, 0) 0%,
      rgba(92, 220, 255, 0.16) 18%,
      rgba(92, 220, 255, 0.72) 38%,
      rgba(58, 134, 255, 0.54) 60%,
      rgba(92, 220, 255, 0.08) 82%,
      rgba(92, 220, 255, 0) 100%
    );
}

.space-glow-tertiary {
  background:
    radial-gradient(ellipse at 48% 24%, rgba(255, 222, 255, 0.14), rgba(255, 222, 255, 0) 26%),
    linear-gradient(
      162deg,
      rgba(210, 96, 255, 0) 0%,
      rgba(210, 96, 255, 0.18) 16%,
      rgba(210, 96, 255, 0.82) 34%,
      rgba(136, 88, 255, 0.62) 56%,
      rgba(210, 96, 255, 0.12) 78%,
      rgba(210, 96, 255, 0) 100%
    );
}
</style>
