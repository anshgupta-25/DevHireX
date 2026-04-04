import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import StudentDashboard from "@/components/dashboards/StudentDashboard";
import RecruiterDashboard from "@/components/dashboards/RecruiterDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  switch (user.role) {
    case "student": return <StudentDashboard />;
    case "recruiter": return <RecruiterDashboard />;
    case "admin": return <AdminDashboard />;
  }
}
