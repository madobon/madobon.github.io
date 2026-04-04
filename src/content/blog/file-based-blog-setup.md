---
title: "File-Based Blog Setup"
date: "2026-04-03"
summary: "個人サイトのブログを CMS ではなくファイルベースで持つ理由と、今回の構成での実装方針を整理します。"
tags:
  - architecture
  - blog
  - ssg
---

# File-Based Blog Setup

個人ホームページのブログは、最初から外部 CMS を入れるより、リポジトリ内のファイルとして持ったほうが運用が軽くなります。

## Design choice

今回の構成では `src/content/blog/*.md` を記事ソースにして、frontmatter から一覧データを組み立てる方式にしています。

### Benefits

- 記事追加が `git` ベースで完結する
- ビルド結果がすべて静的ファイルになる
- 下書き制御やタグ付けも frontmatter で足せる

## Next steps

必要になったら次を追加できます。

- RSS フィード
- タグ一覧ページ
- 年月アーカイブ
- 検索インデックス
