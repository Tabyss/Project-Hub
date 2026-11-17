import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { useNoteStore } from "../store/noteStore";
import { useViewModeStore } from "../store/viewModeStore";

export interface User {
    id: string;
    username: string;
    email: string;
    is_admin: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const logout = useCallback(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_data");
        setUser(null);

        // Bersihkan state Zustand & kembalikan mode ke portfolio publik
        useNoteStore.getState().resetStore();
        useViewModeStore.getState().setMode("portfolio");

        // Hapus cache TanStack Query akun sebelumnya & muat ulang data publik
        queryClient.clear();
    }, [queryClient]);

    // Validasi token saat aplikasi pertama kali dibuka/di-refresh
    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem("access_token");
            const savedUser = localStorage.getItem("user_data");

            if (savedToken && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    const { data } = await api.get<User>("/auth/me");
                    setUser(data);
                    localStorage.setItem("user_data", JSON.stringify(data));
                } catch {
                    logout();
                }
            }
        };
        initAuth();
    }, [logout]);

    // Dengarkan event force-logout dari interceptor Axios saat token 401
    useEffect(() => {
        const handleForceLogout = () => logout();
        window.addEventListener("auth:logout", handleForceLogout);
        return () =>
            window.removeEventListener("auth:logout", handleForceLogout);
    }, [logout]);

    const login = (token: string, userData: User) => {
        localStorage.setItem("access_token", token);
        localStorage.setItem("user_data", JSON.stringify(userData));
        useNoteStore.getState().resetStore();
        setUser(userData);

        // Muat ulang seluruh query (projects, filters, logs, plans) untuk user yang baru login
        queryClient.invalidateQueries();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isAdmin: !!user?.is_admin,
                isLoginModalOpen,
                openLoginModal: () => setIsLoginModalOpen(true),
                closeLoginModal: () => setIsLoginModalOpen(false),
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth harus digunakan di dalam AuthProvider");
    return context;
};
