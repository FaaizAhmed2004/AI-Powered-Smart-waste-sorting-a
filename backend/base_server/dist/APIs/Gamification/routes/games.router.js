"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gamecontroller_1 = require("../controller/gamecontroller");
const gamerouter = (0, express_1.Router)();
gamerouter.post("/classify", gamecontroller_1.recordClassification);
gamerouter.post("/penalize", gamecontroller_1.penalizeIncorrect);
gamerouter.get("/leaderboard", gamecontroller_1.getLeaderboard);
exports.default = gamerouter;
