const TMDB_BASE_URL =
    import.meta.env.VITE_TMDB_BASE_URL ||
    (import.meta.env.DEV ? "/api/tmdb" : "https://api.themoviedb.org/3");

export interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

export async function tmdbFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, headers, ...restOptions } = options;

    // Build URL with query params (handles relative proxy path and absolute URL)
    const baseUrl = TMDB_BASE_URL.replace(/\/$/, "");
    const cleanEndpoint = endpoint.replace(/^\//, "");
    const baseOrigin = typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost:5173";
    const url = new URL(`${baseUrl}/${cleanEndpoint}`, baseOrigin);
    url.searchParams.set("language", "en-US"); // Default language
    if (params) {
        Object.entries(params).forEach(([key, val]) => {
            url.searchParams.set(key, String(val));
        });
    }

    const response = await fetch(url.toString(), {
        ...restOptions,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API}`,
            ...headers,
        },
    });

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
}
