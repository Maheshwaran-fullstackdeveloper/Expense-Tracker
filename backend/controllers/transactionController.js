import Transaction from "../models/Transaction.js";

// @desc    Add new transaction (Income or Expense)
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, date, notes } = req.body;

    if (!type || !category || !amount) {
      res.status(400);
      throw new Error("Type, Category, and Amount are required");
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      category,
      amount,
      date,
      notes,
    });

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error("Transaction not found");
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("User not authorized");
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: "Transaction deleted" });
  } catch (err) {
    next(err);
  }
};

export const getTransactionStats = async (req, res, next) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const categoryBreakdown = await Transaction.aggregate([
      { $match: { user: req.user._id, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ stats, categoryBreakdown });
  } catch (err) {
    next(err);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Update request for transaction: ${id}`);

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      console.log(`Transaction not found: ${id}`);
      res.status(404);
      throw new Error("Transaction not found");
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      console.log(
        `Unauthorized update attempt for: ${id} by user: ${req.user._id}`,
      );
      res.status(401);
      throw new Error("User not authorized");
    }

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.user;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    console.log("Cleaned update data:", JSON.stringify(updateData));

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    console.log(`Successfully updated transaction: ${id}`);
    res.json(updatedTransaction);
  } catch (err) {
    console.error(`Error updating transaction ${req.params.id}:`, err);
    next(err);
  }
};
