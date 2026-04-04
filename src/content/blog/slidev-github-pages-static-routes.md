---
title: "GitHub Pages で Slidev の /1 を開くためにやったこと"
date: "2026-04-04T20:30:00+09:00"
summary: "GitHub Pages では Slidev の深いURLが 404 になったので、build 後に番号ディレクトリを増やして回避した記録です。"
tags:
  - slidev
  - github-pages
  - vite
  - talks
---

# GitHub Pages で Slidev の /1 を開くためにやったこと

`/talks/welcome/` は開けるのに、`/talks/welcome/1` へ直接飛ぶと 404 になる、という差分がありました。

ローカルでは開けていたので最初はルーティングの問題に見えましたが、実際には配信方法の差でした。

## 何が起きていたか

ローカルの開発サーバーや preview は、ある程度やさしく `index.html` へフォールバックしてくれます。

一方で GitHub Pages は静的ファイル配信なので、`/talks/welcome/1` に対応する実ファイルがなければ、そのまま 404 になります。

今回の build 結果では、もともと生成されていたのは次のような形でした。

```text
dist/talks/welcome/index.html
dist/talks/welcome/404.html
dist/talks/welcome/assets/...
```

これだと `/talks/welcome/` は `index.html` に解決できますが、`/talks/welcome/1` に対応する `dist/talks/welcome/1/index.html` はありません。

## 今回やった回避策

`scripts/build-talks.mjs` で Slidev の build が終わったあと、各 deck の `index.html` をスライド番号ごとのディレクトリにも複製するようにしました。

```text
dist/talks/welcome/1/index.html
dist/talks/welcome/2/index.html
dist/talks/welcome/3/index.html
```

こうしておくと、GitHub Pages から見ても `/talks/welcome/1` は実在するディレクトリ配下の `index.html` として扱えます。

## 実装でやったこと

大きくは次の3つです。

1. `slides.md` を読んでスライド数を数える
2. `dist/talks/<slug>/index.html` を `1/index.html`, `2/index.html` のように複製する
3. 前回の build の残骸が残らないように、deck の出力先を build 前に掃除する

`vp preview` だと存在しない番号でも 200 が返ることがあったので、最終的な確認は素の静的配信で見たほうが GitHub Pages に近かったです。

## ついでに直したこと

`talks/welcome/slides.md` の2枚目で `layout: open` が表示されてしまっていたのは、スライド区切りの直後に空行が入っていて、frontmatter として解釈されていなかったためでした。

```md
---
layout: open
---
```

この形にそろえたら、表示上のノイズも消えました。

## いまの感想

かなり素朴な方法ですが、GitHub Pages をそのまま使いながら Slidev の深いURLを通したい、という目的にはちょうどよかったです。

将来的に Netlify や Cloudflare Pages のような rewrite を扱いやすい配信先へ移すなら、もう少し別のやり方も選べそうです。それまでは、この静的ディレクトリ増殖方式で十分回せそうだと感じています。
