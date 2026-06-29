import { lazy } from "react";

const Home = lazy(() => import("./pages/Home"));
const AnimeList = lazy(() => import("./pages/AnimeList"));
const GameLibrary = lazy(() => import("./pages/GameLibrary"));
const MusicPlayer = lazy(() => import("./pages/MusicPlayer"));
const NovelWriter = lazy(() => import("./pages/NovelWriter"));
const NovelReader = lazy(() => import("./pages/NovelReader"));
const Pomodoro = lazy(() => import("./pages/Pomodoro"));
const TimeStats = lazy(() => import("./pages/TimeStats"));
const Settings = lazy(() => import("./pages/Settings"));

export interface Route {
  path: string;
  label: string;
  icon: string;
  Component: React.LazyExoticComponent<React.ComponentType>;
}

export const routes: Route[] = [
  { path: "/", label: "仪表盘", icon: "🏠", Component: Home },
  { path: "/anime", label: "番剧库", icon: "🎬", Component: AnimeList },
  { path: "/games", label: "游戏库", icon: "🎮", Component: GameLibrary },
  { path: "/music", label: "音乐", icon: "🎵", Component: MusicPlayer },
  { path: "/writing", label: "写作", icon: "✍", Component: NovelWriter },
  { path: "/reading", label: "阅读", icon: "📖", Component: NovelReader },
  { path: "/pomodoro", label: "番茄钟", icon: "⏱", Component: Pomodoro },
  { path: "/stats", label: "统计", icon: "📊", Component: TimeStats },
  { path: "/settings", label: "设置", icon: "⚙", Component: Settings },
];
