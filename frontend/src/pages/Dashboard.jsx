import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Plus,
  X,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, categoryBreakdown, transactions, addTransaction } = useData();
  const { isDarkMode } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Quick Form State
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    notes: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const COLORS = [
    "#0ea5e9",
    "#8b5cf6",
    "#f43f5e",
    "#10b981",
    "#f59e0b",
    "#6366f1",
  ];

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addTransaction(formData);
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        notes: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
      setShowForm(false);
      toast.success("Transaction added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add transaction");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white tracking-tight">
            Hello, {user?.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-primary-500 dark:text-primary-400 font-medium">
            Here's what's happening with your money today.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 w-fit cursor-pointer shadow-lg active:scale-95 transition-all px-6 py-3 rounded-2xl font-bold text-white capitalize ${
            showForm
              ? "bg-red-500 hover:bg-red-600 shadow-red-400/20"
              : "bg-primary-500 hover:bg-primary-600 shadow-primary-400/20"
          }`}
        >
          {showForm ? (
            <>
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>New transaction</span>
            </>
          )}
        </button>
      </header>

      {/* Form Overlay */}
      {showForm && (
        <div className="glass-card p-6 border-primary-100 dark:border-primary-900/30 bg-white/70 dark:bg-slate-900/70 animate-in fade-in slide-in-from-top-2 duration-300">
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end"
          >
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-primary-400 dark:text-primary-500 capitalize">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full glass-input h-10 py-0 cursor-pointer bg-white dark:bg-slate-800 rounded-xl border-primary-100 dark:border-primary-800 px-3 outline-none focus:border-primary-500 transition-all font-semibold text-primary-900 dark:text-white capitalize"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-primary-400 dark:text-primary-500 capitalize">
                Amount (₹)
              </label>
              <input
                type="number"
                placeholder="₹0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full glass-input h-10 rounded-xl border-primary-100 dark:border-primary-800 px-4 outline-none focus:border-primary-500 transition-all font-semibold text-primary-900 dark:text-white bg-white dark:bg-slate-800"
                required
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-primary-400 dark:text-primary-500 capitalize">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Food, Salary"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full glass-input h-10 rounded-xl border-primary-100 dark:border-primary-800 px-4 outline-none focus:border-primary-500 transition-all font-semibold text-primary-900 dark:text-white bg-white dark:bg-slate-800"
                required
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-primary-400 dark:text-primary-500 capitalize">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full glass-input h-10 cursor-pointer rounded-xl border-primary-100 dark:border-primary-800 px-4 outline-none focus:border-primary-500 transition-all font-semibold text-primary-900 dark:text-white bg-white dark:bg-slate-800"
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-primary-400 dark:text-primary-500 capitalize">
                Notes
              </label>
              <input
                type="text"
                placeholder="..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full glass-input h-10 rounded-xl border-primary-100 dark:border-primary-800 px-4 outline-none focus:border-primary-500 transition-all font-semibold text-primary-900 dark:text-white bg-white dark:bg-slate-800"
              />
            </div>
            <div className="pb-0.5">
              <button
                disabled={isAdding}
                className="w-full h-10 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all active:scale-95 shadow-md shadow-primary-500/10 capitalize"
              >
                {isAdding ? "..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-start justify-between bg-white dark:bg-slate-900 border border-primary-50 dark:border-primary-900/30 shadow-sm rounded-3xl transition-all hover:shadow-md">
          <div>
            <p className="text-primary-500 dark:text-primary-400 font-medium">
              Total balance
            </p>
            <h3
              className={`text-3xl font-bold mt-1 ${stats.balance >= 0 ? "text-primary-900 dark:text-white" : "text-red-500 dark:text-red-400"}`}
            >
              ₹{stats.balance.toLocaleString()}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-sky-500 dark:text-sky-400 text-xs font-bold capitalize">
              <CreditCard className="w-4 h-4" />
              <span>Real-time update</span>
            </div>
          </div>
          <div className="p-3 bg-primary-50 dark:bg-primary-950/50 rounded-2xl">
            <Wallet className="text-primary-600 dark:text-primary-400 w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-start justify-between bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 shadow-sm rounded-3xl transition-all hover:shadow-md">
          <div>
            <p className="text-green-700 dark:text-green-400 font-medium font-bold">
              Total income
            </p>
            <h3 className="text-3xl font-bold mt-1 text-green-600 dark:text-green-300">
              +₹{stats.income.toLocaleString()}
            </h3>
            <div className="mt-4 flex items-center gap-1 text-green-500 dark:text-green-700 text-xs font-bold capitalize">
              <TrendingUp className="w-4 h-4" />
              <span>Lifetime earnings</span>
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <ArrowUpRight className="text-green-500 w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-start justify-between bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 shadow-sm rounded-3xl transition-all hover:shadow-md">
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium font-bold">
              Total spending
            </p>
            <h3 className="text-3xl font-bold text-red-600 dark:text-red-300 mt-1">
              -₹{stats.expense.toLocaleString()}
            </h3>
            <div className="mt-4 flex items-center gap-1 text-red-500 dark:text-red-700 text-xs font-bold capitalize">
              <TrendingDown className="w-4 h-4" />
              <span>Total outflow</span>
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <ArrowDownRight className="text-red-500 w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="glass-card p-8 bg-white dark:bg-slate-900 border border-primary-50 dark:border-primary-900/30 shadow-sm rounded-[32px]">
          <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-6 flex items-center gap-2 capitalize">
            Spending{" "}
            <span className="text-primary-400 dark:text-primary-500 font-medium">
              analysis
            </span>
          </h2>
          <div className="h-64">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="total"
                    nameKey="_id"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
                      border: "none",
                      borderRadius: "16px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      padding: "12px",
                    }}
                    itemStyle={{
                      color: isDarkMode ? "#f0f9ff" : "#0c4a6e",
                      fontWeight: "bold",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-sky-500/40 dark:text-sky-400/30">
                <p className="font-bold text-[10px] capitalize">
                  No data available
                </p>
              </div>
            )}
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {categoryBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-1 p-2 bg-primary-50/50 dark:bg-slate-800/50 rounded-xl border border-primary-50 dark:border-primary-800/30"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></div>
                  <span className="text-[10px] font-bold text-primary-400 dark:text-primary-500 capitalize truncate">
                    {item._id}
                  </span>
                </div>
                <p className="text-sm font-bold text-primary-900 dark:text-white ml-4">
                  ₹{item.total.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="glass-card p-8 bg-white dark:bg-slate-900 border border-primary-50 dark:border-primary-900/30 shadow-sm rounded-[32px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary-900 dark:text-white capitalize">
              Recent{" "}
              <span className="text-primary-400 dark:text-primary-500 font-medium tracking-tight">
                activity
              </span>
            </h2>
            <Link
              to="/transactions"
              className="text-xs font-bold text-primary-500 hover:text-primary-700 capitalize"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.slice(0, 5).map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${t.type === "income" ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"}`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary-900 capitalize">
                      {t.category}
                    </h4>
                    <p className="text-[10px] text-sky-500 dark:text-sky-400 font-bold capitalize">
                      {format(new Date(t.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {t.type === "income" ? "+" : "-"}₹
                    {t.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-sky-500 dark:text-sky-400 font-bold truncate max-w-[120px] italic capitalize">
                    {t.notes || "No notes"}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-20 text-primary-200">
                <p className="text-xs font-bold capitalize">
                  No recent activity
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
