import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements - The Observation Files",
  description: "View your detective achievements and track your progress.",
};

export default function AchievementsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Achievements</h1>
      </div>
    </div>
  );
}
