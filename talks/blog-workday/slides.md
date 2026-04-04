---
theme: space
title: 今日ブログでやったこと
info: |
  ブログ改善、Slidev 公開、markdown-it 置き換え、Mermaid 確認までを短くまとめたデッキ。
layout: cover
glow: full
glowSeed: 8
class: cover-stars
drawings:
  persist: false
mdc: true
download: false
---

<div class="space-kicker">Blog Workday</div>

# 今日ブログでやったこと

<div class="space-cover-lead">

Qiita への導線追加から始めて、
ブログの並び順、カードの見た目、Markdown parser の置き換え、
そして Mermaid 表示確認までを一気に進めた日のメモです。

</div>

<div class="space-chip-row">
  <span class="space-chip">Qiita 導線</span>
  <span class="space-chip">Slidev 公開</span>
  <span class="space-chip">markdown-it</span>
</div>

---
layout: open
glow: right
glowSeed: 14
---

# 進めたこと

- トップと About に Qiita へのリンクを追加
- GitHub Pages で Slidev の `/talks/welcome/1` が 404 になる原因を整理
- build 後に番号ディレクトリを増やして回避
- ブログ記事を追加して、同日公開でも新着が先頭に出るように調整

---
layout: open
glow: bottom-left
glowSeed: 21
class: airy-slide
---

# デザインで触ったところ

1. ブログ一覧カードの重心が左に寄って見えていたので、タイトル幅と下部配置を調整した
2. `記事を読む` の位置を右下へ寄せて、CTA の位置を揃えた
3. タイトルサイズを詰めすぎてスカスカになったところを、密度を戻しながら微調整した

---
layout: open
glow: right
glowSeed: 33
---

# Markdown 周りの変更

- 自前 parser から本文部分を `markdown-it` ベースへ切り替えた
- frontmatter はブラウザ側でも安全な軽い実装のまま残した
- `gray-matter` はこの構成だと dev server 起動に影響したため採用しなかった
- `mermaid` は `div.mermaid` を出して、記事ページ側で `mermaid.run()` する形にした

---
layout: open
glow: bottom
glowSeed: 47
---

# 今日の成果

- Qiita 導線の追加
- Slidev の深いURL公開を GitHub Pages 上で成立
- ブログの並び順とカードデザインの改善
- Markdown / Mermaid を少し先まで育てやすい土台づくり
