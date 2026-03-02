import Loan from "../models/Loan.js";
import Transaction from "../models/Transaction.js";
import fs from "fs";
import path from "path";
import { upload } from "../middleware/uploadMiddleware.js";

const uploadSingle = upload.single("image");

// @desc    Add new loan
// @route   POST /api/loans
// @access  Private
export const createLoan = async (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    try {
      if (err) {
        res.status(400);
        throw new Error(err.message);
      }

      // Defensive check for req.body
      if (!req.body) {
        res.status(400);
        throw new Error("No data received in request body");
      }

      const {
        title,
        totalAmount,
        monthlyPayment,
        description,
        startDate,
        paidAmount,
      } = req.body;

      if (!title || !totalAmount || !monthlyPayment) {
        res.status(400);
        throw new Error(
          "Title, Total Amount, and Monthly Payment are required",
        );
      }

      const loan = await Loan.create({
        user: req.user._id,
        title,
        totalAmount: Number(totalAmount),
        monthlyPayment: Number(monthlyPayment),
        paidAmount: paidAmount ? Number(paidAmount) : 0,
        description: description || "",
        startDate: startDate || new Date(),
        status: "open", // FORCE OPEN ON CREATION
        imageUrl: req.file
          ? req.file.path.replace(/\\/g, "/")
          : "default-product.jpg",
      });

      console.log(`Loan created: ${loan._id}, Status: ${loan.status}`);
      res.status(201).json(loan);
    } catch (err) {
      next(err);
    }
  });
};

// @desc    Get all loans for a user
// @route   GET /api/loans
// @access  Private
export const getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(loans);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a loan
// @route   PUT /api/loans/:id
// @access  Private
export const updateLoan = async (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    try {
      if (err) {
        res.status(400);
        throw new Error(err.message);
      }

      const { id } = req.params;
      const loan = await Loan.findById(id);

      if (!loan) {
        res.status(404);
        throw new Error("Loan not found");
      }

      if (loan.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("User not authorized");
      }

      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.user;
      delete updateData.__v;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      if (req.file) {
        // Delete old image if not default
        if (loan.imageUrl && loan.imageUrl !== "default-product.jpg") {
          const oldPath = path.join(process.cwd(), loan.imageUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        updateData.imageUrl = req.file.path.replace(/\\/g, "/");
      }

      // Ensure types are correct if they are being updated
      if (updateData.totalAmount)
        updateData.totalAmount = Number(updateData.totalAmount);
      if (updateData.monthlyPayment)
        updateData.monthlyPayment = Number(updateData.monthlyPayment);
      if (updateData.paidAmount)
        updateData.paidAmount = Number(updateData.paidAmount);

      const updatedLoan = await Loan.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      res.json(updatedLoan);
    } catch (err) {
      next(err);
    }
  });
};

// @desc    Delete a loan
// @route   DELETE /api/loans/:id
// @access  Private
export const deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      res.status(404);
      throw new Error("Loan not found");
    }

    if (loan.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("User not authorized");
    }

    // Delete image file if not default
    if (loan.imageUrl && loan.imageUrl !== "default-product.jpg") {
      const imgPath = path.join(process.cwd(), loan.imageUrl);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Loan.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: "Loan deleted" });
  } catch (err) {
    next(err);
  }
};

// @desc    Record a monthly payment
// @route   PATCH /api/loans/:id/pay
// @access  Private
export const recordPayment = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      res.status(404);
      throw new Error("Loan not found");
    }

    const payAmount = Number(req.body.amount) || loan.monthlyPayment;
    if (isNaN(payAmount) || payAmount <= 0) {
      res.status(400);
      throw new Error("Valid payment amount is required");
    }

    loan.paidAmount = (loan.paidAmount || 0) + payAmount;

    // Auto-close ONLY if fully paid and it's open
    if (loan.status === "open" && loan.paidAmount >= (loan.totalAmount || 0)) {
      loan.status = "closed";
    }

    await loan.save();

    await Transaction.create({
      user: req.user._id,
      type: "expense",
      amount: payAmount,
      category: "Loan Repayment",
      notes: `Repayment for: ${loan.title}`,
      date: new Date(),
    });

    res.json(loan);
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle loan status (open/closed)
// @route   PATCH /api/loans/:id/status
// @access  Private
export const toggleStatus = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      res.status(404);
      throw new Error("Loan not found");
    }

    if (loan.status === "open") {
      loan.status = "closed";
      // Set to 100% progress when closing early
      loan.paidAmount = loan.totalAmount;
    } else {
      loan.status = "open";
    }
    await loan.save();
    res.json(loan);
  } catch (err) {
    next(err);
  }
};
