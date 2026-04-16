import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAuthStore } from "../stores/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.register);

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await signUp(form);

      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-4">
      <div className="p-6 space-y-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900/70 backdrop-blur shadow-xl">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-white">
              Create account
            </h1>
            <p className="text-sm text-neutral-400">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" loading={loading}>
              Sign up
            </Button>
          </form>

          <div className="text-center text-sm text-neutral-400">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-white cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
