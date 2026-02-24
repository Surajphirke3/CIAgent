/**
 * Base API fetch utility.
 * Automatically attaches the JWT Bearer token from localStorage on every request.
 */

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("ci_token") : null;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
    };

    let res: Response;
    try {
        res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } catch (err) {
        // Network error (e.g., backend offline, DNS issue)
        throw new ApiError(0, "Cannot connect to server. Please start the backend.");
    }

    if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
            const body = await res.json();
            message = body?.detail ?? body?.message ?? message;
        } catch {
            if (res.status === 401) message = "Invalid or expired credentials";
            else if (res.status === 400) message = "Validation error";
            else if (res.status >= 500) message = "Internal server error";
        }
        throw new ApiError(res.status, message);
    }

    // 204 No Content – return empty object
    if (res.status === 204) return {} as T;

    return res.json() as Promise<T>;
}

/**
 * POST shorthand (JSON body)
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
    return apiFetch<T>(path, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

/**
 * DELETE shorthand
 */
export async function apiDelete<T>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: "DELETE" });
}

/**
 * PATCH shorthand (JSON body)
 */
export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    return apiFetch<T>(path, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
}
