import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AuthPage from "./pages/AuthPage";
import DiscoverPage from "./pages/DiscoverPage";
import LikesPage from "./pages/LikesPage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import PremiumPage from "./pages/PremiumPage";
import SettingsPage from "./pages/SettingsPage";
import EditProfilePage from "./pages/EditProfilePage";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/app"
          element={isAuthenticated ? <AppShell /> : <Navigate to="/" replace />}
        >
          <Route index element={<Navigate to="discover" replace />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="likes" element={<LikesPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="chat/:matchId" element={<ChatPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="premium" element={<PremiumPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="edit-profile" element={<EditProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
