import { useData } from "../context/DataContext";
import {
  format,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  Search,
  Filter,
  History,
  ArrowLeft,
  Calendar,
  Banknote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoanLogs = () => {
  const { transactions } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions for Loan Repayments
  const loanRepayments = transactions.filter(
    (t) => t.category === "Loan Repayment",
  );

  const filteredLogs = loanRepayments
    .filter((t) => {
      const tDate = parseISO(t.date);
      const matchesSearch =
        t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase());

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

      return matchesSearch && matchesDate && matchesMonth;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-primary-50 dark:border-primary-900/30">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/loans")}
            className="p-3 bg-white dark:bg-slate-800 border border-primary-100 dark:border-primary-900/30 rounded-2xl hover:bg-primary-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-primary-900 dark:text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-white tracking-tight italic">
              Loan <span className="text-sky-400 font-bold">history</span>
            </h1>
            <p className="text-primary-400 dark:text-primary-500 font-bold text-sm italic">
              Detailed tracking of your EMI repayments and debt clearance.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-primary-100 dark:border-primary-900/30 bg-white dark:bg-slate-900 shadow-xl shadow-primary-500/5 rounded-3xl">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4 flex items-center gap-2 italic">
              <Filter className="w-5 h-5 text-sky-400" />
              Filter Records
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-primary-400 font-bold uppercase tracking-wider italic">
                  Search
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300 group-focus-within:text-sky-400 transition-colors" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search records..."
                    className="w-full h-12 pl-11 pr-4 bg-primary-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-sky-400 rounded-2xl outline-none transition-all font-semibold text-primary-900 dark:text-white placeholder:text-primary-200 dark:placeholder:text-primary-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-primary-400 font-bold uppercase tracking-wider italic">
                  Specific Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-12 px-4 bg-primary-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-sky-400 rounded-2xl outline-none transition-all font-bold text-primary-900 dark:text-white cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-primary-400 font-bold uppercase tracking-wider italic">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="w-full h-12 px-4 bg-primary-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-sky-400 rounded-2xl outline-none transition-all font-bold text-primary-900 dark:text-white cursor-pointer"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="w-full h-12 px-4 bg-primary-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-sky-400 rounded-2xl outline-none transition-all font-bold text-primary-900 dark:text-white cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedMonth("");
                  setDateRange({ start: "", end: "" });
                  setCurrentPage(1);
                }}
                className="w-full py-4 text-xs font-bold text-primary-400 dark:text-primary-600 hover:text-sky-400 transition-all underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </aside>

        {/* List Section */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-primary-50 dark:border-primary-900/30 overflow-hidden shadow-xl shadow-primary-500/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-primary-50 dark:border-primary-900/30">
                  <tr>
                    <th className="px-8 py-5 text-xs font-bold text-primary-400 uppercase tracking-widest text-sky-400">
                      Payment Detail
                    </th>
                    <th className="px-8 py-5 text-xs font-bold text-primary-400 uppercase tracking-widest text-sky-400">
                      Date
                    </th>
                    <th className="px-8 py-5 text-xs font-bold text-primary-400 uppercase tracking-widest text-right text-sky-400">
                      Total Paid
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-b border-primary-50 dark:border-primary-900/10 hover:bg-sky-50/10 dark:hover:bg-slate-800/50 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary-500 dark:text-primary-400 group-hover:bg-sky-400 group-hover:text-white transition-all shadow-sm">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-primary-900 dark:text-white font-bold text-sm capitalize">
                              {log.notes?.replace("Repayment for: ", "") ||
                                "Loan Payment"}
                            </p>
                            <p className="text-sky-500 dark:text-sky-400 text-[10px] font-bold uppercase tracking-tighter italic">
                              EMI Repayment Confirmed
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-primary-700 dark:text-primary-300">
                          {format(parseISO(log.date), "MMM dd, yyyy")}
                        </p>
                        <p className="text-[10px] text-sky-500 dark:text-sky-400 font-bold">
                          {format(parseISO(log.date), "hh:mm a 'IST'")}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className="text-lg font-black text-red-500 dark:text-red-400">
                          -₹{log.amount.toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="py-32 text-center">
                  <div className="w-20 h-20 bg-primary-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="w-10 h-10 text-primary-100 dark:text-primary-900" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2 italic">
                    No records found
                  </h3>
                  <p className="text-primary-400 dark:text-primary-500 text-sm font-medium">
                    Try different search terms or dates
                  </p>
                </div>
              )}
            </div>
            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="px-8 py-5 bg-primary-50/10 dark:bg-slate-800/20 border-t border-primary-50 dark:border-primary-900/10 flex items-center justify-between">
                <p className="text-[10px] font-bold text-sky-500 dark:text-sky-400 italic">
                  Showing{" "}
                  <span className="text-primary-900 dark:text-white">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-primary-900 dark:text-white">
                    {Math.min(startIndex + itemsPerPage, filteredLogs.length)}
                  </span>{" "}
                  of{" "}
                  <span className="text-primary-900 dark:text-white">
                    {filteredLogs.length}
                  </span>{" "}
                  entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-primary-50 dark:border-primary-900/10 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-primary-600 dark:text-primary-400" />
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
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === pageNum ? "bg-sky-400 text-white shadow-lg shadow-sky-400/20" : "hover:bg-white dark:hover:bg-slate-800 text-primary-400"}`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span key={pageNum} className="text-primary-200">
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
                    className="p-2 rounded-xl border border-primary-50 dark:border-primary-900/10 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 text-primary-600 dark:text-primary-400" />
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

export default LoanLogs;
