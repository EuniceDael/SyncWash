import { useEffect, useState } from "react"
import Pricing from "./components/Pricing"
import { AuthUser, getApiErrorMessage, getCurrentUser, logout } from "./lib/auth"


type IconName = "bag" | "calendar" | "check" | "chevron" | "clock" | "home" | "minus" | "plus" | "sparkle"

function Icon({
  name,
  className = "size-5",
}: {
  name: IconName
  className?: string
}) {
  const paths: Record<IconName, React.ReactNode> = {
    bag: (
      <>
        <path d="M6 8h12l1 12H5L6 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    sparkle: (
      <>
        <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
        <path d="m18 14 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14Z" />
      </>
    ),
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const days = [
  { day: "Tue", date: "14" },
  { day: "Wed", date: "15" },
  { day: "Thu", date: "16" },
  { day: "Fri", date: "17" },
]

export default function App() {
  const [day, setDay] = useState(1)
  const [bags, setBags] = useState(1)
  const [scheduled, setScheduled] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authError, setAuthError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then((currentUser) => {
        if (!active) return
        if (!currentUser) {
          window.location.assign("/login.html")
          return
        }
        setUser(currentUser)
      })
      .catch((error: unknown) => {
        if (!active) return
        setAuthError(getApiErrorMessage(error))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleLogout() {
    setAuthError("")
    setIsSigningOut(true)

    try {
      await logout()
      window.location.assign("/login.html")
    } catch (error) {
      setAuthError(getApiErrorMessage(error))
      setIsSigningOut(false)
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas text-muted">
        Checking your session...
      </main>
    )
  }

  if (authError && !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas px-5 text-ink">
        <section className="max-w-md rounded-3xl border border-line bg-white p-7 text-center shadow-card">
          <p role="alert">{authError}</p>
          <button
            className="mt-5 rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/*
        <aside className="hidden w-64 shrink-0 flex-col border-r border-line px-7 py-8 lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-brand text-white">
              <Icon name="sparkle" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Rinsewell
            </span>
          </div>

          <nav className="mt-14 space-y-2" aria-label="Main navigation">
            <button className="nav-item nav-item-active">
              <Icon name="home" /> Home
            </button>
            <button className="nav-item">
              <Icon name="bag" /> Orders
            </button>
            <button className="nav-item">
              <Icon name="calendar" /> Schedule
            </button>
          </nav>

          <div className="mt-auto rounded-3xl bg-brand-soft p-5">
            <div className="mb-4 grid size-10 place-items-center rounded-2xl bg-white text-brand">
              <Icon name="sparkle" />
            </div>
            <p className="font-display font-semibold">Need a little help?</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Our care team is here every day, 8am–8pm.
            </p>
            <button className="mt-4 text-sm font-semibold text-brand">
              Chat with us →
            </button>
          </div>
        </aside>
        */}

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-9">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid size-9 place-items-center rounded-xl bg-brand text-white">
                <Icon name="sparkle" className="size-4" />
              </div>
              <span className="font-display text-lg font-bold">SyncWash</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-muted">Tuesday, May 14</p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
                Good morning, {user?.name.split(" ")[0] || "there"}.
              </h1>
            </div>
            <button
              className="flex items-center gap-3 rounded-full border border-line bg-white p-1.5 pr-3 shadow-sm disabled:opacity-60"
              disabled={isSigningOut}
              onClick={handleLogout}
              type="button"
            >
              <span className="grid size-9 place-items-center rounded-full bg-sun text-sm font-bold">
                {user?.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <span className="hidden text-sm font-semibold sm:inline">
                {user?.name}
              </span>
              <span className="text-sm font-bold text-brand">
                {isSigningOut ? "Signing out..." : "Sign out"}
              </span>
            </button>
          </header>

          {authError && (
            <p className="mt-4 text-sm font-medium text-red-700" role="alert">
              {authError}
            </p>
          )}

          <div className="mt-8 lg:hidden">
            <p className="text-sm font-medium text-muted">Tuesday, May 14</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              Good morning, {user?.name.split(" ")[0] || "there"}.
            </h1>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
            <div className="space-y-6">
              <article className="overflow-hidden rounded-4xl bg-brand text-white shadow-soft">
                <div className="grid md:grid-cols-[1fr_220px]">
                  <div className="p-7 sm:p-9">
                    <div className="flex items-center gap-2 text-sm font-semibold text-lilac">
                      <span className="size-2 rounded-full bg-mint" />
                      Order #1048 · In progress
                    </div>
                    <h2 className="mt-6 max-w-md font-display text-3xl font-bold leading-tight tracking-tight">
                      Your clothes are getting the fresh treatment.
                    </h2>
                    <p className="mt-3 text-sm text-indigo-100">
                      Estimated delivery tomorrow, 5–7pm
                    </p>
                    <div className="mt-8 flex items-center">
                      {["Picked up", "Cleaning", "On the way"].map(
                        (label, index) => (
                          <div
                            className="flex flex-1 items-center last:flex-none"
                            key={label}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <span
                                className={`grid size-7 place-items-center rounded-full border ${
                                  index < 2
                                    ? "border-white bg-white text-brand"
                                    : "border-indigo-300 text-indigo-200"
                                }`}
                              >
                                {index === 0 ? (
                                  <Icon name="check" className="size-4" />
                                ) : (
                                  <span className="text-xs font-bold">
                                    {index + 1}
                                  </span>
                                )}
                              </span>
                              <span
                                className={`whitespace-nowrap text-xs ${
                                  index < 2
                                    ? "font-semibold text-white"
                                    : "text-indigo-200"
                                }`}
                              >
                                {label}
                              </span>
                            </div>
                            {index < 2 && (
                              <span
                                className={`mb-6 h-px flex-1 ${
                                  index === 0 ? "bg-white" : "bg-indigo-300"
                                }`}
                              />
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="relative hidden overflow-hidden md:block">
                    <div className="machine">
                      <span className="machine-dot" />
                      <span className="machine-door">
                        <span />
                      </span>
                    </div>
                    <span className="bubble bubble-one" />
                    <span className="bubble bubble-two" />
                    <span className="bubble bubble-three" />
                  </div>
                </div>
              </article>

              <Pricing />
            </div>

            <aside className="rounded-4xl border border-line bg-white p-6 shadow-card sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand">
                    QUICK SCHEDULE
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                    Plan a pickup
                  </h2>
                </div>
                <div className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <Icon name="calendar" />
                </div>
              </div>

              <p className="mt-7 text-sm font-semibold">Pickup day</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {days.map((item, index) => (
                  <button
                    key={item.date}
                    onClick={() => setDay(index)}
                    className={`day-card ${
                      day === index ? "day-card-active" : ""
                    }`}
                  >
                    <span className="text-xs">{item.day}</span>
                    <span className="mt-1 font-display text-lg font-bold">
                      {item.date}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold">Time window</p>
                <button className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-line px-4 py-3.5 text-left">
                  <Icon name="clock" className="size-5 text-brand" />
                  <span className="text-sm font-semibold">6:00pm – 8:00pm</span>
                  <Icon
                    name="chevron"
                    className="ml-auto size-4 rotate-90 text-muted"
                  />
                </button>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-canvas p-4">
                <div>
                  <p className="text-sm font-semibold">Number of bags</p>
                  <p className="mt-1 text-xs text-muted">Around 15 lb each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    aria-label="Remove a bag"
                    onClick={() => setBags(Math.max(1, bags - 1))}
                    className="count-button"
                  >
                    <Icon name="minus" className="size-4" />
                  </button>
                  <span className="w-4 text-center font-bold">{bags}</span>
                  <button
                    aria-label="Add a bag"
                    onClick={() => setBags(bags + 1)}
                    className="count-button"
                  >
                    <Icon name="plus" className="size-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setScheduled(true)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-sm font-bold text-white shadow-button transition hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                {scheduled ? (
                  <>
                    <Icon name="check" className="size-4" /> Pickup scheduled
                  </>
                ) : (
                  <>
                    Continue to schedule{" "}
                    <Icon name="chevron" className="size-4" />
                  </>
                )}
              </button>
              <p className="mt-4 text-center text-xs text-muted">
                Free pickup and delivery on orders over $35
              </p>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
