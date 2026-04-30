import { Router } from "express";
import {
  recordClassification,
  penalizeIncorrect,
  getLeaderboard,
} from "../controller/gamecontroller"

const gamerouter = Router();

gamerouter.post("/classify", recordClassification);
gamerouter.post("/penalize", penalizeIncorrect);
gamerouter.get("/leaderboard", getLeaderboard);

export default gamerouter;
