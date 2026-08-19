import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DiscoverPage from "./pages/DiscoverPage";
import LikesPage from "./pages/LikesPage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import PremiumPage from "./pages/PremiumPage";
import SettingsPage from "./pages/SettingsPage";
import EditProfilePage from "./pages/EditProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import VerificationPendingModal from "./components/auth/VerificationPendingModal";
import ProfileVerificationWizard from "./components/auth/ProfileVerificationWizard";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { isAuthenticated, user, dispatch } = useAuth();

  // User needs to take their live verification selfie / upload ID
  const needsVerificationSetup = isAuthenticated && 
    !user?.is_admin && 
    !user?.live_selfie_url && 
    user?.verification_status !== 'approved';

  // User finished wizard and is waiting for Creator review
  const isPendingVerification = isAuthenticated && 
    user?.verification_status === 'pending' && 
    !user?.is_admin && 
    !user?.verified &&
    !needsVerificationSetup;

  return (
    <>
      {needsVerificationSetup && (
        <ProfileVerificationWizard 
          onComplete={() => {
            dispatch({
              type: 'UPDATE_PROFILE',
              payload: { verification_status: 'pending' }
            });
          }}
        />
      )}

      {isPendingVerification && (
        <VerificationPendingModal 
          onApproved={() => {
            dispatch({
              type: 'UPDATE_PROFILE',
              payload: { verification_status: 'approved', verified: true }
            });
          }}
        />
      )}

      <Routes>
        {/* wobbledate.com Homepage Landing Hero */}
        <Route path="/" element={<LandingPage />} />

        {/* Dedicated Auth Screen */}
        <Route 
          path="/auth" 
          element={
            <div className="app-container">
              <AuthPage />
            </div>
          } 
        />

        {/* Super Admin / Creator Verification Portal */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/creator" element={<AdminDashboardPage />} />
        <Route path="/boss" element={<AdminDashboardPage />} />

        {/* Main Dating Web App Shell */}
        <Route
          path="/app"
          element={
            isAuthenticated ? (
              <div className="app-container">
                <AppShell />
              </div>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
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
    </>
  );
}
