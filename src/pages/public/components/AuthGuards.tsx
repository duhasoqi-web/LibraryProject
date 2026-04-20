import { Navigate } from "react-router-dom";

/**
 * GuestOnlyRoute: تمنع المستخدم المسجل من رؤية صفحات (Login / Signup)
 */
export const GuestOnlyRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
        // إذا كان موظف وسجل دخول، وجهه للداشبورد الخاص به
        if (role === "Employee") return <Navigate to="/admin/dash" replace />;
        // إذا كان عضو عادي، وجهه لبروفايله
        return <Navigate to="/member-profile" replace />;
    }

    return children;
};

/**
 * ProtectedRoute: تحمي صفحات المشتركين (Members) وتمنع الموظفين من دخولها 
 * أو العكس حسب منطق مشروعك.
 */
export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // 1. إذا لم يكن هناك توكن، اذهب للـ Login
    if (!token) return <Navigate to="/login" replace />;

    // 2. إذا كان موظف وحاول دخول صفحة "Member" (مثل بروفايل المشترك)
    // الأفضل نوجهه لمكان شغله (Dashboard) مش للصفحة الرئيسية العامة
    if (role === "Employee") {
        return <Navigate to="/admin/dash" replace />;
    }

    return children;
};