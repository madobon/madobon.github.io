---
title: "Claude Code のチームエージェント機能で個人サイトのデザイン最適化をやってみた"
date: "2026-04-18T12:00:00+09:00"
slug: "team-agent-design-optimization"
summary: "Ollama + Claude Code のチームエージェント機能を使って、個人サイトの日本語タイポグラフィ最適化を並列処理で進めた開発体験記。tmux と chrome-devtools-mcp を使った検証ワークフローも公開。"
tags:
  - claude-code
  - team-agents
  - ollama
  - design
  - vue
---

# Claude Code のチームエージェント機能で個人サイトのデザイン最適化をやってみた

個人サイトを日本人向けに最適化する作業を、Claude Code のチームエージェント機能を使って進めてみた。

1 人で順番にやると 3 時間かかる作業を、並列処理で一気に進める──その開発体験が面白かったので記録しておく。

## 前提環境

今回の作業で使った環境は以下の通り。

### ハードウェア・OS

- macOS (Darwin 25.4.0)
- iTerm2 + tmux

### Claude Code の起動方法

Ollama 経由で Claude Code を起動している。`.claude/settings.json` は以下：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "ollama",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_BASE_URL": "http://localhost:11434",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "kimi-2.5:cloud",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "qwen3.5:cloud",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "gemma4:31b-cloud",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**重要**: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"` を有効にしないとチーム機能が使えない。

### iTerm2 + tmux の使い方

iTerm2 で Claude Code を使う際は、`tmux -CC` で起動するのがおすすめ。

```bash
tmux -CC
```

これで tmux 内でウィンドウを分割したり、セッションを維持したまま作業できる。

**重要な設定**: iTerm2 の tmux 設定で「Automatically bury the tmux client session after connecting」にチェックを入れておく。

これを有効にしておくと、tmux セッションを抜けたときにクライアントセッションが自動的に整理され、次回起動時にクリーンな状態で始められる。

## 依頼内容：個人サイトを日本人向けに最適化して

最初の依頼はシンプルだった。

> 個人サイトを日本人向けに見やすくして。現在のデザインはタイポグラフィもコピーも欧文向けすぎる。

具体的には：

- フォントを日本語対応に
- 行間・文字間を日本語向けに調整
- 英語コピーを日本語化
- 人間味のあるトーンに

## チーム編成：4 つの役割を用意

ここでチームエージェント機能を使うことにした。

4 つの役割（エージェント）を用意し、それぞれに専門性を割り当てる。

| エージェント名             | 役割                                   |
| -------------------------- | -------------------------------------- |
| `label-reviewer`           | 機能ラベルが英語で統一されているか確認 |
| `title-stylist`            | 見出しのサイズと行間を最適化           |
| `spacing-auditor`          | 余白と行間の一貫性をチェック           |
| `copy-consistency-checker` | コピーのトーンが統一されているか確認   |

## 並列処理で改善を進める

各エージェントが自分の役割に集中して作業する。

### title-stylist の仕事

見出しのサイズと行間を最適化した。

```css
/* src/style.css */
.hero-title {
  line-height: 1.15; /* 2 行見出しのバランス最適化 */
  letter-spacing: -0.01em; /* 日本語の文字詰め */
  font-size: clamp(1.75rem, 4vw, 2.8rem); /* 3.8rem → 2.8rem */
}
```

`line-height: 1.15` は、`<br>` で改行した 2 行見出しが「面」としてまとまって見えるように調整した値だ。

### spacing-auditor の仕事

ブログ記事の行間を最適化した。

```css
.blog-prose {
  line-height: clamp(1.8, 0.2vw + 1.72, 1.9);
  margin-bottom: 1.6rem;
}
```

日本語は縦の空間を多く必要とする。`1.5` だと詰まって見えるため、`1.75` 前後まで引き上げた。

### copy-consistency-checker の仕事

コピーのトーンを統一した。

```vue
<!-- HomePage.vue -->
<p class="eyebrow">ぼちぼち更新中の個人サイト</p>
<h1 class="hero-title">考えたこと、作ったもの、<br>試行錯誤の記録をここに。</h1>
```

「ぼちぼち」「ゆるく」「心地よい」──こうした言葉で、堅すぎないトーンを演出。

### label-reviewer の仕事

機能ラベルが英語で統一されているか確認した。

ここで重要なデザイン原則が見つかった。

> **機能ラベル（タグ、モード）は英語のまま。タイトルとメッセージは日本語で。**

```typescript
// ProjectsPage.vue
const projectModes = [
  "Public experiments", // 英語のまま
  "Small utilities",
  "Long-lived archive",
];
```

## chrome-devtools-mcp で実機検証

もう 1 つ重要なツールが、chrome-devtools-mcp だ。

これを使うと、Claude Code から直接 Chrome DevTools を操作できる。

```bash
# ブラウザを開いて確認
navigate_page: "http://localhost:5173/"

# スクリーンショットを撮影
take_screenshot

# コンソールエラーを確認
list_console_messages
```

「タイトルが大きくない？」というフィードバックも、実際にブラウザで表示を見ながら即座に判断できた。

## チームエージェントのメリット

実際に使ってみて感じたメリットは 3 つある。

### 1. 並列処理で高速化

1 人が順番にやると：

- フォント選定 → 30 分
- コピー推敲 → 60 分
- CSS 調整 → 60 分
- 検証 → 30 分
- **合計：3 時間**

チームエージェントなら：

- 4 エージェントが並列で作業
- **実質 1 時間で完了**

### 2. 専門性の集中

各エージェントが自分の役割に集中できる。

- title-stylist はタイポグラフィだけ
- copy-consistency-checker はコピーだけ

この「役割の絞り込み」が、作業の質を上げる。

### 3. 客観的なレビュー

自分で書いたコピーを自分でチェックするのと、他人（エージェント）にチェックしてもらうのでは、発見が変わる。

「この表現、ちょっと硬くない？」「ここ、トーンが揃ってないよ」といった指摘が来る。

## tmux の使い方：実際のワークフロー

iTerm2 での実際のワークフローは以下の通り。

```bash
# 1. tmux セッション開始
tmux -CC

# 2. ペイン分割（Ctrl+% で縦分割）
# 左：Claude Code
# 右：開発サーバー (pnpm dev)

# 3. 別ウィンドウ（Ctrl+C で新規作成）
# ウィンドウ 1：メイン作業
# ウィンドウ 2：chrome-devtools 用
# ウィンドウ 3：ログ確認用
```

この構成で、チームエージェントの進行状況を確認しながら、並行して開発サーバーも監視できる。

## 成果：3 時間でこれだけ変わった

| 要素                     | 変更前         | 変更後                       |
| ------------------------ | -------------- | ---------------------------- |
| フォント                 | 欧文優先       | 日本語フォント優先           |
| 本文行間                 | 1.5            | 1.75                         |
| 見出し行間               | 1.25           | 1.15                         |
| タイトルサイズ           | 最大 3.8rem    | 最大 2.8rem                  |
| コピー                   | 英語           | 日本語（人間味のあるトーン） |
| 機能ラベル               | 日本語化検討   | 英語のまま                   |
| マイクロインタラクション | 標準イージング | cubic-bezier で有機的に      |

## 気づき：チームエージェントは「並列思考」のツール

チームエージェント機能を使ってみて、これが「並列思考のツール」だと感じた。

1 人で考えると：

- フォントを変えたら、次はコピー
- コピーを変えたら、次は余白

この「直列処理」になる。

チームエージェントなら：

- フォント、コピー、余白、全部同時に

この「並列処理」ができる。

## まとめ：チームエージェントは使える

結論から言うと、チームエージェント機能は実用的だ。

特に以下のような作業に効果的だと思う。

- **デザインレビュー**: 複数の視点から同時にチェック
- **リファクタリング**: 機能ごとに担当を分けて並列処理
- **ドキュメント執筆**: 構成、文章、コード例を別エージェントで

設定は `.claude/settings.json` に `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"` を追加するだけ。

iTerm2 なら `tmux -CC` で始めて、複数ウィンドウを活用するのがおすすめ。

---

**関連リンク**

- [サイトトップ](/)
- [ブログ一覧](/blog/)
- [Claude Code チーム機能ドキュメント](https://github.com/anthropics/claude-code)
