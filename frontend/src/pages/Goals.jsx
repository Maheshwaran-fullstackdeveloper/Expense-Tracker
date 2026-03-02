import { useData } from "../context/DataContext";
import {
  Plus,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Loader2,
  TrendingDown,
  Edit2,
  Target,
  Clock,
  CheckCircle2,
  Wallet,
  Coins,
  History,
} from "lucide-react";
import { useState, useRef } from "react";
import { format, differenceInDays, differenceInMonths } from "date-fns";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

const Goals = () => {
  const {
    goals,
    addGoal,
    deleteGoal,
    updateGoal,
    recordGoalContribution,
    updateGoalStatus,
  } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [manualAmounts, setManualAmounts] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    deadline: format(
      new Date(new Date().setMonth(new Date().getMonth() + 3)),
      "yyyy-MM-dd",
    ),
    savedAmount: "0",
    monthlySavingsAmount: "",
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
      description: "",
      targetAmount: "",
      deadline: format(
        new Date(new Date().setMonth(new Date().getMonth() + 3)),
        "yyyy-MM-dd",
      ),
      savedAmount: "0",
      monthlySavingsAmount: "",
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
      data.append("description", formData.description);
      data.append("targetAmount", formData.targetAmount);
      data.append("deadline", formData.deadline);
      data.append("savedAmount", formData.savedAmount);
      data.append("monthlySavingsAmount", formData.monthlySavingsAmount);
      if (formData.image) data.append("image", formData.image);

      if (editingId) {
        await updateGoal(editingId, data);
        toast.success("Goal updated!");
      } else {
        await addGoal(data);
        toast.success("Goal created!");
      }
      resetForm();
    } catch (err) {
      toast.error("Process failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (goal) => {
    setEditingId(goal._id);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount || 0,
      monthlySavingsAmount: goal.monthlySavingsAmount || "",
      deadline: format(new Date(goal.deadline), "yyyy-MM-dd"),
      image: null,
    });
    setPreview(
      goal.imageUrl && goal.imageUrl !== "default-product.jpg"
        ? `${API_BASE_URL}/${goal.imageUrl}`
        : null,
    );
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this goal?")) {
      try {
        await deleteGoal(id);
        toast.success("Goal removed");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleManualSave = async (id) => {
    const amount = manualAmounts[id];
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await recordGoalContribution(id, Number(amount));
      toast.success("Contribution recorded!");
      setManualAmounts({ ...manualAmounts, [id]: "" });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to record contribution",
      );
    }
  };

  const currentMonth = format(new Date(), "yyyy-MM");

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-primary-50 dark:border-primary-900/30">
        <div>
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white tracking-tight mb-1">
            Savings <span className="text-primary-500 font-bold">Goals</span>
          </h1>
          <p className="text-sky-400 dark:text-sky-300 text-[11px] font-bold flex items-center gap-2 capitalize">
            <Clock className="w-4 h-4" /> Every rupee counts toward your dreams.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/goal-logs"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all bg-white dark:bg-slate-800 border-2 border-primary-100 dark:border-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-700 shadow-sm active:scale-95 cursor-pointer"
          >
            <History className="w-5 h-5" />
            <span>History</span>
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
                <span>Create new goal</span>
              </>
            )}
          </button>
        </div>
      </header>

      {showForm && (
        <div className="glass-card p-8 border-primary-100 dark:border-primary-900/30 bg-white dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 shadow-2xl shadow-primary-500/10 animate-in fade-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white border-b-4 border-primary-300 dark:border-primary-700 w-fit pb-2 italic capitalize">
              {editingId ? "Edit goal" : "New milestone"}
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-primary-400 font-bold capitalize">
                  Goal title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. New iPhone 16 Pro"
                  className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white placeholder:text-primary-200 dark:placeholder:text-primary-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-primary-400 font-bold capitalize">
                    Target amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-primary-400 font-bold capitalize">
                    Monthly savings commit (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlySavingsAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlySavingsAmount: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-primary-400 font-bold capitalize">
                    Target deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white cursor-pointer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-primary-400 font-bold capitalize">
                    Initial amount already saved (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.savedAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, savedAmount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full h-14 px-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-semibold text-primary-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-primary-400 font-bold capitalize">
                  Notes / Inspiration
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Why are you saving for this?"
                  className="w-full h-24 p-6 rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-medium text-primary-900 dark:text-white resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 bg-primary-900 dark:bg-primary-600 text-white rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center capitalize cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : editingId ? (
                "Update my goal"
              ) : (
                "Commit to saving"
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
                  <p className="text-white font-bold text-sm">Change image</p>
                </div>
              </div>
            ) : (
              <div className="text-center group-hover:scale-105 transition-transform duration-500">
                <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-900 transition-colors">
                  <ImageIcon className="text-primary-500 w-10 h-10" />
                </div>
                <p className="text-2xl font-bold text-primary-900 dark:text-white mb-2 capitalize">
                  Drop item photo
                </p>
                <p className="text-primary-400 dark:text-primary-600 text-[10px] font-bold">
                  JPEG, PNG or WebP (Max 2MB)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {goals.map((goal) => {
          const saved = goal.savedAmount || 0;
          const target = goal.targetAmount || 1; // Prevent division by zero
          const progress =
            goal.status === "completed"
              ? 100
              : Math.min(100, Math.round((saved / target) * 100));
          const remaining = Math.max(0, target - saved);
          const daysLeft = differenceInDays(
            new Date(goal.deadline),
            new Date(),
          );
          const monthsLeft = Math.max(
            1,
            differenceInMonths(new Date(goal.deadline), new Date()),
          );
          const recommendedSaving =
            remaining > 0 ? Math.ceil(remaining / monthsLeft) : 0;
          const hasContributedThisMonth =
            goal.lastContributionMonth === currentMonth;

          return (
            <div
              key={goal._id}
              className={`group bg-white dark:bg-slate-900 rounded-[40px] border-2 border-primary-50 dark:border-primary-900/20 overflow-hidden shadow-xl shadow-primary-500/5 transition-all hover:shadow-2xl hover:border-primary-200 dark:hover:border-primary-800 hover:-translate-y-2 flex flex-col ${goal.status === "completed" ? "opacity-80" : ""}`}
            >
              {/* Card Image Area */}
              <div className="relative h-64 bg-primary-50 dark:bg-slate-800 overflow-hidden border-b-2 border-primary-50 dark:border-primary-900/20">
                <img
                  src={
                    !goal.imageUrl || goal.imageUrl === "default-product.jpg"
                      ? "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format"
                      : `${API_BASE_URL}/${goal.imageUrl}?t=${new Date(goal.updatedAt).getTime()}`
                  }
                  alt={goal.title}
                  className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                />

                {/* Floating Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  {goal.status === "active" && !hasContributedThisMonth && (
                    <div className="bg-primary-400 text-white text-[10px] px-4 py-2 rounded-full shadow-lg animate-bounce mt-2 font-bold capitalize">
                      Saving due
                    </div>
                  )}
                  {goal.status === "completed" && (
                    <div className="bg-green-500 text-white text-[10px] px-4 py-2 rounded-full font-bold shadow-lg capitalize">
                      Goal achieved
                    </div>
                  )}
                </div>

                <div className="absolute top-6 right-6 flex gap-2">
                  <button
                    onClick={() => startEdit(goal)}
                    className="w-10 h-10 bg-white/90 backdrop-blur text-primary-900 rounded-xl flex items-center justify-center hover:bg-primary-900 hover:text-white transition-all cursor-pointer shadow-sm active:scale-90"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal._id)}
                    className="w-10 h-10 bg-white/90 backdrop-blur text-primary-400 rounded-xl flex items-center justify-center hover:bg-primary-400 hover:text-white transition-all cursor-pointer shadow-sm active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content Area */}
              <div className="p-8 space-y-6 flex-grow flex flex-col">
                <div className="flex-grow text-center">
                  <h3 className="text-2xl font-bold text-primary-400 tracking-tight mb-2 line-clamp-1 group-hover:text-primary-500 transition-colors capitalize">
                    {goal.title}
                  </h3>
                  <p className="text-sky-400 text-sm line-clamp-2 h-10 leading-relaxed font-semibold italic">
                    "
                    {goal.description ||
                      "Every rupee counts towards your dreams."}
                    "
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-primary-400 capitalize">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2.5 bg-primary-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${progress >= 100 ? "bg-green-500" : "bg-primary-400"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y-2 border-primary-50 dark:border-primary-900/20">
                  <div>
                    <p className="text-[10px] text-sky-500 dark:text-sky-400 font-bold capitalize mb-1">
                      Saved
                    </p>
                    <p className="text-3xl font-bold text-primary-900 dark:text-white">
                      ₹{saved.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-sky-500 dark:text-sky-400 font-bold capitalize mb-1">
                      Target
                    </p>
                    <p className="text-3xl font-bold text-primary-900 dark:text-white">
                      ₹{target.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {goal.status === "active" ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-[11px] text-primary-400 font-bold capitalize">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Monthly Portion
                      </span>
                      <span className="font-bold">
                        ₹{recommendedSaving.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() =>
                          recordGoalContribution(goal._id, recommendedSaving)
                        }
                        disabled={hasContributedThisMonth}
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all capitalize cursor-pointer ${hasContributedThisMonth ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30 cursor-default shadow-none" : "bg-primary-400 text-white hover:bg-primary-500 shadow-xl shadow-primary-400/20 active:scale-95"}`}
                      >
                        {hasContributedThisMonth ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Monthly portion saved</span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-5 h-5" />
                            <span>Quick Save ₹{recommendedSaving}</span>
                          </>
                        )}
                      </button>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Enter amount (₹)"
                          value={manualAmounts[goal._id] || ""}
                          onChange={(e) =>
                            setManualAmounts({
                              ...manualAmounts,
                              [goal._id]: e.target.value,
                            })
                          }
                          className="flex-grow h-14 px-4 bg-primary-50 dark:bg-slate-800 border-2 border-primary-200 dark:border-primary-800 rounded-2xl outline-none focus:border-primary-400 font-semibold text-primary-900 dark:text-white transition-all text-sm"
                        />
                        <button
                          onClick={() => handleManualSave(goal._id)}
                          className="px-6 h-14 bg-primary-400 text-white rounded-2xl font-bold hover:bg-primary-500 transition-all active:scale-95 capitalize shadow-sm text-sm cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => updateGoalStatus(goal._id)}
                      className="w-full text-[10px] font-bold text-primary-400 hover:text-primary-600 transition-colors py-1 opacity-60 hover:opacity-100 cursor-pointer capitalize"
                    >
                      Finish goal early
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-100 dark:border-green-900/30 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 text-green-600">
                      <CheckCircle2 className="w-6 h-6" />
                      <p className="text-sm font-bold italic capitalize">
                        Goal achieved!
                      </p>
                    </div>
                    <button
                      onClick={() => updateGoalStatus(goal._id)}
                      className="bg-green-600 text-white text-[10px] font-bold px-3 py-2 rounded-xl hover:bg-green-700 cursor-pointer active:scale-90 capitalize"
                    >
                      Undo
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t-2 border-primary-50 dark:border-primary-900/20">
                  <div className="flex items-center gap-2 text-primary-600 font-bold">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[11px] capitalize">
                      Achievement:{" "}
                      {goal.deadline
                        ? format(new Date(goal.deadline), "MMM yyyy")
                        : "N/A"}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] font-bold px-3 py-1 rounded-full ${daysLeft > 0 ? "text-primary-700 bg-primary-100 font-bold" : "text-red-600 bg-red-100 font-bold border border-red-200"} capitalize`}
                  >
                    {daysLeft > 0 ? `${daysLeft} days to go` : "Time ended"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[40px] border-4 border-dashed border-primary-50 dark:border-primary-900/30">
          <TrendingDown className="w-16 h-16 text-primary-100 dark:text-primary-900 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 capitalize">
            No active goals yet?
          </h2>
          <p className="text-primary-400 font-medium max-w-sm mx-auto text-xs">
            Add a dream to start tracking your journey.
          </p>
        </div>
      )}
    </div>
  );
};

export default Goals;
