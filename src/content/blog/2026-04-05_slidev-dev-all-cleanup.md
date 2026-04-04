---
title: "Slidev デッキが開かず、proxy を疑ったら dev:all の構成ズレだった"
date: "2026-04-05T08:33:36+09:00"
slug: "slidev-dev-all-cleanup"
summary: "ローカルの Vite で Slidev デッキが開かなくなり proxy 周りを疑ったものの、実際には dev:all の構成が今の配信方式とずれていたので整理し直した記録です。"
tags:
  - slidev
  - vite
  - github-pages
  - workflow
---

# Slidev デッキが開かず、proxy を疑ったら dev:all の構成ズレだった

今日はローカルの `dev:all` でスライドが開けなくなっていて、最初は「Vite の proxy 周りがおかしくなったのかも」と思いながら見始めました。

ただ実際に追ってみると、問題は proxy というより、今の構成と `dev:all` の中身が噛み合っていなかったことでした。

## 最初の依頼

きっかけは「local の vite で proxy 経由のスライド起動がおかしくなっていて、デッキが開けない気がする」という相談でした。

ちょうど `dev:all` で起動している、という補足もあって、最初は `vite.config.ts` の middleware か proxy 設定に何か崩れが出たのではないか、という前提で見始めました。

## 実装でやったこと

まず `vite.config.ts`、`package.json`、`scripts/build-talks.mjs` を順番に確認しました。

その結果、今のサイト側は `dist/talks/*` に出力した静的な Slidev 成果物を Vite の middleware で返す構成になっていて、常時 3030 番の Slidev dev サーバーへ proxy しているわけではないことが分かりました。

一方で `package.json` の `dev:all` は、まだ以前の名残で `vp dev` と `slidev slides.md --port 3030` を同時起動する形のままでした。

つまり、サイト本体は静的成果物を返す方針に寄っているのに、`dev:all` だけは別の Slidev dev サーバーを追加で立てていて、ここがズレていました。

## 途中で詰まったところ

最初は `dist/talks` に必要なファイルがないのかと思って build の状態を確認しましたが、`pnpm run build:talks` 自体は通っていました。

そのあと `vp dev` の起動ログを追うと、`talks/blog-workday/index.html` や `talks/welcome/index.html` に対して Slidev が警告を出していました。

この `index.html` は deck のソースとして置いたものではなく、`slidev slides.md` を deck ディレクトリで動かしたときに落ちる dev 用生成物でした。

つまり「proxy が壊れた」のではなく、`dev:all` が余計な Slidev サーバーを起動し、その副作用で deck 配下に `index.html` を残し、起動時の判断を濁らせていた、という流れでした。

## 最終的な修正

最終的には次の形で整理しました。

`package.json` の `dev:all` は `vp dev` 一本にして、サイト側の middleware が `dist/talks/*` を返す今の方式に合わせました。

そのうえで `scripts/build-talks.mjs` には、もし deck 配下に Slidev dev 由来の `index.html` が残っていたら build 前に削除する処理を足しています。

さらに `.gitignore` では `talks/*/index.html` や `talks/*/dist` のような deck 直下生成物を無視するようにして、誤って Git 管理に混ざらないようにもしました。

README も `pnpm dev:all` と `pnpm build` を軸にした説明へ揃えていて、ローカルの見え方と GitHub Pages に載る静的成果物の考え方が一致するようにしています。

## まとめ

今回は最初に proxy を疑ったものの、実際には「配信方式はもう静的ビルド寄りに変わっているのに、`dev:all` だけ古い前提のままだった」というのが本当の原因でした。

ローカルの convenience 用スクリプトは一度作るとそのまま残りやすいですが、配信方式を変えたタイミングで一緒に見直さないと、こういうズレが後から効いてくるのだと改めて感じました。

最後に `pnpm run build` を通して、GitHub Pages に載せる `dist/` が引き続き生成できることまでは確認しています。
