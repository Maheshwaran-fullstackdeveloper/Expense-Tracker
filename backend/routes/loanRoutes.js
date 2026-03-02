import express from "express";
import {
  createLoan,
  getLoans,
  updateLoan,
  deleteLoan,
  recordPayment,
  toggleStatus,
} from "../controllers/loanController.js";
import { protect } from "../middleware/authMiddleware.js";

import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createLoan);
router.get("/", getLoans);
router.put("/:id", updateLoan);
router.delete("/:id", deleteLoan);
router.patch("/:id/pay", recordPayment);
router.patch("/:id/status", toggleStatus);

export default router;
