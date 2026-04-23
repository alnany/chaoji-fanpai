"use client";
import { useGame } from "@/lib/store";
import { StartScreen } from "@/components/StartScreen";
import { GameBoard } from "@/components/GameBoard";
import { EndGameScreen } from "@/components/EndGameScreen";
import { useEffect, useState } from "react";

export default function Home() {
  const phase = useGame((s) => s.phase);
  // Guard against SSR/localStorage hydration mismatch
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  if (phase === "setup") return <StartScreen />;
  if (phase === "ended") return <EndGameScreen />;
  return <GameBoard />;
}
