import { GetServerSidePropsContext } from "next";
import { Task } from "@/types/task";

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Remove trailing slash if present to prevent double slashes in URLs
if (API_BASE_URL && API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

interface RequestOptions extends RequestInit {
  token?: string | null;
  // userId should only be used for task-related endpoints, not authentication
  // For auth, the path is relative to API_BASE_URL directly, e.g., /auth/login
  // For tasks, it's /api/{userId}/tasks
  userId?: string | null; 
}

async function apiFetch<T>(
  endpoint: string, // endpoint starts with / for auth, or no / for task paths (handled by userId logic)
  options: RequestOptions = {}
): Promise<T> {
  const { token, userId, headers, ...rest } = options;
  let url: string;

  // Don't allow requests with invalid mock tokens
  if (token) {
    try {
      const headerBase64 = token.split(".")[0];
      const payloadBase64 = token.split(".")[1];

      // Check if it's a mock token (algorithm "none" - insecure)
      const header = JSON.parse(atob(headerBase64));
      if (header?.alg === "none") {
        // Check if the payload has the mock flag
        const payload = JSON.parse(atob(payloadBase64));
        if (payload?.isMock) {
          throw new Error("Mock tokens are not allowed for API requests");
        }
      }
    } catch (error) {
      console.error("Invalid token format:", error);
      // Attempt to remove invalid token
      import('js-cookie').then(module => {
        module.default.remove('token');
      }).catch(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      });
      throw new Error("Invalid token format");
    }
  }

  if (endpoint.startsWith("/auth/")) { // Special handling for authentication endpoints
    url = `${API_BASE_URL}${endpoint}`;
  } else if (options.userId) { // Task-related endpoints with userId
    url = `${API_BASE_URL}/api/${options.userId}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  } else { // Other endpoints relative to API_BASE_URL
    url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  }

  const fetchOptions: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (token) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    // If it's an authentication error (401), clear the token to prevent continued attempts with invalid token
    if (response.status === 401) {
      // Remove token from cookies if present
      import('js-cookie').then(module => {
        module.default.remove('token');
      }).catch(() => {
        // Fallback to localStorage if js-cookie is not available
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      });
    }

    const errorData = await response.json().catch(() => ({})); // Try to parse error response
    throw new Error(errorData.detail || `API request failed: ${response.statusText}`);
  }

  // Handle 204 No Content for DELETE requests
  if (response.status === 204) {
    return null as T; // Return null for no content
  }

  return response.json();
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

// --- Auth Endpoints ---
export const authApi = {
  register: (data: any) => apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: string) => // data should be URLSearchParams for form-urlencoded
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: data,
    }),
};

// --- Task Endpoints ---
export const tasksApi = {
  getTasks: (userId: string, token: string) =>
    apiFetch<Task[]>(`/tasks`, { method: "GET", token, userId }),
  createTask: (userId: string, token: string, data: any) =>
    apiFetch<Task>(`/tasks`, { method: "POST", token, userId, body: JSON.stringify(data) }),
  getTask: (userId: string, taskId: number, token: string) =>
    apiFetch<Task>(`/tasks/${taskId}`, { method: "GET", token, userId }),
  updateTask: (userId: string, taskId: number, token: string, data: any) =>
    apiFetch<Task>(`/tasks/${taskId}`, { method: "PUT", token, userId, body: JSON.stringify(data) }),
  deleteTask: (userId: string, taskId: number, token: string) =>
    apiFetch(`/tasks/${taskId}`, { method: "DELETE", token, userId }),
  toggleTaskCompletion: (userId: string, taskId: number, token: string, completed: boolean) =>
    apiFetch<Task>(`/tasks/${taskId}/complete`, {
      method: "PATCH",
      token,
      userId,
      body: JSON.stringify({ completed }),
    }),
};

// --- Chat Endpoints ---
export const chatApi = {
  sendMessage: (userId: string, token: string, message: string, conversationId?: number) =>
    apiFetch<{ response: string; conversation_id: number; message_id: number }>(`/chat`, {
      method: "POST",
      token,
      userId,
      body: JSON.stringify({
        message,
        conversation_id: conversationId
      })
    }),
  getConversations: (userId: string, token: string) =>
    apiFetch<any[]>(`/conversations`, { method: "GET", token, userId }),
  getConversation: (userId: string, conversationId: number, token: string) =>
    apiFetch<any>(`/conversations/${conversationId}`, { method: "GET", token, userId }),
  createConversation: (userId: string, token: string, title?: string) =>
    apiFetch<any>(`/conversations`, {
      method: "POST",
      token,
      userId,
      body: JSON.stringify({ title })
    }),
};

// Helper to get token from context or cookies for SSR/Server Components
export function getAuthTokenFromContext(context: GetServerSidePropsContext) {
  // In Next.js App Router, typically you'd read cookies directly in Server Components
  // or pass from middleware. This is a placeholder for context-aware token retrieval.
  // For client components, localStorage is used.
  // For SSR/Server components, you'd parse from `context.req.headers.cookie` or similar.
  // This function might be more relevant for Pages Router's GetServerSideProps
  // For App Router, you'd typically use `cookies()` from 'next/headers' in a server component.
  // Here, we return null, assuming client-side fetching will rely on localStorage.
  return null; 
}
