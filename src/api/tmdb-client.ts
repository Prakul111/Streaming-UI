const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

export async function tmdbFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, headers, ...restOptions } = options;

    // Build URL with query params
    const url = new URL(`${TMDB_BASE_URL}/${endpoint.replace(/^\//, "")}`);
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
