---
title: "Vue 3 でドロップダウンナビゲーションと家庭菜園ページを実装した"
date: "2026-04-19T12:00:00+09:00"
slug: "garden-page-dropdown-nav"
summary: "個人サイトに家庭菜園の記録ページを追加。Vue 3 + TypeScript でドロップダウンメニューとガントチャート形式の年間スケジュールを実装した。"
tags:
  - vue
  - typescript
  - web-design
  - garden
---

# Vue 3 でドロップダウンナビゲーションと家庭菜園ページを実装した

個人サイトに新しいページを追加した。

- **家庭菜園の記録ページ** (`/garden/`)
- **ドロップダウンナビゲーション**（Projects メニュー）

今回は、実装内容と技術的なポイントを記録しておく。

## 実装した機能

### 1. 家庭菜園ページ

季節の野菜を育てる記録をまとめるページ。

- 栽培中の野菜一覧（ステータスバッジ付き）
- 年間栽培スケジュール（ガントチャート形式）
- 月別作業詳細カード

### 2. ドロップダウンナビゲーション

Projects メニューをクリックすると、サブメニューが展開される。

- 「Projects」と「Garden」をサブメニューとして配置
- クリック外で閉じる機能
- 矢印アイコンの回転アニメーション

## 技術的な実装

### ドロップダウンメニューの構造

```vue
<!-- App.vue -->
<div
  v-if="item.children"
  ref="dropdownRef"
  class="nav-dropdown"
  :class="{ 'is-open': isProjectsOpen }"
  @click.stop
>
  <button
    class="nav-link nav-dropdown-toggle"
    @click.stop="toggleDropdown"
  >
    {{ item.label }}
    <svg class="dropdown-arrow" viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>
  <div
    v-show="isProjectsOpen"
    class="nav-dropdown-content"
    :style="dropdownPosition && { top: dropdownPosition.top + 'px' }"
  >
    <a
      v-for="child in item.children"
      :key="child.href"
      :href="child.href"
      class="nav-dropdown-item"
    >
      {{ child.label }}
    </a>
  </div>
</div>
```

### ポジショニングの計算

ドロップダウンメニューの位置は、ボタンの `getBoundingClientRect()` で動的に計算する。

```typescript
const updateDropdownPosition = () => {
  if (dropdownRef.value && isProjectsOpen.value) {
    const rect = dropdownRef.value.getBoundingClientRect();
    dropdownPosition.value = {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    };
  }
};
```

**スクロール対応**: `window.scrollY` を加算することで、スクロールしてもメニューが正しい位置に表示される。

### クリック外で閉じる

```typescript
const closeDropdown = () => {
  isProjectsOpen.value = false;
};

onMounted(() => {
  window.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener("click", closeDropdown);
});
```

**注意点**: `@click.stop` をドロップダウン要素に設定し、イベントバブリングを防止。

### ガントチャートの実装

年間栽培スケジュールは CSS Grid で実装。

```vue
<div class="gantt-timeline">
  <div v-for="m in months" :key="m" class="gantt-month">{{ m }}</div>
</div>

<div
  :class="['gantt-bar', getTaskColor(task.type)]"
  :style="getTaskStyle(task.start, task.end)"
>
  {{ task.type }}
</div>
```

```typescript
const getTaskStyle = (start: [number, number], end: [number, number]) => {
  const startMonth = start[1] - 1;
  const endMonth = end[1] - 1;
  return {
    gridColumnStart: startMonth + 1,
    gridColumnEnd: endMonth + 2,
  };
};
```

### ステータスバッジ

栽培状況を色分けして表示。

```vue
<span :class="['status-badge', getStatusClass(vegetable.status)]">
  {{ vegetable.status }}
</span>
```

```css
.status-nursery {
  background: #fef3c7;
  color: #92400e;
}

.status-planted {
  background: #dbeafe;
  color: #1e40af;
}

.status-harvest {
  background: #dcfce7;
  color: #166534;
}
```

## 栽培データの構造

```typescript
const growingVegetables = [
  {
    name: "トマト",
    variety: "中玉トマト",
    startDate: "2026-05-10",
    status: "育苗中",
    notes: "雨除け栽培予定",
  },
  // ...
];

const vegetableGantt = [
  { name: "トマト", section: "夏野菜", start: [2026, 3], end: [2026, 4], type: "育苗" },
  { name: "トマト", section: "夏野菜", start: [2026, 5], end: [2026, 9], type: "収穫" },
  // ...
];
```

## 月別スケジュール

```typescript
const scheduleByMonth = [
  { month: 1, label: "1 月", tasks: ["堆肥入れ", "畝作り", "来年計画"] },
  { month: 5, label: "5 月", tasks: ["夏野菜定植", "雨除け設置", "きゅうりネット"] },
  // ...
];
```

## Responsive Design

640px 未満でレイアウトを最適化。

```css
@media (max-width: 640px) {
  .cards-grid,
  .schedule-grid {
    grid-template-columns: 1fr;
  }

  .gantt-chart {
    overflow-x: auto;
  }

  .gantt-header,
  .gantt-row {
    grid-template-columns: 100px 1fr;
    min-width: 600px;
  }
}
```

## 課題と今後の改善

### 現在の課題

1. **ハードコードされたデータ**: 栽培データはハードコードされているため、外部データソースから読み込むようにしたい。
2. **年の切り替え**: 2026 年固定なので、複数年度に対応できるようにする必要がある。

### 今後の改善案

- 栽培記録の追加・編集機能
- 収穫量の記録
- 写真のアップロード
- 前年との比較表示

## まとめ

Vue 3 + TypeScript で、ドロップダウンメニューとガントチャート形式のスケジュールを実装した。

- ドロップダウンは `position: fixed` でスクロール対応
- ガントチャートは CSS Grid で柔軟なレイアウト
- ステータスバッジで視覚的なフィードバック

家庭菜園の記録は、季節の移り変わりとともに更新していく予定だ。

---

**関連リンク**

- [家庭菜園ページ](/garden/)
- [プロジェクト一覧](/projects/)
- [ブログ一覧](/blog/)
