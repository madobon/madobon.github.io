---
title: "Hermes Agent と Claude Code の違いを深く調べてみた"
date: "2026-05-30T07:54:00+09:00"
slug: "hermes-agent-vs-claude-code-comparison"
summary: "Hermes Agent（v0.10.0）と Claude Code（v2.1.157）を実際のコマンドやドキュメント、ソース構成から詳しく比較。モデル対応、スキル・メモリの仕組み、エージェント連携、統合範囲などを掘り下げた。"
tags:
  - hermes
  - claude-code
  - ai-agent
  - comparison
  - deep-dive
---

# Hermes Agent と Claude Code の違いを深く調べてみた

ターミナル上で自然言語からコード編集やコマンド実行、自動化まで任せられる AI エージェントが増えている。今回は **Hermes Agent**（v0.10.0）と **Claude Code**（v2.1.157）を、実際の CLI 出力や公式ドキュメント、ソース構成から詳しく比較してみた。

## まず前提：両者の位置づけが根本的に違う

**Claude Code** は Anthropic が公式に提供する「コーディングに特化したプロプライエタリツール」。Node.js 製で、公式インストーラや Homebrew、WinGet からインストールできる。利用には Claude サブスクリプションまたは Anthropic Console/API キーが必要だ。

**Hermes Agent** は Python 製のオープンソース系ツール（`~/.hermes/` にインストールされる構成）。複数の推論プロバイダー（Ollama、OpenAI、Kimi、MiniMax、Anthropic など）を切り替えて使えるフレキシブルな設計が特徴だ。

この「誰が作っているか・どのモデルを使うか」という前提の違いが、後述する機能差の根源になっている。

## 比較表

| 項目             | Claude Code                      | Hermes Agent                                                                |
| ---------------- | -------------------------------- | --------------------------------------------------------------------------- |
| **提供元**       | Anthropic（公式）                | コミュニティ/オープンソース                                                 |
| **ベース言語**   | Node.js                          | Python 3.11                                                                 |
| **インストール** | install.sh、Homebrew、WinGet     | pip/スクリプト（`~/.hermes/`）                                              |
| **モデル対応**   | Claude 3.5/4 系（公式）          | 10+ プロバイダー（Ollama、OpenAI、Kimi、MiniMax、Z.AI/GLM、Anthropic など） |
| **料金形態**     | サブスクリプション or API 課金   | オープンソース（モデル側の課金は別）                                        |
| **メイン用途**   | コードベース理解・編集・git 連携 | コーディング + ブラウザ + 自動化 + メッセージング統合                       |

## スキル・メモリ・学習の仕組み

### Claude Code: `.claude/` ディレクトリ方式

Claude Code はプロジェクト内の `.claude/` ディレクトリに設定やメモリを保存する方式を採用している。

- `.claude/commands/` ... プロジェクト固有のスラッシュコマンドを定義
- `.claude/skills/` ... プラグインとして自動ロードされるスキル（v2.1.157 で `.claude/skills` ディレクトリが自動ロード対象に追加された）
- `.claude/CLAUDE.md` ... プロジェクトへの指示を記述
- メモリ: `/memory` コマンドで会話間の情報を保持（設定ファイルベース）

これらは基本的に**プロジェクト単位**で閉じている。リポジトリをまたいだスキル継承は限定的だ。

### Hermes Agent: `~/.hermes/skills/` + `memory` ツール

Hermes Agent はグローバルなスキルストレージを持つ。

- `~/.hermes/skills/` ... YAML frontmatter + Markdown 形式でスキルを保存
- `memory` ツール ... `user`（ユーザープロフィール）と `memory`（環境・手順）の2種類を永続化
- `session_search` ... 過去の全セッションを全文検索で横断検索

スキルは**セッションをまたいで再利用**される。タスクが成功すると「この手順をスキルとして保存するか？」と提案してくる仕組みがある。これは長期間にわたる自動化で大きな差になる。

## エージェント連携・サブエージェント

### Claude Code: `claude agents` と Dynamic Workflows

Claude Code は「`claude agents`」というサブエージェント管理機能を持つ。

- `claude agents` でバックグラウンドセッションを一覧表示・管理
- `! <command>` でバックグラウンドセッションを起動
- **Dynamic Workflows**（v2.1.154 導入）... 数十〜数百のエージェントをバックグラウンドで連携させ、大規模タスクを並列処理
- `--resume` でセッション復帰、worktree 単位で分離

これらは主に**同一コードベース内での並列作業**を想定している。エージェント間の連携は Claude 生態系内で完結する。

### Hermes Agent: `delegate_task` + マルチエージェント統合

Hermes Agent の `delegate_task` は、**異なるエージェントを子プロセスとして起動**できる。

- Claude Code を子エージェントとして起動・連携可能
- OpenAI Codex、OpenCode なども子として使える
- 各子エージェントは独立したコンテキストで動作し、結果だけ親に報告

これは「Hermes が統括者となって、専門エージェントに作業を割り当てる」オーケストレーションの形を取れる。マルチベンダー環境での統合に強い。

## ツールセットの違い

### Claude Code: コーディングツールに集中

Claude Code のツールは基本的に開発サイクルを閉じることに集中している。

| ツール | 用途                             |
| ------ | -------------------------------- |
| Bash   | サンドボックス化されたシェル実行 |
| Edit   | ファイル編集（diff 方式）        |
| View   | ファイル/ディレクトリ閲覧        |
| Linter | コード品質チェック               |
| MCP    | 外部ツール連携                   |
| Chrome | ブラウザ連携（拡張機能経由）     |
| Git    | commit、diff、status など        |
| GitHub | PR 作成、レビュー、@claude タグ  |

最近の CHANGELOG からは「Browser Use（Chrome 連携）」や「Computer Use（プレビュー）」が追加されているが、基本姿勢は「コーディング支援」にある。

### Hermes Agent: 汎用ツールチェイン

Hermes Agent は開発以外のツールもネイティブに持つ。

| ツール         | 用途                                                     |
| -------------- | -------------------------------------------------------- |
| browser\_\*    | ブラウザ操作（ナビゲート、クリック、タイプ、スクロール） |
| cronjob        | 定期ジョブの作成・管理                                   |
| vision_analyze | 画像の AI 分析                                           |
| text_to_speech | 音声合成                                                 |
| terminal       | シェルコマンド実行                                       |
| file           | ファイル読み書き                                         |
| patch          | コード編集（fuzzy match）                                |
| webhook        | Webhook 購読管理                                         |
| search_files   | ripgrep ベースのファイル検索                             |

ブラウザ操作は「ターミナルに常駐する人間の代わりに調査する」用途で、Claude Code の Chrome 連携よりも直接的な DOM 操作が可能だ。

## プラットフォーム統合の違い

### Claude Code: IDE 中心の統合

Claude Code は開発環境との統合を重視している。

- **VS Code** ... ネイティブ拡張機能
- **JetBrains** ... IDE プラグイン
- **Cursor, Windsurf** ... 統合ターミナル対応
- **Desktop app** ... 独立 GUI
- **Web** ... `claude.ai/code` でブラウザから
- **Slack** ... @claude でチャンネル内呼び出し
- **GitHub** ... @claude で PR レビュー依頼

開発者のワークフローに「自然に入り込む」形を目指している。

### Hermes Agent: メッセージング中心の統合

Hermes Agent はコミュニケーション・自動化プラットフォームとの統合を重視している。

- **Telegram / Discord / WhatsApp / Signal / Slack**
- **Email / SMS**
- **DingTalk / Feishu / WeCom / QQBot**
- **Web Dashboard** (`hermes dashboard`)
- **Gateway Service** (常駐デーモン、launchd/systemd)

つまり「開発ツールとして使う」だけでなく、「チャットボット・自動化エンジン」として運用することも想定されている。実際、`hermes status` を見るとメッセージングプラットフォームの接続状態が一覧表示される。

## MCP 連携の違い

両者とも MCP（Model Context Protocol）に対応しているが、統合方式が違う。

### Claude Code

- `.mcp.json` または `CLAUDE_CODE_MCP_SERVERS` 環境変数で設定
- サブエージェントの MCP 設定は `--strict-mcp-config` で管理
- エンタープライズ環境では managed MCP config でポリシー統制
- `claude mcp list/get` CLI で管理

### Hermes Agent

- `native-mcp` ... `config.yaml` に MCP サーバー設定を書くだけで自動ツール発見
- `mcporter` CLI ... ad-hoc にサーバーを起動・連携（`hermes mcp` サブコマンド）
- Hermes 自身を MCP サーバーとしても動作可能 (`hermes mcp serve`)
- ACP（Agent Client Protocol）サーバーとしても動作可能 (`hermes acp`)

Hermes は「MCP のハブ」として振る舞う柔軟性があり、双方向の連携が可能だ。

## セッション管理の違い

### Claude Code

- **Checkpoint** ... ファイル変更のスナップショットを自動取得、任意の時点に戻せる
- **Resume** ... 過去のセッションを復帰
- **Fork** ... セッションを分岐
- **Worktree** ... git worktree 単位でセッション分離
- **Context Window** ... 200k トークン（Claude モデル依存）

### Hermes Agent

- **Session Search** (`session_search`) ... 過去の全セッションをキーワード検索
- **Resume / Continue** (`--resume`, `--continue`) ... セッション復帰
- **Cron** ... セッションを定期実行としてスケジュール
- **Insights** (`hermes insights`) ... 使用状況の分析

Claude Code は「コード変更の undo」に強く、Hermes Agent は「過去の会話・手順の検索・再利用」に強い。

## セキュリティ・パーミッション

### Claude Code

- **Permission modes** ... Auto（自動承認）、Manual（承認待ち）、Bypass-permissions（制限なし）
- **Sandbox** ... Bash コマンドをサンドボックス化（ファイルシステム分離）
- **Auto mode classifier** ... データ流出など危険な操作を自動検出
- **Managed Settings** ... エンタープライズ管理者がポリシーを設定可能

### Hermes Agent

- **YOLO mode** (`--yolo`) ... 承認プロンプトをスキップ
- **Per-tool enablement** (`hermes tools`) ... プラットフォームごとにツールを有効/無効化
- **Sudo control** ... 特権コマンドの制御
- **Auth pooling** (`hermes auth`) ... 複数プロバイダーの認証情報をプール管理

## どちらを選ぶべきか？

### Claude Code を選ぶ場面

- 大規模コードベースの深い理解・リファクタリングが必要
- IDE（VS Code/JetBrains）に統合して使いたい
- GitHub PR レビューや CI 連携を自動化したい
- チームで統一された開発支援ツールとして導入したい
- エンタープライズ管理（ポリシー統制、使用監査）が必要

### Hermes Agent を選ぶ場面

- コーディング以外にも調査（ブラウザ操作）、定期タスク、ドキュメント作成が混在する
- Ollama などローカルモデルを使いたい、または複数モデルを使い分けたい
- 同じ手順を自動化・スキル化して蓄積したい
- マルチエージェント（Claude Code や Codex を子に含む）で統合したい
- チャットボット・自動化エンジンとして常駐運用したい
- セッションを跨いだ記憶・検索が重要

## 両者の組み合わせも有力

実際に Hermes Agent は `delegate_task` で Claude Code を子エージェントとして起動できる。つまり「Hermes で統括・調整し、Claude Code にコーディングを任せる」という棲み分けが可能だ。

例えば以下のような流れだ。

1. Hermes Agent に「この機能を実装して」と依頼
2. Hermes がブラウザで仕様を調査
3. Hermes が Claude Code に「この仕様で実装して」と delegate
4. Claude Code がコードベースを理解して実装
5. Hermes が CI 結果を確認して報告

## まとめ

| 観点             | Claude Code                     | Hermes Agent                               |
| ---------------- | ------------------------------- | ------------------------------------------ |
| 設計思想         | コードファースト、IDE 統合      | オーケストレーター、マルチプラットフォーム |
| スキル保存       | プロジェクト内 `.claude/`       | グローバル `~/.hermes/skills/` + メモリ    |
| サブエージェント | `claude agents`（同一エコ系内） | `delegate_task`（異種エージェント連携）    |
| ブラウザ         | Chrome 拡張連携                 | ネイティブ DOM 操作                        |
| メッセージング   | Slack（@claude）                | 10+ プラットフォーム双方向統合             |
| モデル           | Claude 固定                     | 10+ プロバイダー切り替え                   |
| 常駐運用         | デスクトップアプリ              | Gateway デーモン + Cron                    |

「どちらが優れているか」ではなく、「どのレイヤーの問題を解決したいか」が選定の鍵になる。コードベースの深い理解と IDE 統合が命なら Claude Code。マルチタスク統合と長期記憶・自動化が命なら Hermes Agent。そして両者を組み合わせるのも、現実的な選択肢だ。
