import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authApi, setToken, clearToken, getToken } from "@/pages/admin/lib/api";

// ─── الواجهات ───
interface AuthUser {
  token: string;
  userName?: string;
  role?: string;
  permissions?: string[];
  groupName?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userName: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. تهيئة البيانات عند تشغيل التطبيق (Init)
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = getToken();
        const savedUser = localStorage.getItem("auth_user");

        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Auth Init Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // 2. دالة تسجيل الدخول
  const login = async (userName: string, password: string, role: string) => {
    try {
      const res = await authApi.login({ userName, password, role });
      const token = res.token || res.accessToken || (typeof res === 'string' ? res : null);

      if (token) {
        setToken(token);

        const userData: AuthUser = {
          ...res,
          token,
          userName: res.userName || userName,
          role: res.role || role,
          permissions: res.permissions || []
        };

        // تخزين البيانات بكل الأشكال المطلوبة للمشروع
        localStorage.setItem("token", token);
        localStorage.setItem("userName", userData.userName!);
        localStorage.setItem("userRole", userData.role!);
        localStorage.setItem("permissions", JSON.stringify(userData.permissions));
        localStorage.setItem("auth_user", JSON.stringify(userData));

        setUser(userData);
      } else {
        throw new Error("Token not found");
      }
    } catch (error) {
      throw error;
    }
  };


  const logout = () => {
    localStorage.clear();
    clearToken();
    setUser(null);

    window.location.href = "/login";
  };

  // 4. فحص الصلاحيات
  const hasPermission = (permName: string) => {
    if (!user) return false;
    if (user.userName === "admin" || user.groupName === "SuperAdmin") return true;
    return user.permissions?.includes(permName) || false;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── الـ Hooks والـ Guards المفقودة ───

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

/** * مكوّن يحمي صفحات الضيوف (Login/Signup)
 * يُصدر الآن بشكل صحيح لحل خطأ الـ Module
 */
/** * مكوّن يحمي صفحات الضيوف (Login/Signup)
 * تم تعديله ليفحص التخزين المحلي مباشرة لتجنب الـ Infinite Loop
 */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // 1. مهم جداً: انتظر حتى ينتهي التحميل
  if (isLoading) return null;

  // 2. إذا كان المستخدم مسجل دخول (isAuthenticated = true)
  if (isAuthenticated && user) {
    // استخدم الـ role من كائن الـ user اللي في الـ Context حصراً
    const isEmployee = user.role === "Employee" || user.role === "Admin";
    const destination = isEmployee ? "/admin/dash" : "/member-profile";

    return <Navigate to={destination} replace />;
  }

  // 3. إذا مش مسجل دخول، خليه بصفحة اللوجين عادي
  return <>{children}</>;
}