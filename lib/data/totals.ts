export function spendTotals(
  services: { date: string; totalCostMxn: number | null }[],
  today: string,
): { year: number; allTime: number } {
  const year = today.slice(0, 4);
  return services.reduce(
    (acc, s) => {
      const cost = s.totalCostMxn ?? 0;
      return {
        year: acc.year + (s.date.startsWith(year) ? cost : 0),
        allTime: acc.allTime + cost,
      };
    },
    { year: 0, allTime: 0 },
  );
}
