import { useState } from "react"

const services = [
  {
    name: "Wash",
    detail: "Everyday laundry",
    price: "₱ 75 / Load",
  },
  {
    name: "Wash, Dry and Fold Package",
    detail: "Delicate care",
    price: "From ₱ 175",
  },
]

export default function Pricing() {
  const [selectedService, setSelectedService] = useState(0)

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-brand">START A NEW ORDER</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
            What do you need?
          </h2>
        </div>
        <button className="text-sm font-semibold text-brand">View pricing</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((item, index) => (
          <button
            key={item.name}
            onClick={() => setSelectedService(index)}
            className={`service-card ${
              selectedService === index ? "service-card-active" : ""
            }`}
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 4 3 7l2 5 3-1v9h8v-9l3 1 2-5-5-3c-.5 1.2-1.9 2-4 2S8.5 5.2 8 4Z" />
              </svg>
            </span>
            <span className="min-w-0 text-left">
              <span className="block font-display text-lg font-bold">
                {item.name}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {item.detail}
              </span>
            </span>
            <span className="ml-auto text-sm font-semibold">{item.price}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
