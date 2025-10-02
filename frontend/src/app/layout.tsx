import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-sm">
          {/* Logo (left) */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Dotfunding Logo" className="h-10 w-30" />
          </div>
          {/* Search bar (center) */}
          <form className="flex-1 flex justify-center">
            <div className="relative w-2/3 max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {/* Search Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search projects, creators, and catagories"
                className="pl-10 pr-4 py-2 w-full rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </form>
          {/* Login button (right) */}
          <div>
            <a
              href="/login"
              className="px-6 py-1 text-black rounded-lg transition font-normal hover:text-indigo-600"
            >
              Log in
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
