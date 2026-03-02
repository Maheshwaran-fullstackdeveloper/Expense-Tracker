import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Loans from "./pages/Loans";
import GoalLogs from "./pages/GoalLogs";
import LoanLogs from "./pages/LoanLogs";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "var(--toast-bg)",
                  color: "var(--toast-text)",
                  border: "1px solid var(--toast-border)",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/"
                  element={
                    <Layout>
                      <Dashboard />
                    </Layout>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <Layout>
                      <Transactions />
                    </Layout>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <Layout>
                      <Goals />
                    </Layout>
                  }
                />
                <Route
                  path="/loans"
                  element={
                    <Layout>
                      <Loans />
                    </Layout>
                  }
                />
                <Route
                  path="/goal-logs"
                  element={
                    <Layout>
                      <GoalLogs />
                    </Layout>
                  }
                />
                <Route
                  path="/loan-logs"
                  element={
                    <Layout>
                      <LoanLogs />
                    </Layout>
                  }
                />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
