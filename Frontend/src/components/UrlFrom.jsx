import { useEffect, useRef, useState } from "react";

import { shortenUrl } from "../api/shortUrlapi.js";

function UrlForm() {
    const [url, setUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const resultRef = useRef(null);
    

    useEffect(() => {
        if (shortUrl && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [shortUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setShortUrl("");

        try {
            const response = await shortenUrl(url);
            const generatedUrl =
                typeof response === "string"
                    ? response.trim()
                    : response?.shortUrl || response?.data || response?.url || "";

            if (!generatedUrl) {
                throw new Error("No short URL returned from the server");
            }

            setShortUrl(generatedUrl);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => { 
        if (shortUrl) {
            await navigator.clipboard.writeText(shortUrl);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        }
    };
    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label
                    htmlFor="url"
                    className="mb-2 block text-sm font-medium text-slate-900"
                >
                    Destination URL
                </label>
                <input
                    id="url"
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/very/long/link"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                />
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                >
                    {loading ? "Creating..." : "Shorten"}
                </button>
            </div>

            {error && (
                <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </p>
            )}

            {shortUrl && (
                <div ref={resultRef} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Your short link</p>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <a href={shortUrl} target="_blank" rel="noreferrer" className="break-all text-sm font-medium text-blue-700 hover:underline">
                            {shortUrl}
                        </a>
                        <button onClick={handleCopy} className={`rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 ${copied ? 'bg-emerald-400 border-emerald-400 text-slate-900' : ''}`}>
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}

export default UrlForm;
