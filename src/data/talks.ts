export type TalkEntry = {
  href: string;
  slug: string;
  status: string;
  summary: string;
  title: string;
};

export const talks: TalkEntry[] = [
  {
    slug: "blog-workday",
    title: "Blog Workday Notes",
    href: "/talks/blog-workday/",
    status: "作業の振り返りをまとめたデッキ",
    summary:
      "Qiita 導線追加、Slidev の GitHub Pages 対応、ブログの markdown-it 化と Mermaid 確認までを短く振り返るデッキです。",
  },
  {
    slug: "welcome",
    title: "Welcome to the Drift",
    href: "/talks/welcome/",
    status: "インタラクティブな Slidev デッキ",
    summary:
      "Three.js の星空表現と奥行きのあるパーティクルを組み込んだ、再利用可能なカスタム Slidev テーマです。",
  },
];
