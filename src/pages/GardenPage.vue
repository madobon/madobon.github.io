<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import mermaid from "mermaid";

// 栽培中の野菜
const growingVegetables = [
  {
    name: "トマト",
    variety: "中玉トマト",
    startDate: "2026-05-10",
    status: "育苗中",
    notes: "雨除け栽培予定",
  },
  {
    name: "きゅうり",
    variety: "節成りきゅうり",
    startDate: "2026-05-15",
    status: "定植待ち",
    notes: "ネット張り予定",
  },
  {
    name: "なす",
    variety: "黒陽",
    startDate: "2026-05-10",
    status: "育苗中",
    notes: "接ぎ木苗",
  },
  {
    name: "ピーマン",
    variety: "京緑",
    startDate: "2026-05-10",
    status: "育苗中",
    notes: "",
  },
  {
    name: "オクラ",
    variety: "アーリーセブン",
    startDate: "2026-05-20",
    status: "直播き",
    notes: "発芽待ち",
  },
  {
    name: "枝豆",
    variety: "湯あがり娘",
    startDate: "2026-06-01",
    status: "直播き",
    notes: "2 回に分けて播種",
  },
  {
    name: "ししとう",
    variety: "",
    startDate: "2026-05-15",
    status: "定植済み",
    notes: "収穫開始",
  },
];

// 月別スケジュール
const monthlySchedule = [
  {
    month: 1,
    label: "1 月",
    tasks: ["種まき：なし", "収穫：大根、白菜、人参", "作業：堆肥入れ、畝作り"],
  },
  {
    month: 2,
    label: "2 月",
    tasks: ["種まき：なし", "収穫：大根、白菜、人参", "作業：堆肥入れ、畝作り"],
  },
  {
    month: 3,
    label: "3 月",
    tasks: ["種まき：レタス、キャベツ", "収穫：大根、白菜", "作業：畝作り、マルチ張り"],
  },
  {
    month: 4,
    label: "4 月",
    tasks: ["種まき：トマト、ナス、ピーマン（育苗）", "収穫：レタス、春菊", "作業：定植準備"],
  },
  {
    month: 5,
    label: "5 月",
    tasks: ["種まき：きゅうり、オクラ、枝豆", "収穫：レタス、エンドウ", "作業：定植、雨除け設置"],
  },
  {
    month: 6,
    label: "6 月",
    tasks: ["種まき：なし", "収穫：きゅうり、トマト、ナス", "作業：追肥、誘引、剪定"],
  },
  {
    month: 7,
    label: "7 月",
    tasks: ["種まき：なし", "収穫：トマト、きゅうり、ナス、オクラ", "作業：水やり、収穫"],
  },
  {
    month: 8,
    label: "8 月",
    tasks: ["種まき：なし", "収穫：トマト、きゅうり、ナス、オクラ", "作業：水やり、収穫"],
  },
  {
    month: 9,
    label: "9 月",
    tasks: ["種まき：白菜、キャベツ、大根", "収穫：ナス、きゅうり", "作業：秋野菜定植"],
  },
  {
    month: 10,
    label: "10 月",
    tasks: ["種まき：なし", "収穫：大根、白菜、人参", "作業：収穫、保存処理"],
  },
  {
    month: 11,
    label: "11 月",
    tasks: ["種まき：なし", "収穫：大根、白菜、人参", "作業：片付け、堆肥入れ"],
  },
  {
    month: 12,
    label: "12 月",
    tasks: ["種まき：なし", "収穫：大根、白菜、人参", "作業：片付け、来年計画"],
  },
];

const currentMonth = new Date().getMonth() + 1;

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    育苗中: "status-nursery",
    定植済み: "status-planted",
    収穫中: "status-harvest",
    直播き: "status-direct",
    定植待ち: "status-waiting",
    発芽待ち: "status-sprout",
  };
  return map[status] || "";
};

// 野菜の栽培データ（ガントチャート用）- 野菜ごとに行を分けて表示
const vegetableGantt = [
  { name: "レタス", section: "春野菜", start: [2026, 2], end: [2026, 4], type: "育苗" },
  { name: "レタス", section: "春野菜", start: [2026, 3], end: [2026, 5], type: "収穫" },
  { name: "キャベツ", section: "春野菜", start: [2026, 2], end: [2026, 4], type: "育苗" },
  { name: "キャベツ", section: "春野菜", start: [2026, 10], end: [2026, 12], type: "収穫" },
  { name: "春菊", section: "春野菜", start: [2026, 3], end: [2026, 5], type: "収穫" },
  { name: "エンドウ", section: "春野菜", start: [2026, 4], end: [2026, 5], type: "収穫" },
  { name: "小松菜", section: "春野菜", start: [2026, 3], end: [2026, 5], type: "収穫" },
  { name: "スイスチャード", section: "春野菜", start: [2026, 3], end: [2026, 5], type: "育苗" },
  { name: "スイスチャード", section: "春野菜", start: [2026, 5], end: [2026, 10], type: "収穫" },
  { name: "トマト", section: "夏野菜", start: [2026, 3], end: [2026, 4], type: "育苗" },
  { name: "トマト", section: "夏野菜", start: [2026, 5], end: [2026, 9], type: "収穫" },
  { name: "ナス", section: "夏野菜", start: [2026, 3], end: [2026, 4], type: "育苗" },
  { name: "ナス", section: "夏野菜", start: [2026, 5], end: [2026, 9], type: "収穫" },
  { name: "ピーマン", section: "夏野菜", start: [2026, 3], end: [2026, 4], type: "育苗" },
  { name: "ピーマン", section: "夏野菜", start: [2026, 5], end: [2026, 9], type: "収穫" },
  { name: "きゅうり", section: "夏野菜", start: [2026, 4], end: [2026, 5], type: "育苗" },
  { name: "きゅうり", section: "夏野菜", start: [2026, 5], end: [2026, 8], type: "収穫" },
  { name: "オクラ", section: "夏野菜", start: [2026, 4], end: [2026, 5], type: "育苗" },
  { name: "オクラ", section: "夏野菜", start: [2026, 6], end: [2026, 9], type: "収穫" },
  { name: "枝豆", section: "夏野菜", start: [2026, 5], end: [2026, 8], type: "収穫" },
  { name: "ししとう", section: "夏野菜", start: [2026, 5], end: [2026, 9], type: "収穫" },
  { name: "ゴーヤ", section: "夏野菜", start: [2026, 4], end: [2026, 5], type: "育苗" },
  { name: "ゴーヤ", section: "夏野菜", start: [2026, 6], end: [2026, 9], type: "収穫" },
  { name: "ブロッコリー", section: "秋野菜", start: [2026, 7], end: [2026, 8], type: "育苗" },
  { name: "ブロッコリー", section: "秋野菜", start: [2026, 8], end: [2026, 11], type: "収穫" },
  { name: "白菜", section: "秋野菜", start: [2026, 8], end: [2026, 9], type: "育苗" },
  { name: "白菜", section: "秋野菜", start: [2026, 9], end: [2026, 12], type: "収穫" },
  { name: "大根", section: "秋野菜", start: [2026, 8], end: [2026, 9], type: "育苗" },
  { name: "大根", section: "秋野菜", start: [2026, 9], end: [2026, 11], type: "収穫" },
  { name: "人参", section: "秋野菜", start: [2026, 8], end: [2026, 9], type: "育苗" },
  { name: "人参", section: "秋野菜", start: [2026, 10], end: [2026, 12], type: "収穫" },
  { name: "小松菜", section: "秋野菜", start: [2026, 9], end: [2026, 11], type: "収穫" },
];

// 月別スケジュール（簡易表示用）
const scheduleByMonth = [
  { month: 1, label: "1 月", icon: "❄️", season: "冬", tasks: ["堆肥入れ", "畝作り", "来年計画"] },
  { month: 2, label: "2 月", icon: "❄️", season: "冬", tasks: ["堆肥入れ", "畝作り", "種苗注文"] },
  {
    month: 3,
    label: "3 月",
    icon: "🌱",
    season: "春",
    tasks: ["レタス育苗", "キャベツ育苗", "マルチ張り"],
  },
  {
    month: 4,
    label: "4 月",
    icon: "🌱",
    season: "春",
    tasks: ["トマト育苗", "ナス育苗", "定植準備"],
  },
  {
    month: 5,
    label: "5 月",
    icon: "🌱",
    season: "春",
    tasks: ["夏野菜定植", "雨除け設置", "きゅうりネット"],
  },
  {
    month: 6,
    label: "6 月",
    icon: "☀️",
    season: "夏",
    tasks: ["追肥", "誘引", "剪定", "梅雨対策"],
  },
  { month: 7, label: "7 月", icon: "☀️", season: "夏", tasks: ["水やり", "収穫", "病害虫対策"] },
  { month: 8, label: "8 月", icon: "☀️", season: "夏", tasks: ["水やり", "収穫", "秋野菜育苗"] },
  { month: 9, label: "9 月", icon: "🍂", season: "秋", tasks: ["秋野菜定植", "収穫", "片付け"] },
  { month: 10, label: "10 月", icon: "🍂", season: "秋", tasks: ["収穫", "保存処理", "片付け"] },
  { month: 11, label: "11 月", icon: "🍂", season: "秋", tasks: ["収穫", "片付け", "堆肥入れ"] },
  {
    month: 12,
    label: "12 月",
    icon: "❄️",
    season: "冬",
    tasks: ["片付け", "来年計画", "道具手入れ"],
  },
];

// 季節の色定義
const seasonColors: Record<string, { bg: string; border: string; text: string }> = {
  春: { bg: "rgba(134, 239, 172, 0.1)", border: "rgba(134, 239, 172, 0.3)", text: "#86efac" },
  夏: { bg: "rgba(254, 202, 214, 0.1)", border: "rgba(254, 202, 214, 0.3)", text: "#feca8a" },
  秋: { bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.3)", text: "#fbbf24" },
  冬: { bg: "rgba(147, 197, 253, 0.1)", border: "rgba(147, 197, 253, 0.3)", text: "#93c5fd" },
};

// ガントチャートのレンダリング用
const months = [
  "1 月",
  "2 月",
  "3 月",
  "4 月",
  "5 月",
  "6 月",
  "7 月",
  "8 月",
  "9 月",
  "10 月",
  "11 月",
  "12 月",
];

const getTaskColor = (type: string) => {
  const map: Record<string, string> = {
    育苗: "task-nursery",
    収穫: "task-harvest",
  };
  return map[type] || "";
};

const getTaskStyle = (start: [number, number], end: [number, number]) => {
  const startMonth = start[1] - 1; // 0-indexed (1 月=0)
  const endMonth = end[1] - 1;
  const duration = endMonth - startMonth + 1;
  // グリッドのセル番号で指定（1 始まり）
  const gridColumnStart = startMonth + 1;
  const gridColumnEnd = endMonth + 2; // end は含むので +2
  return {
    gridColumnStart,
    gridColumnEnd,
  };
};

const getSeasonStyle = (season: string) => {
  const colors = seasonColors[season] || seasonColors["春"];
  return {
    "--season-bg": colors.bg,
    "--season-border": colors.border,
    "--season-text": colors.text,
  };
};

// セクションごとにグループ化
const groupedBySection = Object.groupBy(vegetableGantt, (v) => v.section);

// セクション内で野菜名を管理し、2 回目以降のフラグとグループ最後のフラグを付与
const getTasksWithDuplicateFlag = (tasks: typeof vegetableGantt) => {
  const nameCount = new Map<string, number>();
  return tasks.map((task, idx) => {
    const count = nameCount.get(task.name) || 0;
    nameCount.set(task.name, count + 1);
    // 次の行と野菜名が違う場合はグループの最後
    const isLastInGroup = idx === tasks.length - 1 || tasks[idx + 1].name !== task.name;
    return {
      ...task,
      isDuplicate: count > 0,
      isLastInGroup,
    };
  });
};
</script>

<template>
  <div class="page-stack">
    <section class="page-heading page-heading-split">
      <div>
        <p class="eyebrow">Garden</p>
        <h1>家庭菜園の記録</h1>
        <p>
          季節の野菜を育てる、小さな庭仕事の記録。年間スケジュールと栽培中の野菜をまとめています。
        </p>
      </div>

      <div class="tag-cloud" aria-label="garden info">
        <span class="signal-pill">2026 年シーズン</span>
        <span class="signal-pill">無農薬栽培</span>
      </div>
    </section>

    <!-- 栽培中の野菜 -->
    <section class="garden-section">
      <h2 class="section-title">栽培中の野菜</h2>
      <div class="grid cards-grid">
        <article
          v-for="vegetable in growingVegetables"
          :key="vegetable.name + vegetable.startDate"
          class="card vegetable-card"
        >
          <div class="vegetable-header">
            <h3>{{ vegetable.name }}</h3>
            <span :class="['status-badge', getStatusClass(vegetable.status)]">
              {{ vegetable.status }}
            </span>
          </div>
          <p v-if="vegetable.variety" class="vegetable-variety">{{ vegetable.variety }}</p>
          <p class="vegetable-date">
            <span class="label">開始：</span>
            <time :datetime="vegetable.startDate">{{ vegetable.startDate }}</time>
          </p>
          <p v-if="vegetable.notes" class="vegetable-notes">{{ vegetable.notes }}</p>
        </article>
      </div>
    </section>

    <!-- ガントチャート -->
    <section class="garden-section">
      <h2 class="section-title">年間栽培スケジュール</h2>
      <div class="gantt-chart">
        <!-- 月ヘッダー -->
        <div class="gantt-header">
          <div class="gantt-label">野菜</div>
          <div class="gantt-timeline">
            <div v-for="m in months" :key="m" class="gantt-month">{{ m }}</div>
          </div>
        </div>

        <!-- 春野菜 -->
        <div v-if="groupedBySection['春野菜']" class="gantt-section">
          <div class="gantt-section-title"><span class="section-icon">🌱</span> 春野菜</div>
          <div
            v-for="(task, index) in getTasksWithDuplicateFlag(groupedBySection['春野菜'])"
            :key="task.name + task.type + task.start + index"
            :class="['gantt-row', { 'group-border': task.isLastInGroup }]"
          >
            <div :class="['gantt-row-label', { 'is-duplicate': task.isDuplicate }]">
              {{ task.name }}
            </div>
            <div class="gantt-timeline">
              <div
                :class="['gantt-bar', getTaskColor(task.type)]"
                :style="getTaskStyle(task.start, task.end)"
              >
                {{ task.type }}
              </div>
            </div>
          </div>
        </div>

        <!-- 夏野菜 -->
        <div v-if="groupedBySection['夏野菜']" class="gantt-section">
          <div class="gantt-section-title"><span class="section-icon">☀️</span> 夏野菜</div>
          <div
            v-for="(task, index) in getTasksWithDuplicateFlag(groupedBySection['夏野菜'])"
            :key="task.name + task.type + task.start + index"
            :class="['gantt-row', { 'group-border': task.isLastInGroup }]"
          >
            <div :class="['gantt-row-label', { 'is-duplicate': task.isDuplicate }]">
              {{ task.name }}
            </div>
            <div class="gantt-timeline">
              <div
                :class="['gantt-bar', getTaskColor(task.type)]"
                :style="getTaskStyle(task.start, task.end)"
              >
                {{ task.type }}
              </div>
            </div>
          </div>
        </div>

        <!-- 秋野菜 -->
        <div v-if="groupedBySection['秋野菜']" class="gantt-section">
          <div class="gantt-section-title"><span class="section-icon">🍂</span> 秋野菜</div>
          <div
            v-for="(task, index) in getTasksWithDuplicateFlag(groupedBySection['秋野菜'])"
            :key="task.name + task.type + task.start + index"
            :class="['gantt-row', { 'group-border': task.isLastInGroup }]"
          >
            <div :class="['gantt-row-label', { 'is-duplicate': task.isDuplicate }]">
              {{ task.name }}
            </div>
            <div class="gantt-timeline">
              <div
                :class="['gantt-bar', getTaskColor(task.type)]"
                :style="getTaskStyle(task.start, task.end)"
              >
                {{ task.type }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 月別スケジュール -->
    <section class="garden-section">
      <h2 class="section-title">月別作業詳細</h2>
      <div class="schedule-grid">
        <div
          v-for="month in scheduleByMonth"
          :key="month.month"
          :class="['schedule-card', { 'current-month': month.month === currentMonth }]"
          :style="getSeasonStyle(month.season)"
        >
          <div class="schedule-header">
            <span class="month-icon">{{ month.icon }}</span>
            <div class="schedule-title-group">
              <h3 class="schedule-month">{{ month.label }}</h3>
              <span :class="['season-badge', 'season-' + month.season]">{{ month.season }}</span>
            </div>
          </div>
          <ul class="schedule-tasks">
            <li v-for="task in month.tasks" :key="task" class="task-item">
              <span class="task-bullet"></span>
              {{ task }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-stack {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-heading {
  margin-bottom: 3rem;
}

.page-heading h1 {
  font-size: 2rem;
  margin: 0.5rem 0;
}

.page-heading p {
  color: var(--text-muted);
  line-height: 1.6;
}

.garden-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--accent);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vegetable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.vegetable-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
}

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

.status-direct {
  background: #fee2e2;
  color: #991b1b;
}

.status-waiting {
  background: #e0e7ff;
  color: #3730a3;
}

.status-sprout {
  background: #f3e8ff;
  color: #6b21a8;
}

.vegetable-variety {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.vegetable-date {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.vegetable-date .label {
  color: var(--text-muted);
}

.vegetable-notes {
  font-size: 0.875rem;
  background: var(--bg-secondary);
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  margin-top: 0.75rem;
}

/* ガントチャート */
.gantt-chart {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.gantt-header {
  display: grid;
  grid-template-columns: 120px 1fr;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.gantt-label {
  padding: 0.75rem 1rem;
  font-weight: 600;
  border-right: 1px solid var(--border);
}

.gantt-timeline {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1px;
  background: var(--border);
}

.gantt-month {
  padding: 0.5rem 0.25rem;
  font-size: 0.75rem;
  text-align: center;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
}

.gantt-section {
  border-bottom: 1px solid var(--border);
}

.gantt-section:last-child {
  border-bottom: none;
}

.gantt-section-title {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  font-size: 1.25rem;
}

.gantt-section:nth-of-type(1) .gantt-section-title {
  color: #86efac;
  background: rgba(134, 239, 172, 0.08);
  border-bottom: 1px solid rgba(134, 239, 172, 0.2);
}

.gantt-section:nth-of-type(2) .gantt-section-title {
  color: #feca8a;
  background: rgba(254, 202, 214, 0.08);
  border-bottom: 1px solid rgba(254, 202, 214, 0.2);
}

.gantt-section:nth-of-type(3) .gantt-section-title {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.08);
  border-bottom: 1px solid rgba(251, 191, 36, 0.2);
}

.gantt-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  border-bottom: 1px dashed var(--line);
}

.gantt-row:last-child {
  border-bottom: none;
}

/* 野菜の区切り（次の行と野菜名が違う場合） */
.gantt-row.group-border {
  border-bottom: 2px solid var(--line);
}

.gantt-row-label {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-right: 1px solid var(--border);
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.gantt-row-label.is-duplicate {
  color: var(--muted);
  opacity: 0.7;
}

.gantt-row .gantt-timeline {
  background: transparent;
  padding: 0.5rem;
}

.gantt-bar {
  height: 24px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.gantt-bar:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.task-nursery {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.task-harvest {
  background: linear-gradient(135deg, #dcfce7 0%, #86efac 100%);
  color: #166534;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.schedule-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.schedule-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--season-border);
  opacity: 0.7;
}

.schedule-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  border-color: var(--season-border);
}

.schedule-card.current-month {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
  background: linear-gradient(135deg, var(--card-bg) 0%, rgba(114, 219, 255, 0.05) 100%);
}

.schedule-card.current-month::before {
  height: 4px;
  opacity: 1;
}

.schedule-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.month-icon {
  font-size: 2rem;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.schedule-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.schedule-month {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: var(--text);
}

.season-badge {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  display: inline-block;
  width: fit-content;
}

.season-春 {
  background: rgba(134, 239, 172, 0.15);
  color: #86efac;
}

.season-夏 {
  background: rgba(254, 202, 214, 0.15);
  color: #feca8a;
}

.season-秋 {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.season-冬 {
  background: rgba(147, 197, 253, 0.15);
  color: #93c5fd;
}

.schedule-tasks {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  font-size: 0.8125rem;
  padding: 0.5rem 0;
  line-height: 1.5;
  color: var(--text-muted);
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.task-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--season-border);
  margin-top: 0.375rem;
  flex-shrink: 0;
}

.task-item:not(:last-child) {
  border-bottom: 1px dashed var(--border);
}

@media (max-width: 640px) {
  .page-stack {
    padding: 1.5rem 1rem;
  }

  .page-heading h1 {
    font-size: 1.5rem;
  }

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

  .gantt-month {
    font-size: 0.65rem;
    padding: 0.5rem 0.1rem;
  }

  .gantt-bar {
    font-size: 0.65rem;
  }
}
</style>
