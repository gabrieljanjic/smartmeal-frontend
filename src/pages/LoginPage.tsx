import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context";
import { FaUtensils } from "react-icons/fa";
import toast from "react-hot-toast";

function LoginPage() {
  const navigate = useNavigate();
  const { setIsAuthenticated, refreshAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      return;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true },
      );
      if (res.status == 200) {
        setIsAuthenticated(true);
        await refreshAuth();
        setEmail("");
        setPassword("");
        navigate("/");
      }
    } catch {
      toast.error("Pogrešan email ili lozinka");
    }
  };

  return (
    <section className="w-full h-full overflow-y-auto flex items-center justify-center px-3 py-4 sm:px-4 bg-stone-100">
      <div className="border border-stone-300 bg-white p-5 sm:p-8 rounded-xl sm:rounded-2xl w-full max-w-xs sm:max-w-md flex flex-col items-center gap-4 sm:gap-6 shadow-sm">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-sm flex items-center justify-center bg-green-800">
            <FaUtensils className="text-stone-50 text-[15px] sm:text-[18px]" />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-stone-900"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Login
          </h1>
        </div>
        <form
          className="w-full flex flex-col gap-3 sm:gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border border-stone-300 rounded-md px-3 py-2 sm:p-3 text-base sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-700"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border border-stone-300 rounded-md px-3 py-2 sm:p-3 text-base sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-700"
          />

          <button
            type="submit"
            className="bg-green-800 hover:bg-green-900 transition-colors text-stone-50 font-semibold text-sm sm:text-base px-3 py-2 sm:p-3 rounded-md"
          >
            LOG IN
          </button>

          <div className="flex flex-wrap gap-1 justify-center text-xs sm:text-sm text-stone-700">
            <p>Don't have an account?</p>
            <Link
              to="/register"
              className="text-orange-700 font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
