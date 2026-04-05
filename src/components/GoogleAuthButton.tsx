import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/lib/types";

interface Props {
  role: UserRole;
  isNewUser?: boolean; // true for signup page, false for login
}

// Google "G" SVG icon
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// Role selection modal for first-time Google users
function RoleModal({ onSelect }: { onSelect: (role: UserRole) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md">
            <GoogleIcon />
          </div>
          <h2 className="text-xl font-black text-gray-900">Almost there!</h2>
          <p className="text-sm text-gray-500 mt-1">How are you using DevHireX?</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSelect("student")}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 p-4 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
          >
            <span className="text-2xl">🎓</span>
            <span className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700">Student</span>
            <span className="text-xs text-gray-400 text-center">Find my dream startup role</span>
          </button>
          <button
            onClick={() => onSelect("recruiter")}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 p-4 hover:border-purple-400 hover:bg-purple-50 transition-all group"
          >
            <span className="text-2xl">💼</span>
            <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-700">Recruiter</span>
            <span className="text-xs text-gray-400 text-center">Hire top talent</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function GoogleAuthButton({ role, isNewUser = false }: Props) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<{
    name: string;
    email: string;
    profileImage: string;
  } | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const googleData = {
        name: firebaseUser.displayName || "Google User",
        email: firebaseUser.email || "",
        profileImage: firebaseUser.photoURL || "",
      };

      // Check if user exists in our DB by trying to login
      // We pass the role from context, but for new users the backend
      // will create with this role. For existing users it uses their stored role.
      try {
        await loginWithGoogle({ ...googleData, role });
        navigate("/dashboard");
      } catch (err: any) {
        // If the error indicates user not found (new user on login page),
        // show role selection modal
        if (isNewUser || err?.response?.status === 404) {
          setPendingUser(googleData);
          setShowRoleModal(true);
        } else {
          throw err;
        }
      }
    } catch (error: any) {
      if (error?.code === "auth/popup-closed-by-user") return;
      toast({
        title: "Google Sign-In Failed",
        description: error?.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelected = async (selectedRole: UserRole) => {
    if (!pendingUser) return;
    setShowRoleModal(false);
    setIsLoading(true);
    try {
      await loginWithGoogle({ ...pendingUser, role: selectedRole });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed",
        description: error?.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showRoleModal && <RoleModal onSelect={handleRoleSelected} />}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <svg className="h-5 w-5 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <GoogleIcon />
        )}
        {isLoading ? "Connecting..." : "Continue with Google"}
      </button>
    </>
  );
}
