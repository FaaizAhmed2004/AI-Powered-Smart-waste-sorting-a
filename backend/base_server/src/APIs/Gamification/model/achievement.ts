export const checkAchievements = (totalClassifications: number): string[] => {
  const earned: string[] = [];

  if (totalClassifications >= 10) earned.push("Starter Recycler");
  if (totalClassifications >= 100) earned.push("Eco Helper");
  if (totalClassifications >= 500) earned.push("Sustainability Hero");

  return earned;
};
