import { useState } from "react";

function UrlForm() {
    const [url, setUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setShortUrl("");

        try {
            const response = await fetch("http://localhost:3000/api/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to shorten URL");
            }

            const result = await response.text();
            setShortUrl(result);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (shortUrl) {
            await navigator.clipboard.writeText(shortUrl);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label
                    htmlFor="url"
                    className="mb-2 block text-sm font-medium text-slate-200"
                >
                    Enter your URL
                </label>
                <input
                    id="url"
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/very/long/link"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Shortening..." : "Shorten URL"}
            </button>

            {error && (
                <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </p>
            )}

            {shortUrl && (
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <p className="mb-2 text-sm font-medium text-emerald-200">
                        Your short URL
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <a
                            href={shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all rounded-xl bg-slate-950/60 px-4 py-3 text-cyan-300 underline-offset-4 hover:underline"
                        >
                            {shortUrl}
                        </a>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium hover:bg-white/10"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}

export default UrlForm;
