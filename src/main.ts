import { ViteSSG } from "vite-ssg";
import App from "./App.vue";
import { blogPostPaths } from "./data/blog";
import { routes } from "./router";
import "./style.css";

export const createApp = ViteSSG(App, { routes });

export function includedRoutes(paths: string[]) {
  return [...paths.filter((path) => !path.includes(":")), ...blogPostPaths];
}
