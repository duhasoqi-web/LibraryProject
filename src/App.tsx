import { useEffect } from "react";
import { Toaster } from "@/ui/toaster";
import { Toaster as Sonner } from "@/ui/sonner";
import { TooltipProvider } from "@/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { AuthProvider, useAuth, GuestOnlyRoute } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";

// ── Layouts ──
import AdminLayout4 from "@/pages/admin/components/AdminLayout";
import Dashboard from "@/pages/Dashboard.tsx";
import EmployeeProfile from "@/pages/admin/pages/EmployeeProfile.tsx";

// ── صفحات الموقع العام ──
import Index from "./pages/public/pages/Index";
import About from "./pages/public/pages/About";
import Services from "./pages/public/pages/Services";
import Search from "./pages/public/pages/Search";
import Contact from "./pages/public/pages/Contact";
import Partners from "./pages/public/pages/Partners";
import Posts from "./pages/public/pages/Posts";
import PostDetail from "./pages/public/pages/PostDetail";
import Signup from "./pages/public/pages/Signup";
import ResetPassword from "@/pages/public/pages/ResetPassword";
import Profile from "@/pages/public/pages/Profile";

// ── صفحات الكتب ──
import AddBook from "./pages/library/pages/AddBook";
import Books from "./pages/library/pages/Books";
import Barcode from "./pages/library/pages/BarcodeBooks";
import ReportsBooks from "./pages/library/pages/Reports";
import DeleteBooks from "./pages/library/pages/DeleteBooks";

// ── صفحات الاستعارات ──
import LoanPage from "./pages/Borrow/pages/LoanPage";
import ReturnLoanPage from "./pages/Borrow/pages/ReturnLoanPage";
import LateReturnPage from "./pages/Borrow/pages/LateReturnPage";
import OnlineRequestsPage from "./pages/Borrow/pages/OnlineRequestsPage";
import AlertsPage from "./pages/Borrow/pages/AlertsPage";
import GeneralReportsPage from "./pages/Borrow/pages/GeneralReportsPage";
import PersonalReportPage from "./pages/Borrow/pages/PersonalReportPage";
import NewSubscriptionForm from "./pages/Borrow/pages/NewSubscriptionForm";
import EditSubscriptionPage from "./pages/Borrow/pages/EditSubscriptionPage";
import RenewSubscriptionPage from "./pages/Borrow/pages/RenewSubscriptionPage";

// ── صفحات الإدارة ──
import Statistics from "./pages/admin/pages/statistics.tsx"
import Groups from "./pages/admin/pages/Groups";
import Employees from "./pages/admin/pages/Employees";
import SelectManager from "./pages/admin/pages/Selected";
import HomePage from "./pages/admin/pages/HomePage";

import Login from "./pages/public/pages/Login";
import NotFound from "./pages/public/pages/NotFound";

const queryClient = new QueryClient();


function MemberProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div className="h-screen w-full flex items-center justify-center">تحميل...</div>;
    if (!isAuthenticated || user?.role !== "Member") {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

/** 2. حماية المسار بناءً على صلاحية محددة للموظفين */
function PermissionRoute({ permission, children }: { permission: string; children: React.ReactNode }) {
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
    
    // إذا كانت الصلاحية غير موجودة في مصفوفة صلاحيات الموظف، ارجعه للداشبورد
    if (!permissions.includes(permission)) {
        return <Navigate to="/admin/dash" replace />;
    }
    return <>{children}</>;
}

function EmployeeRoute() {
    const { user, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        if (!token && !isLoading && isAuthenticated) {
            localStorage.clear();
            window.location.reload(); 
        }

        if (isAuthenticated && (user?.role === "Employee")) {
            document.body.classList.add("admin-theme");
            document.body.classList.remove("home-theme");
        } else {
            document.body.classList.add("home-theme");
            document.body.classList.remove("admin-theme");
        }
    }, [isAuthenticated, user?.role, isLoading]);

    if (isLoading) return <div className="h-screen w-full flex items-center justify-center">تحميل...</div>;

    // إذا ما في توكن أو مش موظف، اطرده فوراً لصفحة اللوجن
    if (!isAuthenticated || (user?.role !== "Employee") || !localStorage.getItem("token")) {
        return <Navigate to="/login" replace />;
    }

    return (
        <AdminLayout4>
            <Outlet />
        </AdminLayout4>
    );
}
const AppRoutes = () => (
    <Routes>
        {/* ─── صفحات الضيوف ─── */}
        <Route path="/login"           element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
        <Route path="/signup"          element={<GuestOnlyRoute><Signup /></GuestOnlyRoute>} />
        <Route path="/forgot-password" element={<GuestOnlyRoute><ResetPassword /></GuestOnlyRoute>} />

        {/* ─── الموقع العام ─── */}
        <Route path="/"           element={<Index />} />
        <Route path="/about"      element={<About />} />
        <Route path="/services"   element={<Services />} />
        <Route path="/search"     element={<Search />} />
        <Route path="/contact"    element={<Contact />} />
        <Route path="/partner"    element={<Partners />} />
        <Route path="/posts"      element={<Posts />} />
        <Route path="/posts/:id"  element={<PostDetail />} />

        {/* ─── بروفايل المشترك ─── */}
        <Route path="/member-profile" element={<MemberProtectedRoute><Profile /></MemberProtectedRoute>} />

        {/* ─── لوحة الإدارة (محمية بالكامل لدور الموظف) ─── */}
        <Route path="/admin" element={<EmployeeRoute />}>
            <Route index element={<Navigate to="/admin/dash" replace />} />
            <Route path="dash" element={<Dashboard />} />
            <Route path="profile" element={<EmployeeProfile />} />

            {/* حماية المسارات الفرعية بناءً على صلاحيات الأكشن */}
            
            {/* فريق الكتب */}
            <Route path="add-book" element={<PermissionRoute permission="Create-Book_books"><AddBook /></PermissionRoute>} />
            <Route path="books" element={<PermissionRoute permission="Read-Book_books"><Books /></PermissionRoute>} />
            <Route path="barcode" element={<PermissionRoute permission="Read-Book_books"><Barcode /></PermissionRoute>} />
            <Route path="delete" element={<PermissionRoute permission="Delete-Book_books"><DeleteBooks /></PermissionRoute>} />
            <Route path="reports" element={<PermissionRoute permission="Read-Reports_books"><ReportsBooks /></PermissionRoute>} />

            {/* فريق الاستعارات والعمليات */}
            <Route path="loan" element={<PermissionRoute permission="Create-Borrow_borrows"><LoanPage /></PermissionRoute>} />
            <Route path="return-loan" element={<PermissionRoute permission="Handle-Borrow_borrows"><ReturnLoanPage /></PermissionRoute>} />
            <Route path="late-returns" element={<PermissionRoute permission="Handle-Borrow_borrows"><LateReturnPage /></PermissionRoute>} />
            <Route path="alerts" element={<PermissionRoute permission="Handle-Borrow_borrows"><AlertsPage /></PermissionRoute>} />
            <Route path="online-requests" element={<PermissionRoute permission="Handle-Online-Borrow_borrows"><OnlineRequestsPage /></PermissionRoute>} />
            <Route path="general-reports" element={<PermissionRoute permission="Read-Reports_borrows"><GeneralReportsPage /></PermissionRoute>} />
            <Route path="personal-reports" element={<PermissionRoute permission="Read-Reports_borrows"><PersonalReportPage /></PermissionRoute>} />

            {/* فريق المشتركين */}
            <Route path="subscription/new" element={<PermissionRoute permission="Create-Subscription_Subscriptions"><NewSubscriptionForm /></PermissionRoute>} />
            <Route path="subscription/edit" element={<PermissionRoute permission="Update-Subscription_Subscriptions"><EditSubscriptionPage /></PermissionRoute>} />
            <Route path="subscription/renew" element={<PermissionRoute permission="Renew-Subscription_Subscriptions"><RenewSubscriptionPage /></PermissionRoute>} />

            {/* فريق الإدارة والنظام */}
            <Route path="statistics" element={<PermissionRoute permission="DashboardAccess_Admin"><Statistics /></PermissionRoute>} />
            <Route path="groups" element={<PermissionRoute permission="Read-Groups_Admin"><Groups /></PermissionRoute>} />
            <Route path="employees" element={<PermissionRoute permission="Read-Employees_Admin"><Employees /></PermissionRoute>} />
            <Route path="select" element={<PermissionRoute permission="Read-Employees_Admin"><SelectManager /></PermissionRoute>} />
            <Route path="homepage" element={<PermissionRoute permission="Update-HomePage_Admin"><HomePage /></PermissionRoute>} />
        </Route>

        <Route path="*" element={<NotFound />} />
    </Routes>
);

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner richColors dir="rtl" position="bottom-right" closeButton />
                <BrowserRouter>
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;