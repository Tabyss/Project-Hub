import { useState } from "react";
import api from "../../services/api";
import Modal from "../common/Modal";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function LoginModal({
    isOpen,
    onClose,
    onSuccess,
}: LoginModalProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { data } = await api.post("/auth/login", { username, password });
            login(data.access_token);
            setUsername("");
            setPassword("");
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(
                err.response?.data?.detail || "Username atau password salah.",
            );
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Admin Authentication">
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-xl text-sm font-medium border border-blue-100">
                    <Lock size={20} className="shrink-0 text-blue-600" />
                    <p>
                        Masukkan kredensial admin untuk mengakses Engineering
                        Workspace (Dev Mode).
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">
                        Username
                    </label>
                    <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Username admin"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="••••••••"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {isLoading && <Loader2 className="animate-spin" />}
                        Login to Dev Mode
                    </button>
                </div>
            </form>
        </Modal>
    );
}
