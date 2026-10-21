import type { FormEvent } from "react"

export type LoginCredentials = {
  phoneNumber: string
  password: string
}

type LoginProps = {
  onSubmit: (credentials: LoginCredentials) => void
}

export default function Login({ onSubmit }: LoginProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    onSubmit({
      phoneNumber: String(formData.get("phoneNumber")),
      password: String(formData.get("password")),
    })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-5 py-10 text-ink">
      <section className="w-full max-w-md rounded-4xl border border-line bg-white p-7 shadow-card sm:p-9">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand text-white">
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
            <path d="m18 14 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14Z" />
          </svg>
        </div>

        <div className="mt-6 text-center">
          <p className="font-display text-xl font-bold">SyncWash</p>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to manage your laundry orders.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold" htmlFor="login-phone">
            Phone number
            <input
              autoComplete="tel"
              className="mt-2 w-full rounded-2xl border border-line px-4 py-3.5 font-normal outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              id="login-phone"
              name="phoneNumber"
              placeholder="Enter your phone number"
              required
              type="tel"
            />
          </label>

          <label
            className="block text-sm font-semibold"
            htmlFor="login-password"
          >
            Password
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-line px-4 py-3.5 font-normal outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              id="login-password"
              name="password"
              placeholder="Enter your password"
              required
              type="password"
            />
          </label>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-muted">
              <input
                className="size-4 accent-brand"
                name="remember"
                type="checkbox"
              />
              Remember me
            </label>
            <a className="font-semibold text-brand hover:text-brand-dark" href="#forgot-password">
              Forgot password?
            </a>
          </div>

          <button
            className="w-full rounded-2xl bg-brand py-4 text-sm font-bold text-white shadow-button transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            type="submit"
          >
            Sign in
          </button>
        </form>

      </section>
    </main>
  )
}
