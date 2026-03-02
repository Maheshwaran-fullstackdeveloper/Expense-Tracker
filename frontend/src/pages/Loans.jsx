import { useData } from "../context/DataContext";
import {
  Plus,
  Trash2,
  Calendar,
  Loader2,
  TrendingDown,
  Edit2,
  Check,
  Banknote,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hash,
  History,
} from "lucide-react";
import { useState, useRef } from "react";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

const Loans = () => {
  const {
    loans,
    addLoan,
    deleteLoan,
    updateLoan,
    recordLoanPayment,
    toggleLoanStatus,
  } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [manualAmounts, setManualAmounts] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    totalAmount: "",
    monthlyPayment: "",
    description: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    paidAmount: "0",
    image: null,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
        toast.error("Please upload JPEG, PNG or WebP files only");
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      totalAmount: "",
      monthlyPayment: "",
      description: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      paidAmount: "0",
      image: null,
    });
    setPreview(null);
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("totalAmount", formData.totalAmount);
      data.append("monthlyPayment", formData.monthlyPayment);
      data.append("description", formData.description);
      data.append("startDate", formData.startDate);
      data.append("paidAmount", formData.paidAmount);
      if (formData.image) data.append("image", formData.image);

      if (editingId) {
        await updateLoan(editingId, data);
        toast.success("Loan profile updated!");
      } else {
        await addLoan(data);
        toast.success("Loan tracking initiated!");
      }
      resetForm();
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.message || "Process failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (loan) => {
    setEditingId(loan._id);
    setFormData({
      title: loan.title,
      totalAmount: loan.totalAmount,
      monthlyPayment: loan.monthlyPayment,
      description: loan.description || "",
      paidAmount: loan.paidAmount || 0,
      startDate: format(parseISO(loan.startDate), "yyyy-MM-dd"),
      image: null,
    });
    setPreview(
      loan.imageUrl && loan.imageUrl !== "default-product.jpg"
        ? `${API_BASE_URL}/${loan.imageUrl}`
        : null,
    );
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Abandon this loan tracker?")) {
      try {
        await deleteLoan(id);
        toast.success("Loan deleted");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleManualPayment = async (id) => {
    const amount = manualAmounts[id];
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await recordLoanPayment(id, Number(amount));
      toast.success("Payment recorded!");
      setManualAmounts({ ...manualAmounts, [id]: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  const currentMonth = format(new Date(), "yyyy-MM");

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-primary-50 dark:border-primary-900/30">
        <div>
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white tracking-tight mb-2 capitalize">
            Loan <span className="text-primary-500 font-bold">repayment</span>
          </h1>
          <p className="text-sky-400 dark:text-sky-300 text-[11px] font-bold flex items-center gap-2 capitalize">
            <Clock className="w-4 h-4" /> Track and clear your debts step by
            step.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/loan-logs"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all bg-white dark:bg-slate-800 border-2 border-primary-100 dark:border-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-700 shadow-sm active:scale-95 cursor-pointer"
          >
            <History className="w-5 h-5" />
            <span>EMI logs</span>
          </Link>
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 cursor-pointer ${showForm ? "bg-primary-50 dark:bg-primary-950/20 text-primary-500 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30" : "bg-primary-400 text-white hover:bg-primary-500 shadow-primary-400/20"}`}
          >
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Register new loan</span>
              </>
            )}
          </button>
        </div>
      </header>

      {showForm && (
        <div className="glass-card p-10 border-primary-100 dark:border-primary-900/30 bg-white dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 shadow-2xl shadow-primary-500/10 animate-in fade-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white border-b-4 border-primary-500 dark:border-primary-400 w-fit pb-2 italic capitalize">
              {editingId ? "Modify loan" : "New loan setup"}
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-primary-400 font-bold capitalize">
                  Loan title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. ICICI Personal Loan"
                  className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white placeholder:text-primary-200 dark:placeholder:text-primary-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-primary-400 font-bold capitalize">
                    Principal amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, totalAmount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white placeholder:text-primary-200 dark:placeholder:text-primary-800"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-primary-400 font-bold capitalize">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyPayment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyPayment: e.target.value,
                      })
                    }
                    className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-primary-400 font-bold capitalize">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white cursor-pointer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-primary-400 font-bold capitalize">
                    Amount already paid (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, paidAmount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-primary-400 font-bold capitalize">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Loan account # or bank details"
                  className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white placeholder:text-primary-200 dark:placeholder:text-primary-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 bg-primary-600 text-white rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center capitalize cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : editingId ? (
                "Update my loan"
              ) : (
                "Save and track"
              )}
            </button>
          </form>

          <div
            className="flex flex-col items-center justify-center border-4 border-dashed border-primary-100 dark:border-primary-900/30 rounded-[32px] p-12 hover:bg-primary-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            {preview ? (
              <div className="relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain bg-primary-50 dark:bg-slate-800"
                />
                <div className="absolute inset-0 bg-primary-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                  <ImageIcon className="w-12 h-12 text-white mb-2" />
                  <p className="text-white font-bold text-sm capitalize">
                    Update picture
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center group-hover:scale-105 transition-transform duration-500">
                <div className="w-24 h-24 bg-primary-100 dark:bg-primary-950/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-900 transition-colors">
                  <ImageIcon className="text-primary-500 w-10 h-10" />
                </div>
                <p className="text-2xl font-bold text-primary-900 dark:text-white mb-2 capitalize">
                  Add asset image
                </p>
                <p className="text-primary-400 dark:text-primary-600 font-bold text-[10px] capitalize">
                  JPEG or PNG
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loans.map((loan) => {
          const total = loan.totalAmount || 1;
          const paid = loan.paidAmount || 0;
          const remainingAmount = Math.max(0, total - paid);
          const progress =
            loan.status === "closed"
              ? 100
              : Math.min(100, Math.round((paid / total) * 100));
          const hasPaidThisMonth = loan.lastPaymentMonth === currentMonth;

          return (
            <div
              key={loan._id}
              className={`group bg-white dark:bg-slate-900 rounded-[40px] border-2 border-primary-50 dark:border-primary-900/20 overflow-hidden shadow-xl shadow-primary-500/5 transition-all hover:shadow-2xl hover:border-primary-200 dark:hover:border-primary-800 hover:-translate-y-2 flex flex-col ${loan.status === "closed" ? "bg-primary-50 dark:bg-primary-950/20 opacity-80" : ""}`}
            >
              {/* Asset Box Area */}
              <div className="relative h-56 bg-primary-100 dark:bg-slate-800 overflow-hidden border-b-2 border-primary-50 dark:border-primary-900/20">
                <img
                  src={
                    !loan.imageUrl || loan.imageUrl === "default-product.jpg"
                      ? "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format"
                      : `${API_BASE_URL}/${loan.imageUrl}?t=${new Date(loan.updatedAt).getTime()}`
                  }
                  alt={loan.title}
                  className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                />

                {/* Floating Notifications */}
                <div className="absolute top-6 left-6">
                  {loan.status === "open" && !hasPaidThisMonth && (
                    <div className="bg-primary-500 text-white text-[10px] px-4 py-2 rounded-full font-bold shadow-lg border-2 border-white animate-pulse capitalize">
                      Pending EMI
                    </div>
                  )}
                  {loan.status === "closed" && (
                    <div className="bg-green-500 text-white text-[10px] px-4 py-2 rounded-full font-bold shadow-lg border-2 border-white italic text-center capitalize">
                      Loan cleared
                    </div>
                  )}
                </div>

                <div className="absolute top-6 right-6 flex gap-2">
                  <button
                    onClick={() => startEdit(loan)}
                    className="w-10 h-10 bg-white/90 backdrop-blur text-primary-900 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-90 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(loan._id)}
                    className="w-10 h-10 bg-white/90 backdrop-blur text-primary-500 dark:text-primary-400 rounded-xl flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all shadow-sm active:scale-90 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col">
                <div className="mb-6 flex-grow text-center">
                  <h3 className="text-2xl font-bold text-primary-900 tracking-tight mb-2 capitalize">
                    {loan.title}
                  </h3>
                  <p className="text-sky-400 text-sm font-semibold italic capitalize leading-relaxed">
                    "{loan.description || "Active loan tracker"}"
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-bold text-primary-400 capitalize">
                    <span>Repayment progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2.5 bg-primary-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${progress >= 100 ? "bg-green-500" : "bg-primary-500"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-y-2 border-primary-50 dark:border-primary-900/20 mb-6 bg-primary-50/20 dark:bg-primary-950/10 px-4 rounded-3xl">
                  <div className="space-y-1">
                    <p className="text-[10px] text-sky-500 dark:text-sky-400 font-bold capitalize leading-none">
                      To pay
                    </p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      ₹{remainingAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right space-y-1 border-l-2 border-primary-100 dark:border-primary-900/30 pl-4">
                    <p className="text-[10px] text-sky-500 dark:text-sky-400 font-bold capitalize leading-none">
                      EMI
                    </p>
                    <p className="text-3xl font-bold text-primary-900 dark:text-white">
                      ₹{loan.monthlyPayment.toLocaleString()}
                    </p>
                  </div>
                </div>

                {loan.status === "open" ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => recordLoanPayment(loan._id)}
                        disabled={hasPaidThisMonth}
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-xl capitalize cursor-pointer ${hasPaidThisMonth ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30 cursor-default shadow-none" : "bg-primary-500 text-white hover:bg-black shadow-primary-500/10 active:scale-95"}`}
                      >
                        {hasPaidThisMonth ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" /> Monthly EMI
                            paid
                          </>
                        ) : (
                          <>
                            <Banknote className="w-5 h-5" /> Quick Pay ₹
                            {loan.monthlyPayment}
                          </>
                        )}
                      </button>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Enter amount(₹)"
                          value={manualAmounts[loan._id] || ""}
                          onChange={(e) =>
                            setManualAmounts({
                              ...manualAmounts,
                              [loan._id]: e.target.value,
                            })
                          }
                          className="flex-grow h-14 px-4 bg-primary-50 dark:bg-slate-800 border-2 border-primary-100 dark:border-primary-800 rounded-2xl outline-none focus:border-primary-500 font-semibold text-primary-900 dark:text-white transition-all text-sm"
                        />
                        <button
                          onClick={() => handleManualPayment(loan._id)}
                          className="px-6 h-14 bg-primary-500 text-white rounded-2xl font-bold hover:bg-primary-600 transition-all active:scale-95 capitalize shadow-sm text-sm cursor-pointer"
                        >
                          Pay
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleLoanStatus(loan._id)}
                      className="w-full text-[10px] font-bold text-primary-400 hover:text-primary-600 transition-colors text-center cursor-pointer opacity-50 hover:opacity-100 capitalize"
                    >
                      Close tracker
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900/30 p-5 rounded-3xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 text-green-600">
                      <CheckCircle2 className="w-6 h-6" />
                      <div>
                        <p className="text-xs font-bold capitalize">
                          Loan cleared
                        </p>
                        <p className="text-[10px] font-medium opacity-60 capitalize">
                          Balance paid off
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleLoanStatus(loan._id)}
                      className="bg-white border-2 border-green-500 text-green-600 text-[9px] font-bold px-3 py-2 rounded-xl hover:bg-green-50 transition-all active:scale-90 capitalize cursor-pointer"
                    >
                      Undo
                    </button>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between text-[11px] text-primary-700 dark:text-primary-400 font-bold border-t border-primary-50 dark:border-primary-900/20 pt-4 capitalize">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Commenced:{" "}
                      {loan.startDate
                        ? format(parseISO(loan.startDate), "MMM yyyy")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary-800">
                    <Hash className="w-3 h-3" />
                    <span>Principal: ₹{loan.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loans.length === 0 && (
        <div className="text-center py-32 bg-primary-50/30 dark:bg-slate-900/50 rounded-[40px] border-4 border-dashed border-primary-50 dark:border-primary-900/30">
          <TrendingDown className="w-16 h-16 text-primary-100 dark:text-primary-900 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 capitalize">
            Debt-free zone
          </h2>
          <p className="text-primary-400 font-medium max-w-sm mx-auto text-xs capitalize">
            Add a loan to start tracking.
          </p>
        </div>
      )}
    </div>
  );
};

export default Loans;
