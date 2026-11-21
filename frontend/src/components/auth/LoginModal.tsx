import React, { useState } from "react";
import {
  X,
  Loader2,
  Lock,
  User,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { DsBadge, DsButton } from "../../pages/DesignSystem/DesignSystemPage";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
}: LoginModalProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAdminSecret("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowAdminSecret(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegisterMode && password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isRegisterMode ? "/auth/register" : "/auth/login";
      const payload = isRegisterMode
        ? {
            username,
            email,
            password,
            ...(adminSecret.trim() ? { admin_secret: adminSecret.trim() } : {}),
          }
        : { username, password };

      const { data } = await api.post(endpoint, payload);

      login(data.access_token, data.user);
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : isRegisterMode
          ? "Gagal mendaftarkan akun. Periksa kembali inputan."
          : "Username/email atau password salah."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
      <div className="bg-white rounded-[28px] w-full max-w-md p-7 shadow-xl border border-line relative">
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-shell hover:bg-[#E8E7E4] text-ink flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="mb-6">
          <DsBadge tone="coral">
            {isRegisterMode ? "New Account" : "Authentication"}
          </DsBadge>
          <h2 className="text-2xl font-bold tracking-tight text-ink mt-2">
            {isRegisterMode ? "Buat Akun Baru" : "Masuk ke Workspace"}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            {isRegisterMode
              ? "Akun pertama otomatis menjadi Admin."
              : "Akses proyek, catatan, dan koleksi bookmark pribadi Anda."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FCEBEF] border border-[#F5D0D8] text-[#E13B5A] text-xs font-medium rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {isRegisterMode ? "Username" : "Username atau Email"}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 text-ink-muted" size={15} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isRegisterMode ? "thabys" : "username atau email"}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-line rounded-full text-xs outline-none focus:bg-white focus:border-[#141414] transition-colors"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 text-ink-muted" size={15} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-4 py-2 bg-surface border border-line rounded-full text-xs outline-none focus:bg-white focus:border-[#141414] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 text-ink-muted" size={15} />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-9 pr-10 py-2 bg-surface border border-line rounded-full text-xs outline-none focus:bg-white focus:border-[#141414] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-ink-muted hover:text-ink"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 text-ink-muted" size={15} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className={`w-full pl-9 pr-10 py-2 bg-surface border rounded-full text-xs outline-none focus:bg-white ${
                      confirmPassword && password !== confirmPassword
                        ? "border-[#E13B5A]"
                        : "border-line focus:border-[#141414]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-2.5 text-ink-muted hover:text-ink"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Admin Secret{" "}
                  <span className="text-ink-muted font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-2.5 text-ink-muted" size={15} />
                  <input
                    type={showAdminSecret ? "text" : "password"}
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    placeholder="Kosongkan jika user biasa / user pertama"
                    className="w-full pl-9 pr-10 py-2 bg-surface border border-line rounded-full text-xs outline-none focus:bg-white focus:border-[#141414]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminSecret(!showAdminSecret)}
                    className="absolute right-3.5 top-2.5 text-ink-muted hover:text-ink"
                    tabIndex={-1}
                  >
                    {showAdminSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <DsButton
              type="submit"
              variant="coral"
              disabled={
                isLoading ||
                (isRegisterMode &&
                  confirmPassword !== "" &&
                  password !== confirmPassword)
              }
              className="w-full py-2.5 text-xs"
            >
              {isLoading && <Loader2 size={15} className="animate-spin" />}
              <span>{isRegisterMode ? "Daftar Sekarang" : "Masuk"}</span>
            </DsButton>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-line text-center text-xs text-ink-muted">
          {isRegisterMode ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setConfirmPassword("");
              setError("");
            }}
            className="font-bold text-ink hover:text-[#E13B5A] transition-colors cursor-pointer"
          >
            {isRegisterMode ? "Masuk di sini" : "Daftar sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}