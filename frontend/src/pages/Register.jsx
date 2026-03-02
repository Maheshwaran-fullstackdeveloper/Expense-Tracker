import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet, Mail, Lock, User, UserPlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }
    try {
      await register(name, email, password);
      toast.success("Account created! Welcome.");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f0f9ff] dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md glass-card p-8 md:p-10 animate-in fade-in slide-in-from-bottom-5 duration-300 bg-white dark:bg-slate-900 shadow-2xl shadow-primary-500/10 border-primary-100 dark:border-primary-900/30">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/20 mb-4">
            <Wallet className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white uppercase tracking-tighter">
            Get Started
          </h1>
          <p className="text-primary-500 mt-2 text-sm text-center font-bold">
            Create your free expense account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-primary-700 dark:text-primary-400 ml-1">
              Full Name
            </label>
            <div className="input-group">
              <User className="input-icon w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input h-12 font-semibold bg-primary-50/20 dark:bg-slate-800/50 text-primary-900 dark:text-white border-primary-200 dark:border-primary-800 focus:border-primary-500"
                placeholder="Your Name"
                required
              />
            </div>
          </div>

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
                placeholder="Min 6 characters"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary h-12 flex items-center justify-center gap-2 mt-4 cursor-pointer font-bold uppercase tracking-widest"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center">
          <p className="text-primary-600 text-sm font-bold">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-700 font-extrabold underline cursor-pointer"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
