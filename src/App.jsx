import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./context/UserContext";

import Header from "./components/Layout/Header";
import PlatformsList from "./pages/PlatformsList";
import PlatformForm from "./pages/PlatformForm";
import PlatformDetail from "./pages/PlatformDetail";
import PlatformSearch from "./pages/PlatformSearch";
import PlatformRanking from "./pages/PlatformRanking";
import DeployFunctionForm from "./pages/DeployFunctionForm";
import CredentialsForm from "./pages/CredentialsForm";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Private routes */}
          <Route path="/" element={<PrivateRoute><PlatformsList /></PrivateRoute>} />
          <Route path="/platforms/new" element={<PrivateRoute><PlatformForm /></PrivateRoute>} />
          <Route path="/platforms/:id" element={<PrivateRoute><PlatformDetail /></PrivateRoute>} />
          <Route path="/platforms/:id/edit" element={<PrivateRoute><PlatformForm /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><PlatformSearch /></PrivateRoute>} />
          <Route path="/ranking" element={<PrivateRoute><PlatformRanking /></PrivateRoute>} />
          <Route path="/deploy" element={<PrivateRoute><DeployFunctionForm /></PrivateRoute>} />
          <Route path="/credentials" element={<PrivateRoute><CredentialsForm /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
