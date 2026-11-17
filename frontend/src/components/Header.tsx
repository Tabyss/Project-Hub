import Logo from "../assets/logo Thabys.svg";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, LogIn } from "lucide-react";

const NAV_ITEMS = [
  { id: "project", label: "Project", path: "/" },
  { id: "note", label: "Notes", path: "/notes" },
  { id: "daily", label: "Daily", path: "/daily" },
];

const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, openLoginModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
      <div className="mx-7 h-16 flex items-center justify-between">
        <Link to="/" className="w-8 h-8 flex items-center justify-center">
          <img
            src={Logo}
            alt="Thabys Logo"
            className="w-full h-full object-contain"
          />
        </Link>

        <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-full">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:text-black hover:bg-gray-200/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          {isAuthenticated && user ? (
            <>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span>@{user.username}</span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-slate-900 text-white rounded-full">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-slate-800 transition-colors"
            >
              <LogIn size={14} />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;