import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet, Mail, Lock, LogIn, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f0f9ff] dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md glass-card p-8 md:p-10 animate-in fade-in zoom-in-95 duration-300 bg-white dark:bg-slate-900 shadow-2xl shadow-primary-500/10 border-primary-100 dark:border-primary-900/30">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/20 mb-4">
            <Wallet className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white uppercase tracking-tighter">
            Welcome Back
          </h1>
          <p className="text-primary-500 mt-2 text-sm text-center font-bold">
            Sign in to manage your daily expenses
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-primary-700 dark:text-primary-400 ml-1">
              Email Address
            </label>
            <div className="input-group">
              <Mail className="input-icon w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input h-12 font-semibold bg-primary-50/20 dark:bg-slate-800/50 text-primary-900 dark:text-white border-primary-200 dark:border-primary-800 focus:border-primary-500"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-primary-700 dark:text-primary-400 ml-1">
              Password
            </label>
            <div className="input-group">
              <Lock className="input-icon w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input h-12 font-semibold bg-primary-50/20 dark:bg-slate-800/50 text-primary-900 dark:text-white border-primary-200 dark:border-primary-800 focus:border-primary-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary h-12 flex items-center justify-center gap-2 mt-2 cursor-pointer font-bold uppercase tracking-widest"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-primary-600 text-sm font-bold">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary-500 hover:text-primary-700 font-extrabold underline cursor-pointer"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
