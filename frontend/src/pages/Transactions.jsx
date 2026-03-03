import { useData } from "../context/DataContext";
import {
  format,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import {
  Search,
  Filter,
  Trash2,
  Calendar,
  Edit2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const Transactions = () => {
  const { transactions, deleteTransaction, updateTransaction } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedMonth, setSelectedMonth] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransactions = transactions
    .filter((t) => {
      const tDate = parseISO(t.date);
      const matchesSearch =
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === "all" || t.type === filterType;
      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        matchesDate = isWithinInterval(tDate, {
          start: parseISO(dateRange.start),
          end: parseISO(dateRange.end),
        });
      } else if (dateRange.start) {
        matchesDate = tDate >= parseISO(dateRange.start);
      } else if (dateRange.end) {
        matchesDate = tDate <= parseISO(dateRange.end);
      }
      let matchesMonth = true;
      if (selectedMonth) {
        const monthStart = startOfMonth(parseISO(`${selectedMonth}-01`));
        const monthEnd = endOfMonth(monthStart);
        matchesMonth = isWithinInterval(tDate, {
          start: monthStart,
          end: monthEnd,
        });
      }
      return matchesSearch && matchesType && matchesDate && matchesMonth;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
        toast.success("Transaction deleted");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const startEdit = (t) => {
    setEditingId(t._id);
    setEditData({ ...t, date: format(new Date(t.date), "yyyy-MM-dd") });
  };

  const handleUpdate = async () => {
    try {
      // Preserve the original time if only the date was changed via the UI
      const originalDate = new Date(
        transactions.find((t) => t._id === editingId).date,
      );
      const [year, month, day] = editData.date.split("-");

      const finalDate = new Date(
        year,
        month - 1,
        day,
        originalDate.getHours(),
        originalDate.getMinutes(),
        originalDate.getSeconds(),
      );

      await updateTransaction(editingId, { ...editData, date: finalDate });
      setEditingId(null);
      toast.success("Transaction updated!");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white tracking-tight">
            Transactions History
          </h1>
          <p className="text-primary-500 dark:text-primary-400 font-semibold">
            Review and manage all your income and expenses.
          </p>
        </div>
      </header>

      {/* Totals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border-green-100 bg-white dark:bg-slate-900/50 dark:border-green-900/30">
          <p className="text-sm font-bold text-green-600 dark:text-green-400 mb-1">
            Total Income
          </p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            +₹{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="glass-card p-6 border-red-100 bg-white dark:bg-slate-900/50 dark:border-red-900/30">
          <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">
            Total Expense
          </p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            -₹{totalExpense.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-primary-100 bg-white dark:bg-slate-900 dark:border-primary-900/30">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary-500" />
              Filters
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-primary-600 px-1 font-bold">
                  Search
                </label>
                <div className="input-group">
                  <Search className="input-icon w-4 h-4 ml-[-4px]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Category, notes..."
                    className="glass-input h-10 text-sm bg-primary-50/30 dark:bg-slate-800/50 dark:text-white font-semibold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-primary-600 px-1 font-bold">
                  Select Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full glass-input h-10 text-sm cursor-pointer font-bold bg-primary-50/30 dark:bg-slate-800/50 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-primary-600 px-1 font-bold">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="w-full glass-input h-10 text-xs cursor-pointer font-bold bg-primary-50/30 dark:bg-slate-800/50 dark:text-white"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="w-full glass-input h-10 text-xs cursor-pointer font-bold bg-primary-50/30 dark:bg-slate-800/50 dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-primary-600 px-1 font-bold">
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {["all", "income", "expense"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                        filterType === type
                          ? "bg-primary-500 text-white"
                          : "bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-slate-800 dark:text-primary-400 dark:hover:bg-slate-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setDateRange({ start: "", end: "" });
                  setSelectedMonth("");
                  setCurrentPage(1);
                }}
                className="w-full mt-4 text-xs text-primary-600 hover:text-primary-800 font-bold underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="glass-card overflow-hidden bg-white dark:bg-slate-900 border-primary-100 dark:border-primary-900/30 shadow-xl shadow-primary-500/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-primary-100 dark:border-primary-900/30">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-primary-800 dark:text-primary-200">
                      Transaction
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-primary-800 dark:text-primary-200">
                      Type
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-primary-800 dark:text-primary-200">
                      Date
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-primary-800 dark:text-primary-200">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-primary-800 dark:text-primary-200 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((t) => (
                    <tr
                      key={t._id}
                      className="border-b border-primary-50 dark:border-primary-900/20 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        {editingId === t._id ? (
                          <input
                            className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800 rounded p-1 text-primary-900 dark:text-white text-sm w-full font-bold focus:ring-1 focus:ring-primary-500 outline-none"
                            value={editData.category}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                category: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <div>
                            <p className="text-primary-900 dark:text-white font-bold text-sm capitalize">
                              {t.category}
                            </p>
                            {t.notes && (
                              <p className="text-sky-500 dark:text-sky-400 text-xs mt-0.5 italic font-bold">
                                {t.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === t._id ? (
                          <select
                            className="bg-white dark:bg-slate-800 text-primary-900 dark:text-white text-xs border border-primary-200 dark:border-primary-800 rounded p-1 cursor-pointer font-bold focus:ring-1 focus:ring-primary-500 outline-none"
                            value={editData.type}
                            onChange={(e) =>
                              setEditData({ ...editData, type: e.target.value })
                            }
                          >
                            <option value="expense">expense</option>
                            <option value="income">income</option>
                          </select>
                        ) : (
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${t.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                          >
                            {t.type}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-primary-600 font-bold whitespace-nowrap">
                        {editingId === t._id ? (
                          <input
                            type="date"
                            className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800 rounded p-1 text-primary-900 dark:text-white text-xs cursor-pointer font-bold outline-none focus:ring-1 focus:ring-primary-500"
                            value={editData.date}
                            onChange={(e) =>
                              setEditData({ ...editData, date: e.target.value })
                            }
                          />
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-primary-900 dark:text-white font-bold">
                              {format(new Date(t.date), "MMM dd, yyyy")}
                            </span>
                            <span className="text-sky-500 dark:text-sky-400 text-[10px] font-bold">
                              {format(new Date(t.date), "hh:mm a 'IST'")}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === t._id ? (
                          <input
                            type="number"
                            className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800 rounded p-1 text-primary-900 dark:text-white text-sm w-24 font-bold"
                            value={editData.amount}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                amount: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p
                            className={`font-semibold text-sm tracking-tight ${t.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {t.type === "income" ? "+" : "-"}₹
                            {t.amount.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === t._id ? (
                            <>
                              <button
                                onClick={handleUpdate}
                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 text-primary-400 hover:bg-primary-50 rounded-lg cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(t)}
                                className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors rounded-lg cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(t._id)}
                                className="p-2 text-primary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && (
                <div className="py-20 text-center text-primary-300 dark:text-primary-800 italic">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="font-bold">No transactions found</p>
                </div>
              )}
            </div>
            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-primary-50/30 dark:bg-slate-800/50 border-t border-primary-100 dark:border-primary-900/30 flex items-center justify-between">
                <p className="text-[10px] font-bold text-sky-500 dark:text-sky-400">
                  Showing{" "}
                  <span className="text-primary-900 dark:text-white">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-primary-900 dark:text-white">
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredTransactions.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-primary-900 dark:text-white">
                    {filteredTransactions.length}
                  </span>{" "}
                  results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-primary-100 dark:border-primary-900/30 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-primary-900 dark:text-white" />
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 &&
                          pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "hover:bg-white dark:hover:bg-slate-700 text-primary-500"}`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span key={pageNum} className="text-primary-300">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-primary-100 dark:border-primary-900/30 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-primary-900 dark:text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
