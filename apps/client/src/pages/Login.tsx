import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuthStore } from "../stores/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await signIn(form);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-4">
      <div className="p-6 space-y-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900/70 backdrop-blur shadow-xl">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-white">Sign in</h1>
            <p className="text-sm text-neutral-400">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                name="usernameOrEmail"
                placeholder="Username or Email"
                value={form.usernameOrEmail}
                onChange={handleChange}
                className="pl-10 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="pl-10 pr-10 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="text-center text-sm text-neutral-400">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-white cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
