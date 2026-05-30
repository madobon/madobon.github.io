---
title: "Claude Code 最新アップデート：Opus 4.8 と動的ワークフロー"
date: "2026-05-30T09:33:58+09:00"
slug: "claude-code-opus-48"
summary: "Claude Code 最新アップデート：Opus 4.8 と動的ワークフロー の新機能・変更点を解説します。"
tags:
  - claude
  - ai-agent
---

# Claude Code 最新アップデート：Opus 4.8 と動的ワークフロー

## はじめに

Claude Code のバージョン 2.1.154 から 2.1.157 までの更新内容をまとめる。
大規模タスク処理能力とシステム安定性の向上が主な焦点だ。
新モデル Opus 4.8 と動的ワークフロー機能について解説する。

## 変更点の概要

- Opus 4.8 モデルのデフォルト採用と Fast Mode 対応
- 動的ワークフローによる多数のエージェント orchestration
- `.claude/skills` ディレクトリのプラグイン自動読み込み
- agents 機能の強化とワークツリー管理の改善
- 多数のバグ修正と UX 改善

## 詳細解説

### 新モデルとワークフロー機能

バージョン 2.1.154 で Opus 4.8 が導入された。
デフォルトで high effort 設定となり、複雑なタスクに適している。
`/effort xhigh` で hardest tasks に対応可能だ。
Fast Mode は標準レートの 2 倍で 2.5 倍の速度を実現する。
コストは以前の_fraction_から大幅に削減された。

動的ワークフロー機能が追加された。
Claude がワークフローを作成し、数十から数百のエージェントをバックグラウンドで orchestrate する。
大規模で複雑なタスクを処理可能だ。
`/workflows` コマンドで実行状況を確認できる。

システムプロンプトの lean 化が進んだ。
Haiku、Sonnet、Opus 4.7 以前を除き、デフォルトで lean system prompt を使用する。
複数選択質問プロンプトは、モデルが判断できない場合のみ予約される。
文脈が十分な場合は質問せずに Proceed する。

`/simplify` の動作が変更された。
完全なバグハンティングレビューではなく、cleanup-only review を実行する。
再利用、簡素化、効率性、altitude をレビューし修正を適用する。
`/effort` スライダーのラベルが「Faster」「Smarter」に変更された。

### プラグインシステム

`.claude/skills` ディレクトリのプラグインが自動読み込みされる。
Marketplace が不要になった。
`claude plugin init <name>` で新しいプラグインを scaffold できる。
`/plugin` 引数の autocomplete が強化された。
サブコマンド、インストール済みプラグイン、既知の Marketplace が対象だ。

プラグインは `plugin.json` で `defaultEnabled: false` を宣言可能だ。
`/plugin` または `claude plugin enable` で有効化する。
依存関係のあるプラグインは自動的に有効化される。
`/plugin` Discover タブで、ディレクトリに適合するプラグインがピン留めされる。
「suggested for this directory」注釈が表示される。

### agents 機能とワークツリー

`claude agents` 機能が強化された。
`settings.json` の `agent` フィールドが dispatched sessions で尊重される。
`--agent <name>` でオーバーライド可能だ。
`! <command>` でシェルコマンドをバックグラウンドセッションとして実行できる。
`claude --bg --exec '<command>'` でも利用可能だ。

`/logout` はバックグラウンドセッションではなく、サインアウトを行う。
`←←` で agents view を開く機能は Bedrock 等でも動作する。
テレメトリ無効時にも利用可能だ。
スラッシュコマンドの autocomplete が部分一致するように改善された。

ワークツリー管理が改善された。
`EnterWorktree` でセッション中に Claude 管理のワークツリーを切り替え可能だ。
エージェント終了後、ワークツリーはロックされない。
`git worktree remove` や `prune` でクリーンアップできる。
`--worktree` と `--worktree --tmux` は現在の linked worktree に戻る。

バックグラウンドエージェントの管理が安定化した。
アイドルサブエージェントが残ってもセッションは引退する。
30 日保持スイープ後も `.claude/worktrees/` は orphan にならない。
サブエージェントは worktree-isolation guard をバイパスしない。
`worktree.baseRef: "head"` は現在の worktree の HEAD を解決する。

### 設定と UX 改善

画像処理の安定性が向上した。
破損画像はリクエストをクラッシュさせず、テキストプレースホルダーになる。
WSL で画像貼り付けとスクリーンショット貼り付けを修正した。
Windows Explorer からの画像ドラッグをサポートした。

ターミナル関連の修正が行われた。
`copy-on-select` は tmux 内でもシステムクリップボードに到達する。
`--resume` セッションピッカーは全画面モードで内容を残さない。
右クリック貼り付けでのクリップボード重複を修正した。
`/terminal-setup` は VS Code 等で GPU 加速を無効化する。
文字化れレンダリングを防止するためだ。

起動時のノイズが削減された。
「bash commands will be sandboxed」バナーを削除した。
サンドボックス状態は `/status` で確認可能だ。
「/ide for …」スタートアップヒントトーストを削除した。
Feature of the Week クレジット主張状態はステータスエリアに表示される。

その他 UX 改善が実施された。
管理設定セキュリティダイアログ承認後のターミナルフリーズを修正した。
全画面モードの進行中メッセージから Markdown マーカーを削除した。
スクロールバックの重複行を修正した。
番号キーショートカットがオプションダイアログで動作する。
ワークフローキーワードトリガー設定を `/config` に追加した。
「workflow」単語での動的ワークフロートリガーを停止可能だ。
バックスペースでワークフローリクエストを dismiss できる。

### セキュリティとテレメトリ

セキュリティ分類器が改善された。
データ流出検出、特にリポジトリ内容の bulk transfers を検知する。
`rm -rf $HOME` は `$HOME` に末尾スラッシュがあってもブロックされる。
`$TMPDIR` はサンドボックス内外で異なるディレクトリに解決されない。

テレメトリ設定が更新された。
`tool_decision` イベントに `tool_parameters` が含まれる。
`OTEL_LOG_TOOL_DETAILS=1` の場合に bash コマンド等が含まれる。
ストリーミングツール実行は常に有効化された。
テレメトリ無効時や Bedrock 等でも動作する。

MCP サーバーの環境変数が追加された。
Stdio MCP サーバーサブプロセスは `CLAUDE_CODE_SESSION_ID` を受信する。
`CLAUDECODE=1` も環境変数に追加された。
`claude mcp list` は未承認サーバーを `⏸ Pending approval` と表示する。
パイプ出力時の自動承認と接続を防ぐためだ。
`/remote-control` autocomplete は接続時に断开オプションを表示する。

### バグ修正と安定性向上

多数のバグが修正された。
各項目について症状と修正内容を記載する。

- Opus 4.8 使用時、thinking blocks 変更による API エラーを修正（2.1.156）
- 自動モードと bypass-permissions モードのサンドボックスネットワークプロンプトを修正
- 遅い「opening…」時の Esc キャンセル機能を修正
- 睡眠/復帰後のバックグラウンドセッションの日付通知を修正
- 前プロセス終了時の実行中サブエージェント報告を `--resume` で修正
- 統合ターミナルの Fast mode indicator 表示を修正
- IDE の Stop ボタンでバックグラウンドサブエージェント停止を修正
- バックグラウンドエージェント完了通知の「out of context」挙動を修正
- スケジュールコマンド発火時のユーザー目標喪失を修正
- アップデート後のピン留めセッションの毎分 respawn を修正
- アイドル猶予期間後のセッション引退問題を修正
- macOS での `claude --bg-pty-host` プロセスの CPU 消費を修正
- `claude agents` のハイライト行テキスト読みやすさを修正
- 1M コンテキストモデルの背景エージェント通知を修正
- `/model` ピッカーの「Newer version available」ヒント表示を修正
- 長い会話と再開済み会話のパフォーマンスを改善
- VS Code、Cursor、Windsurf 統合ターミナルの右クリック貼り付け重複を修正

廃止された機能もある。
`CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE` は廃止された。
2026 年 6 月 1 日に削除される。
Opus 4.6 で Fast Mode を使う場合は `/model` と `/fast on` を使用する。
`/claude-api` スキルに Opus 4.8 サポートと移行ガイドを追加した。

## まとめ

今回のアップデートで処理能力と安定性が大幅に向上した。
Opus 4.8 と動的ワークフローで大規模タスクを効率化できる。
プラグインシステムと agents 機能の改善で開発フローが最適化される。
多数のバグ修正により、日常作業の信頼性が高まった。

---

## 参考

- [claude-code-changelog](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md)