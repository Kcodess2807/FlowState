import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import Landing from "@/pages/Landing";
import Problems from "@/pages/Problems";
import ProblemDetail from "@/pages/ProblemDetail";
import Explore from "@/pages/Explore";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";

/** Reset scroll position on route change. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <Problems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/problems/:slug"
          element={
            <ProtectedRoute>
              <ProblemDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
