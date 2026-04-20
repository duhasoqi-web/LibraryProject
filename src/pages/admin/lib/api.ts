const API_BASE = "/api";
// --- إدارة التوكن والجلسة ---

function getToken(): string | null {
  return localStorage.getItem("token");
}

function setToken(token: string) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("permissions");
}

// --- Interfaces (الواجهات) ---

export interface Permission {
  permissionId: string;
  permissionName: string;
  displayName: string;
}

export interface Group {
  groupId: number;
  groupName: string;
  groupLevel?: string | number;
  permissions?: string[];
  permissionIds?: string[];
}

export interface Employee {
  employeeId: number;
  userId?: number;
  firstName: string;
  familyName: string;
  fatherName: string;
  grandfatherName: string;
  firstNameEn: string;
  familyNameEn: string;
  empNumber: string;
  phoneNumber: string;
  idnumber: string;
  birthDate: string;
  groupId: number;
  groupName?: string;
  userStatus: "Active" | "Inactive" | "Pending";
}

// --- Request Helper (مساعد الطلبات) ---

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // معالجة عدم المصادقة أو انتهاء الجلسة
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  // معالجة الردود الفارغة (204 No Content)
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return {} as T;
  }

  const text = await res.text();
  if (!text) return {} as T;

  try {
    const data = JSON.parse(text);
    if (!res.ok) {
      // استخراج رسالة الخطأ من السيرفر ليعرضها الـ Toast لاحقاً
      const errorMessage = data.message || data.error || "حدث خطأ في الطلب";
      const error = new Error(errorMessage);
      (error as any).response = { data };
      throw error;
    }
    return data;
  } catch (e) {
    if (e instanceof Error) throw e;
    return text as unknown as T;
  }
}

// --- Exported APIs (تصدير الدوال) ---

export const authApi = {
  login: (data: { userName: string; password: string; role: string }) =>
    request<any>("/Auth/login", { 
      method: "POST", 
      body: JSON.stringify({
        userName: data.userName,
        password: data.password,
        role: data.role // إضافة الحقل هنا ليتم إرساله للسيرفر
      }) 
    }),


  toggleStatus: (userId: number | string) =>
    request<any>(`/Auth/toggle-status/${userId}`, { method: "PUT" }),

  changePassword: (data: { code: string | null; newPassword: string }) =>
    request<any>("/Auth/change-password", { method: "PUT", body: JSON.stringify(data) }),
};

export const permissionApi = {
  getAll: () => request<Permission[]>("/Permission"),
  getById: (id: string) => request<Permission>(`/Permission/${id}`),
};

export const groupApi = {
  getAll: () => request<Group[]>("/Group"),
  getById: (id: number | string) => request<Group>(`/Group/${id}`),
  lookup: () => request<any[]>("/Group/lookup"),
  create: (data: { groupName: string; groupLevel: string; permissionIds?: string[] }) =>
    request<any>("/Group", { method: "POST", body: JSON.stringify(data) }),
  update: (data: { groupId: number; groupName: string; groupLevel: string; permissionIds?: string[] }) =>
    request<any>("/Group", { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number | string) =>
    request<any>(`/Group/${id}`, { method: "DELETE" }),
};

export const employeeApi = {
  getAll: () => request<Employee[]>("/Employee"),
  getById: (id: number) => request<Employee>(`/Employee/${id}`),
  create: (data: any) =>
    request<any>("/Employee", { method: "POST", body: JSON.stringify(data) }),
  update: (data: Employee) =>
    request<any>("/Employee", { method: "PUT", body: JSON.stringify(data) }),
  changeGroup: (employeeId: number, newGroupId: number) =>
    // ملاحظة: الـ EmployeeId يوضع في المسار (URL)
    request<any>(`/Employee/${employeeId}/change-group`, { 
      method: "PATCH", 
      body: JSON.stringify({ 
        newGroupId: newGroupId.toString() // السيرفر يتوقعه كـ string حسب التوثيق
      }) 
    }),
  transferOwnership: (data: { newAdminId: number; Password: string }) =>
    request<any>("/Employee/transfer-ownership", { 
      method: "POST", 
      body: JSON.stringify(data) 
    }),
};

export const lookupApi = {
  getAll: (endpoint: string) => request<any[]>(endpoint),
  create: (endpoint: string, fieldName: string, value: string) =>
    request<any>(endpoint, {
      method: "POST",
      body: JSON.stringify({ [fieldName]: value }),
    }),
  update: (endpoint: string, idField: string, idValue: number, fieldName: string, value: string) =>
    request<any>(endpoint, {
      method: "PUT",
      body: JSON.stringify({ [idField]: idValue, [fieldName]: value }),
    }),
  delete: (endpoint: string, id: number | string) =>
    request<any>(`${endpoint}/${id}`, { method: "DELETE" }),
};

// --- Admin Dashboard APIs (إحصائيات لوحة التحكم) ---

export const adminApi = {
  getCards: () => 
    request<any>("/Admin/cards"),
    
  getHomepageCards: () => 
    request<any>("/Admin/homepage-cards"),
    
  getIncomeCards: () => 
    request<any>("/Admin/income-cards"),
    
  getBooksByClass: () => 
    request<any>("/Admin/books-by-class"),
    
  getTopSuppliers: () => 
    request<any>("/Admin/top-suppliers"),
    
  getNewVsRemoved: () => 
    request<any>("/Admin/new-vs-removed"),
    
  getMemberClassifications: () => 
    request<any>("/Admin/member-classifications"),
    
  getMembersByCity: () => 
    request<any>("/Admin/members-by-city"),
    
  getNewMembersGrowth: () => 
    request<any>("/Admin/new-members-growth"),
    
  getBorrowsActivity: () => 
    request<any>("/Admin/borrows-activity"),
    
  getLateBorrowsPercentage: () => 
    request<any>("/Admin/late-borrows-percentage"),
    
  getTopBorrowers: () => 
    request<any>("/Admin/top-borrowers"),
};

export { getToken, setToken, clearToken };