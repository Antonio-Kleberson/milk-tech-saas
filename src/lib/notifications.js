// src/lib/notifications.js
import { milkProduction } from "@/lib/milk-production.service";

export function getProductionBadgeCount(userId) {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const today = `${y}-${m}-${day}`;

  const { from, to } = { from: new Date(y, d.getMonth(), 1), to: new Date(y, d.getMonth() + 1, 0) };
  const days = milkProduction.aggregateByDay(userId, { from, to });
  const todayRow = days.find((row) => row.date === today);

  const hasMorning = !!(todayRow && todayRow.items.some((i) => i.shift === "morning"));
  const hasAfternoon = !!(todayRow && todayRow.items.some((i) => i.shift === "afternoon"));

  let count = 0;
  if (!hasMorning) count += 1;
  if (!hasAfternoon) count += 1;
  return count; // 0..2
}
