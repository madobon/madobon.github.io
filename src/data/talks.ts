export type TalkEntry = {
  href: string;
  slug: string;
  status: string;
  summary: string;
  title: string;
};

export const talks: TalkEntry[] = [
  {
    slug: "welcome",
    title: "Welcome to the Drift",
    href: "/talks/welcome/",
    status: "インタラクティブな Slidev デッキ",
    summary:
      "Three.js の星空表現と奥行きのあるパーティクルを組み込んだ、再利用可能なカスタム Slidev テーマです。",
  },
];
