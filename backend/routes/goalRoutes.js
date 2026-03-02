import express from "express";
import {
  createGoal,
  getGoals,
  deleteGoal,
  updateGoal,
  recordContribution,
  toggleGoalStatus,
} from "../controllers/goalController.js";
import { protect } from "../middleware/authMiddleware.js";

import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createGoal);
router.get("/", getGoals);
router.delete("/:id", deleteGoal);
router.put("/:id", updateGoal);
router.patch("/:id/contribute", recordContribution);
router.patch("/:id/status", toggleGoalStatus);

export default router;
