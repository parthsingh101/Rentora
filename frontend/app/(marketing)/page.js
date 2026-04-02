import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 py-10 lg:py-20">
      {/* Hero Section */}
      <section className="px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl">
          Manage your rentals with{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Confidence
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
          Rentora is the all-in-one platform for property owners and tenants. 
          Streamline payments, maintenance, and communication in one beautiful interface.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Get Started Free
          </Link>
          <Link
            href="#features"
            className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-zinc-900 shadow-lg border border-zinc-200 transition-transform hover:scale-105 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="bg-zinc-50 py-20 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Tailored for Every User
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Rentora provides a customized experience for three distinct roles.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                role: "Admin",
                description: "Complete overview of the platform, user management, and system-wide analytics.",
                features: ["System Analytics", "User Management", "Audit Logs"],
                color: "border-purple-500",
              },
              {
                role: "Landlord",
                description: "Efficiently manage properties, track payments, and communicate with tenants.",
                features: ["Property Listings", "Payment Tracking", "Incident Reports"],
                color: "border-blue-500",
              },
              {
                role: "Tenant",
                description: "Pay rent online, submit maintenance requests, and track your lease agreement.",
                features: ["Digital Payments", "Maintenance Tickets", "Digital Lease"],
                color: "border-green-500",
              },
            ].map((item) => (
              <div
                key={item.role}
                className={`relative flex flex-col rounded-2xl border-t-4 ${item.color} bg-white p-8 shadow-md transition-shadow hover:shadow-xl dark:bg-zinc-900`}
              >
                <h3 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
                  {item.role}
                </h3>
                <p className="mb-6 flex-1 text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </p>
                <ul className="mb-8 space-y-3">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600">
                  Join as {item.role}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Why Choose Rentora?
            </h2>
            <div className="space-y-8">
              {[
                {
                  title: "Automated Collections",
                  text: "Set up recurring payments and track payouts effortlessly.",
                  icon: (
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  title: "Smart Communication",
                  text: "Direct messaging between landlords and tenants with history audit.",
                  icon: (
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  ),
                },
                {
                  title: "Maintenance Tracker",
                  text: "Real-time updates on repair requests and vendor assignments.",
                  icon: (
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ),
                },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{feature.title}</h3>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-blue-600 shadow-2xl lg:h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-600/40 backdrop-blur-3xl"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center p-10">
               <div className="space-y-4">
                  <div className="text-white/20 text-8xl font-black select-none">RENTORA</div>
                  <p className="text-white font-medium text-lg leading-relaxed">
                    Designed for production.<br/>Built for performance.<br/>Scalable for your future.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-zinc-900 px-6 py-24 shadow-2xl rounded-3xl sm:px-24">
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to revolutionize your rental experience?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-8 text-zinc-300">
            Join thousands of satisfied users managing their properties with Ease. 
            Sign up today and get your first 3 months free.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100"
            >
              Start Your Free Trial
            </Link>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle cx="512" cy="512" r="512" fill="url(#gradient)" fillOpacity="0.15" />
            <defs>
              <radialGradient id="gradient">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#8b5cf6" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </section>
    </div>
  );
}
