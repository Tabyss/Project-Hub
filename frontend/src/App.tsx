import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProjectPage from "./pages/Project/ProjectPage";
import ProjectDetailPage from "./pages/Project/components/ProjectDetail/ProjectDetailPage";
import Header from "./components/Header";
import ProjectFormPage from "./pages/Project/components/ProjectForm/ProjectFormPage";
import LoginModal from "./components/auth/LoginModal";
import { useAuth } from "./context/AuthContext";
import { useViewModeStore } from "./store/viewModeStore";
import Board from "./pages/Notes/components/Board";

function App() {
    const { isLoginModalOpen, closeLoginModal } = useAuth();
    const { setMode } = useViewModeStore();

    const handleLoginSuccess = () => {
        setMode("devdocs");
    };
    return (
        <>
            <Router>
                <div className="bg-slate-50">
                    <Header />
                    <main>
                        <Routes>
                            <Route path="/" element={<ProjectPage />} />
                            <Route
                                path="/project/:slug"
                                element={<ProjectDetailPage />}
                            />
                            <Route
                                path="/project/new"
                                element={<ProjectFormPage />}
                            />
                            <Route
                                path="/project/edit/:slug"
                                element={<ProjectFormPage />}
                            />
                            <Route path="/notes" element={<Board />} />
                        </Routes>
                    </main>
                </div>
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
