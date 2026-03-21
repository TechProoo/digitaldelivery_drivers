import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Truck, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;
  if (isAuthenticated) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1118",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(145deg, rgba(30,40,55,0.7), rgba(15,20,30,0.9))",
          border: "1px solid var(--border-soft, rgba(255,255,255,0.08))",
          borderRadius: 16,
          padding: "40px 28px 32px",
        }}
      >
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #1E40AF, #3b82f6)",
              marginBottom: 16,
              position: "relative",
            }}
          >
            <Truck size={28} color="#fff" />
            <span
              style={{
                position: "absolute",
                bottom: -6,
                right: -6,
                background: "linear-gradient(135deg, #1E40AF, #3b82f6)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                borderRadius: 6,
                padding: "2px 5px",
                letterSpacing: 0.5,
                border: "2px solid #0b1118",
              }}
            >
              DD
            </span>
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#f1f5f9",
              marginBottom: 4,
            }}
          >
            Driver Platform
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-tertiary, rgba(148,163,184,0.7))",
              fontWeight: 500,
            }}
          >
            Digital Delivery
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-tertiary, rgba(148,163,184,0.7))",
                marginBottom: 6,
              }}
            >
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(148,163,184,0.5)",
                  pointerEvents: "none",
                }}
              />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="driver@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 38px",
                  fontSize: 14,
                  color: "#f1f5f9",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border-soft, rgba(255,255,255,0.08))",
                  borderRadius: 10,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)")}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-soft, rgba(255,255,255,0.08))")
                }
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-tertiary, rgba(148,163,184,0.7))",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(148,163,184,0.5)",
                  pointerEvents: "none",
                }}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 42px 12px 38px",
                  fontSize: 14,
                  color: "#f1f5f9",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border-soft, rgba(255,255,255,0.08))",
                  borderRadius: 10,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)")}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-soft, rgba(255,255,255,0.08))")
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: 4,
                  cursor: "pointer",
                  color: "rgba(148,163,184,0.5)",
                  display: "flex",
                  alignItems: "center",
                }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 0",
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              background: loading
                ? "rgba(59,130,246,0.4)"
                : "linear-gradient(135deg, #1E40AF, #3b82f6)",
              border: "none",
              borderRadius: 10,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Error */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
                padding: "10px 12px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8,
                fontSize: 13,
                color: "#f87171",
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Footer note */}
        <p
          style={{
            marginTop: 24,
            fontSize: 12,
            color: "var(--text-tertiary, rgba(148,163,184,0.5))",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Login credentials are sent to your email when your application is approved.
        </p>
      </div>
    </div>
  );
}
