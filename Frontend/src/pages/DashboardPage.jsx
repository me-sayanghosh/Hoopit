import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCustomShortUrl, shortenUrl } from '../api/shortUrlapi.js'
import { logOutUser } from '../api/user.api.js'

function DashboardPage() {
  const navigate = useNavigate()

  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [shortLoading, setShortLoading] = useState(false)
  const [shortError, setShortError] = useState('')

  const [customUrl, setCustomUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [customShortUrl, setCustomShortUrl] = useState('')
  const [customLoading, setCustomLoading] = useState(false)
  const [customError, setCustomError] = useState('')

  const [copiedValue, setCopiedValue] = useState('')

  const handleCopy = async (value) => {
    await navigator.clipboard.writeText(value)
    setCopiedValue(value)

    window.setTimeout(() => {
      setCopiedValue('')
    }, 1500)
  }

  const handleLogout = async () => {
    try {
      await logOutUser()
      navigate('/')
    } catch (error) {
      setShortError(error?.message || 'Unable to log out right now.')
    }
  }

  const handleShortenSubmit = async (event) => {
    event.preventDefault()
    setShortLoading(true)
    setShortError('')
    setShortUrl('')

    try {
      const response = await shortenUrl(url)
      const generatedUrl = response?.shortUrl || ''

      if (!generatedUrl) {
        throw new Error('No short URL returned from the server')
      }

      setShortUrl(generatedUrl)
      setUrl('')
    } catch (error) {
      setShortError(error?.message || 'Unable to shorten this URL right now.')
    } finally {
      setShortLoading(false)
    }
  }

  const handleCustomSubmit = async (event) => {
    event.preventDefault()
    setCustomLoading(true)
    setCustomError('')
    setCustomShortUrl('')

    try {
      const response = await createCustomShortUrl(customUrl, customAlias)
      const generatedUrl = response?.shortUrl || ''

      if (!generatedUrl) {
        throw new Error('No custom short URL returned from the server')
      }

      setCustomShortUrl(generatedUrl)
      setCustomUrl('')
      setCustomAlias('')
    } catch (error) {
      setCustomError(error?.message || 'Unable to create a custom URL right now.')
    } finally {
      setCustomLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#111827]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Hoopit</p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Your URL workspace</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Short URL section</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Shorten any link</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Paste a long URL and generate a clean short link. Because you are logged in, the backend will attach the result to your account.
              </p>
            </div>

            <form className="grid gap-4" onSubmit={handleShortenSubmit}>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Long URL
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com/very/long/link"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={shortLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {shortLoading ? 'Shortening...' : 'Generate short URL'}
              </button>
            </form>

            {shortError ? (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{shortError}</p>
            ) : null}

            {shortUrl ? (
              <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold text-emerald-800">Generated short URL</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a href={shortUrl} target="_blank" rel="noreferrer" className="break-all rounded-2xl bg-white px-4 py-3 text-blue-700 underline-offset-4 hover:underline">
                    {shortUrl}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(shortUrl)}
                    className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
                  >
                    {copiedValue === shortUrl ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Custom URL section</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Create a custom alias</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Use the logged-in custom URL feature from your backend to create a memorable alias for a link.
              </p>
            </div>

            <form className="grid gap-4" onSubmit={handleCustomSubmit}>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Long URL
                <input
                  type="url"
                  value={customUrl}
                  onChange={(event) => setCustomUrl(event.target.value)}
                  placeholder="https://example.com/product/collection"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Custom alias
                <input
                  type="text"
                  value={customAlias}
                  onChange={(event) => setCustomAlias(event.target.value)}
                  placeholder="my-custom-link"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={customLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {customLoading ? 'Creating...' : 'Create custom URL'}
              </button>
            </form>

            {customError ? (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{customError}</p>
            ) : null}

            {customShortUrl ? (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-800">Custom short URL</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a href={customShortUrl} target="_blank" rel="noreferrer" className="break-all rounded-2xl bg-white px-4 py-3 text-blue-700 underline-offset-4 hover:underline">
                    {customShortUrl}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(customShortUrl)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {copiedValue === customShortUrl ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : null}

            <p className="mt-4 text-sm leading-6 text-slate-500">
              This section uses the authenticated backend route, so it only works after a successful login.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage