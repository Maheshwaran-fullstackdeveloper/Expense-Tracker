import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [transRes, statsRes, goalsRes, loansRes] = await Promise.all([
        API.get("/transactions"),
        API.get("/transactions/stats"),
        API.get("/goals"),
        API.get("/loans"),
      ]);
      setTransactions(transRes.data);
      setGoals(goalsRes.data);
      setLoans(loansRes.data);

      // Extract stats
      const income =
        statsRes.data.stats.find((s) => s._id === "income")?.total || 0;
      const expense =
        statsRes.data.stats.find((s) => s._id === "expense")?.total || 0;
      setStats({ income, expense, balance: income - expense });
      setCategoryBreakdown(statsRes.data.categoryBreakdown);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addTransaction = async (data) => {
    const response = await API.post("/transactions", data);
    setTransactions([response.data, ...transactions]);
    // Update stats optimistically or refetch
    fetchData();
  };

  const addGoal = async (formData) => {
    const response = await API.post("/goals", formData);
    setGoals([response.data, ...goals]);
    fetchData();
  };

  const addLoan = async (formData) => {
    const response = await API.post("/loans", formData);
    setLoans([response.data, ...loans]);
    fetchData();
  };

  const updateTransaction = async (id, data) => {
    const response = await API.put(`/transactions/${id}`, data);
    setTransactions(
      transactions.map((t) => (t._id === id ? response.data : t)),
    );
    fetchData();
  };

  const updateGoal = async (id, formData) => {
    const response = await API.put(`/goals/${id}`, formData);
    setGoals(goals.map((g) => (g._id === id ? response.data : g)));
    fetchData();
  };

  const updateLoan = async (id, formData) => {
    const response = await API.put(`/loans/${id}`, formData);
    setLoans(loans.map((l) => (l._id === id ? response.data : l)));
    fetchData();
  };

  const deleteTransaction = async (id) => {
    await API.delete(`/transactions/${id}`);
    setTransactions(transactions.filter((t) => t._id !== id));
    fetchData();
  };

  const deleteGoal = async (id) => {
    await API.delete(`/goals/${id}`);
    setGoals(goals.filter((g) => g._id !== id));
  };

  const recordLoanPayment = async (id, amount) => {
    const response = await API.patch(`/loans/${id}/pay`, { amount });
    setLoans(loans.map((l) => (l._id === id ? response.data : l)));
    fetchData();
  };

  const toggleLoanStatus = async (id) => {
    const response = await API.patch(`/loans/${id}/status`);
    setLoans(loans.map((l) => (l._id === id ? response.data : l)));
    fetchData();
  };

  const deleteLoan = async (id) => {
    await API.delete(`/loans/${id}`);
    setLoans(loans.filter((l) => l._id !== id));
  };

  const recordGoalContribution = async (id, amount) => {
    const response = await API.patch(`/goals/${id}/contribute`, { amount });
    setGoals(goals.map((g) => (g._id === id ? response.data : g)));
    fetchData();
  };

  const updateGoalStatus = async (id) => {
    const response = await API.patch(`/goals/${id}/status`);
    setGoals(goals.map((g) => (g._id === id ? response.data : g)));
    fetchData();
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        goals,
        loans,
        stats,
        categoryBreakdown,
        loading,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addGoal,
        deleteGoal,
        updateGoal,
        addLoan,
        deleteLoan,
        updateLoan,
        recordLoanPayment,
        toggleLoanStatus,
        recordGoalContribution,
        updateGoalStatus,
        refreshData: fetchData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
