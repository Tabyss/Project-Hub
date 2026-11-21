import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LoginModal from "./components/auth/LoginModal";
import { useAuth } from "./context/AuthContext";
import { useViewModeStore } from "./store/viewModeStore";
import { APP_MODULES } from "./config/modules";

function App() {
    const { isLoginModalOpen, closeLoginModal } = useAuth();
    const { setMode } = useViewModeStore();

    const handleLoginSuccess = () => {
        setMode("devdocs");
    };

    return (
        <>
            <Router>
                <Header>
                    <Routes>
                        {APP_MODULES.flatMap((mod) => {
                            const MainPage = mod.element;
                            const routes = [
                                <Route
                                    key={mod.path}
                                    path={mod.path}
                                    element={<MainPage />}
                                />,
                            ];

                            if (mod.subRoutes) {
                                for (const sub of mod.subRoutes) {
                                    const SubPage = sub.element;
                                    routes.push(
                                        <Route
                                            key={sub.path}
                                            path={sub.path}
                                            element={<SubPage />}
                                        />,
                                    );
                                }
                            }

                            return routes;
                        })}
                    </Routes>
                </Header>
            </Router>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeLoginModal}
                onSuccess={handleLoginSuccess}
            />
        </>
    );
}

export default App;
