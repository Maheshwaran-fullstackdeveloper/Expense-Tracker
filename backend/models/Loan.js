import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please add a loan title"],
      trim: true,
      maxlength: [50, "Loan title cannot be more than 50 characters"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Please add total loan amount"],
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: "default-product.jpg",
    },
    monthlyPayment: {
      type: Number,
      required: [true, "Please add monthly payment amount"],
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot be more than 200 characters"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    lastPaymentMonth: {
      type: String, // e.g. "2026-03"
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
