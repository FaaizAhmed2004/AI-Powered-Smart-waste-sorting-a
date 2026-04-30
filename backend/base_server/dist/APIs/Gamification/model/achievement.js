"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAchievements = void 0;
const checkAchievements = (totalClassifications) => {
    const earned = [];
    if (totalClassifications >= 10)
        earned.push("Starter Recycler");
    if (totalClassifications >= 100)
        earned.push("Eco Helper");
    if (totalClassifications >= 500)
        earned.push("Sustainability Hero");
    return earned;
};
exports.checkAchievements = checkAchievements;
//# sourceMappingURL=achievement.js.map