---
title: "Codex を入れて最初にやったこと"
date: "2026-04-04T15:07:06+09:00"
slug: "codex-install-and-first-day"
summary: "Codex の導入に使ったコマンドと、iTerm 上で実際にやったサイト調整の流れをまとめた記録です。"
tags:
  - codex
  - setup
  - design
---

# Codex を入れて最初にやったこと

今日は Codex を入れて、この個人サイトを一緒に触りながら、iTerm で実行したコマンドベースで作業の流れを試していました。

## 導入時に使ったコマンド

最初は Homebrew 周りのセットアップから始めて、iTerm 上で必要なツールをそろえました。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install git
brew install gh
brew install iterm2
brew install visual-studio-code
brew install raycast
brew install wget curl
```

このあと Codex を使える状態にして、リポジトリの中を見ながらどこを触ると全体に効くかを確認していきました。

## 今日やった作業

リポジトリに入ってからは、主に次のようなコマンドを使って確認とビルドを回しました。

```bash
pnpm run build:site
pnpm run build
vp fmt src/style.css src/pages/HomePage.vue
vp fmt src/style.css
```

実際にやったことは大きく分けると次の3つです。

1. `talks/welcome/` のスライドを、少し親しみやすい見た目と文言に寄せた
2. サイト全体の配色、余白、カード密度を調整して、展示っぽさを減らした
3. ブログ記事を追加して、最後にサンプル記事を整理した

特にホーム画面は、最初は余白が広くて少し距離がある印象だったので、カードの密度やタイトルサイズ、ヒーローの情報量を何度か詰め直しました。

## 気づいたこと

Codex を使うと、思いついた調整を小さく試しながら、そのままファイルへ反映して、`pnpm run build:site` で確認していけるのが便利でした。

一方で、Slidev の markdown は自動整形との相性に少し注意が必要で、`slides.md` の frontmatter は崩れないように見ながら触る必要がありそうです。

## 次にやること

次はブログや About ページの文言も、日本語の温度感をもう少し揃えて、iTerm で実行した内容がそのまま残る作業ログの形も整えていきたいです。
