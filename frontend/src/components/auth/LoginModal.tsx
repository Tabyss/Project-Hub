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

    // State visibilitas password
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

        // Validasi kecocokan password pada mode register
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
                      ...(adminSecret.trim()
                          ? { admin_secret: adminSecret.trim() }
                          : {}),
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
                      : "Username/email atau password salah.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 relative">
                <button
                    onClick={() => {
                        resetForm();
                        onClose();
                    }}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                        {isRegisterMode
                            ? "Buat Akun Baru"
                            : "Masuk ke ProjectHub"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        {isRegisterMode
                            ? "Akun pertama otomatis menjadi Admin."
                            : "Masuk untuk mengelola catatan, folder, dan proyek."}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username / Email */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            {isRegisterMode
                                ? "Username"
                                : "Username atau Email"}
                        </label>
                        <div className="relative">
                            <User
                                className="absolute left-3 top-2.5 text-slate-400"
                                size={16}
                            />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={
                                    isRegisterMode
                                        ? "thabys"
                                        : "username atau email"
                                }
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>
                    </div>

                    {/* Email (Register Only) */}
                    {isRegisterMode && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-2.5 text-slate-400"
                                    size={16}
                                />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                        </div>
                    )}

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock
                                className="absolute left-3 top-2.5 text-slate-400"
                                size={16}
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                                className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Konfirmasi Password (Register Only) */}
                    {isRegisterMode && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-2.5 text-slate-400"
                                    size={16}
                                />
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Ulangi password"
                                    className={`w-full pl-9 pr-10 py-2 border rounded-xl text-sm outline-none focus:ring-2 ${
                                        confirmPassword &&
                                        password !== confirmPassword
                                            ? "border-red-300 focus:ring-red-500"
                                            : "border-slate-200 focus:ring-slate-900"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                            {confirmPassword &&
                                password !== confirmPassword && (
                                    <p className="text-[11px] text-red-500 mt-1">
                                        Password belum cocok.
                                    </p>
                                )}
                        </div>
                    )}

                    {/* Admin Secret (Register Only) */}
                    {isRegisterMode && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Admin Secret{" "}
                                <span className="text-slate-400 font-normal">
                                    (Opsional)
                                </span>
                            </label>
                            <div className="relative">
                                <KeyRound
                                    className="absolute left-3 top-2.5 text-slate-400"
                                    size={16}
                                />
                                <input
                                    type={showAdminSecret ? "text" : "password"}
                                    value={adminSecret}
                                    onChange={(e) =>
                                        setAdminSecret(e.target.value)
                                    }
                                    placeholder="Kosongkan jika user biasa / user pertama"
                                    className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAdminSecret(!showAdminSecret)
                                    }
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showAdminSecret ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={
                            isLoading ||
                            (isRegisterMode &&
                                confirmPassword !== "" &&
                                password !== confirmPassword)
                        }
                        className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading && (
                            <Loader2 size={16} className="animate-spin" />
                        )}
                        <span>
                            {isRegisterMode ? "Daftar Sekarang" : "Masuk"}
                        </span>
                    </button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                    {isRegisterMode ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegisterMode(!isRegisterMode);
                            setConfirmPassword("");
                            setError("");
                        }}
                        className="font-semibold text-slate-900 hover:underline"
                    >
                        {isRegisterMode ? "Masuk di sini" : "Daftar sekarang"}
                    </button>
                </div>
            </div>
        </div>
    );
}
