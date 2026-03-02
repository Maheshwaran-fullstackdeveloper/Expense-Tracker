import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      required: [true, "Please specify transaction type (Income or Expense)"],
      enum: ["income", "expense"],
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
    },
    amount: {
      type: Number,
      required: [true, "Please add an amount"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [200, "Notes cannot be more than 200 characters"],
    },
  },
  {
    timestamps: true,
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
