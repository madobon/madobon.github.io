---
title: "Claude Code 2026 Week 20 振り返り — Agent view、/goal、Opus 4.7 fast mode など"
date: "2026-05-17T06:31:16+09:00"
slug: "claude-code-2026-week20"
summary: "Claude Code v2.1.139–v2.1.142 の週間ダイジェストを日本語で解説。Agent view、/goal、Opus 4.7 fast mode、Rewind の Summarize up to here など主要アップデートをまとめた。"
tags:
  - claude-code
  - ai-agent
  - weekly-update
  - translation
---

# Claude Code 2026 Week 20 振り返り

Claude Code 公式の [What's New](https://code.claude.com/docs/en/whats-new) に毎週まとめられている週間ダイジェストを日本語で解説するシリーズ。今回は **Week 20（5月11日〜15日、v2.1.139–v2.1.142）** を取り上げる。

## 目次

- [Agent view（リサーチプレビュー）](#agent-view)
- [/goal コマンド](#goal)
- [Fast mode on Opus 4.7](#fast-mode-on-opus-47)
- [その他の改善点](#その他の改善点)

---

## Agent view

`claude agents` コマンドを実行すると、すべての Claude Code セッションを1つの画面で管理できるダッシュボードが開く。

- 実行中のセッション
- ユーザーの入力待ち（blocked）になっているセッション
- 完了したセッション

が一覧で確認できる。例えばバグ修正、PRレビュー、不安定なテストの調査を並行して投げておいて、別のウィンドウで作業しつつ、必要な時だけ介入する——といった使い方が可能だ。

任意の行を選択するとそのセッションのフル会話に入れる。`←` で一覧に戻る。バックグラウンドセッションはターミナルがアタッチされていなくても動き続ける。

```
claude agents
```

また dispatch 時に各種フラグ（`--add-dir`, `--settings`, `--mcp-config`, `--plugin-dir`, `--permission-mode`, `--model`, `--effort`, `--dangerously-skip-permissions`）でバックグラウンドセッションの設定を injected できる。`--cwd <path>` でディレクトリごとにセッション一覧を絞り込める。

---

## /goal

完了条件を設定すると、Claude がその条件が満たされるまで複数ターンを跨いで自動的に作業を続ける。各ターンの後、高速モデルで条件をチェックし、未達なら次のターンを開始する。ユーザーはプロンプトを打ち続ける必要がない。

モジュールの移行や「すべての呼び出し側がコンパイル済みでテストが通る」など、検証可能な終了状態を持つ大きな作業に適している。条件が満たされると goal は自動で解除される。対話モード、`-p`、Remote Control で有効。

```
> /goal all tests in test/auth pass and the lint step is clean
```

---

## Fast mode on Opus 4.7

`/fast` がデフォルトで Opus 4.7 上で動作するようになった。従来の Opus 4.6 fast mode からの変更だ。

Fast mode は「同等のモデル品質で約 2.5 倍の速度」を謳う Opus の高速構成。トークンあたりのコストは高いが、急速な反復開発やライブデバッグに有用。価格は従来と同じく $30/$150 per MTok。Opus 4.6 に固定したい場合は `CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE=1` を設定する。

```
> /fast
```

---

## その他の改善点

| 項目                                | 内容                                                                                                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hook `args: string[]` exec form     | シェルを介さず直接コマンドを起動する exec 形式。パスにスペースがあってもクォート不要になる                                                                                                                                |
| Hook `continueOnBlock`              | `PostToolUse` hook の設定で、拒否理由を Claude にフィードバックしてターンを継続する（終了しない）                                                                                                                         |
| Hook `terminalSequence`             | hook の JSON 出力からターミナル制御シーケンスを発行し、デスクトップ通知・ウィンドウタイトル変更ベルなどが可能になる                                                                                                       |
| Rewind menu「Summarize up to here」 | 過去のコンテキストを圧縮しつつ最近のターンは維持するサマリー機能                                                                                                                                                          |
| API key 使用時の機能制限            | `ANTHROPIC_API_KEY`、`apiKeyHelper`、`ANTHROPIC_AUTH_TOKEN` が設定されている場合、Remote Control・`/schedule`・Claude.ai MCP connectors・通知設定が無効化される。これらの機能を使う場合は API key を unset する必要がある |
| MCP stdio servers                   | `CLAUDE_PROJECT_DIR` を環境変数として受け取るようになった。plugin config でも `${CLAUDE_PROJECT_DIR}` が使える                                                                                                            |
| `claude plugin details <name>`      | プラグインのコンポーネント一覧とセッションあたりの推定トークンコストを表示                                                                                                                                                |

---

## 所感

今週は「並行して複数セッションを管理する」Agent view と「条件達成まで自律して走る」/goal が組み合わさることで、Claude Code が「人間の介入ポイントを明確にしながら自律性を高める」方向に進んだ印象。バックグラウンドで並行タスクを放り投げておいて、必要な時だけフォーカスする——そういうワークフローの基盤が揃ってきた感じがある。Fast mode の Opus 4.7 移行もその延長で、反復速度があがることで実質的な生産性が変わる。

今後も毎週追っていく。

---

**参照:**

- [Claude Code What's New — Week 20](https://code.claude.com/docs/en/whats-new/2026-w20)
- [Claude Code Changelog](https://code.claude.com/docs/en/changelog)
