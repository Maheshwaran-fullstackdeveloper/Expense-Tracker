import express from "express";
import {
  createTransaction,
  getTransactions,
  deleteTransaction,
  getTransactionStats,
  updateTransaction,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createTransaction);
router.get("/", getTransactions);
router.get("/stats", getTransactionStats);
router.delete("/:id", deleteTransaction);
router.put("/:id", updateTransaction);

export default router;
