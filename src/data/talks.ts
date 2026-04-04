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
    status: "Interactive Slidev deck",
    summary: "A reusable custom Slidev theme with a Three.js starfield and depth-moving particles.",
  },
];
