import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/algomate/app-shell";

export const Route = createFileRoute("/")({
  component: AppShell,
});
