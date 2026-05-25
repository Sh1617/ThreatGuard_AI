"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./theme-context";

const GITHUB_URL = "https://github.com/Sh1617/ThreatGuard_AI";

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const path = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/predict", label: "Predict" },
    { href: "/analyze", label: "Analyze" },
    { href: "/threats", label: "Threats" },
  ];

  const accent = dark ? "#63ffb4" : "#0f7a4e";
  const border = dark ? "rgba(99,255,180,0.08)" : "rgba(0,0,0,0.08)";
  const navBg = dark ? "rgba(8,12,16,0.92)" : "rgba(240,242,245,0.92)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .nav-item {
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.08em;
          padding: 6px 12px;
          border-radius: 3px;
          transition: all 0.15s;
          font-family: 'IBM Plex Mono', monospace;
        }
        .nav-item:hover { opacity: 1 !important; }
        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.08em;
          padding: 7px 14px;
          border-radius: 3px;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
        }
        .gh-link {
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.08em;
          font-family: 'IBM Plex Mono', monospace;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .gh-link:hover { opacity: 1; }
      `}</style>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          borderBottom: `1px solid ${border}`,
          background: navBg,
          backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px", height: 60,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.35C16.6 22.15 20 17.25 20 12V6l-8-4z"
              stroke={accent} strokeWidth="1.5"
              fill={dark ? "rgba(99,255,180,0.1)" : "rgba(15,122,78,0.1)"}
            />
            <path d="M9 12l2 2 4-4" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: dark ? "#f0f4f8" : "#0d1117" }}>
            ThreatGuard<span style={{ color: accent }}>AI</span>
          </span>
        </Link>

        {/* Nav links — all use Next.js Link for proper client-side routing */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="nav-item"
                style={{
                  color: active ? accent : dark ? "#a0aec0" : "#4a5568",
                  background: active
                    ? (dark ? "rgba(99,255,180,0.08)" : "rgba(15,122,78,0.08)")
                    : "transparent",
                  fontWeight: active ? 500 : 400,
                  opacity: active ? 1 : 0.75,
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right side — GitHub + theme toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href={GITHUB_URL}
            className="gh-link"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: dark ? "#e2e8f0" : "#1a202c" }}
          >
            GitHub ↗
          </a>
          <button
            className="toggle-btn"
            onClick={toggle}
            style={{ borderColor: dark ? "rgba(99,255,180,0.25)" : "rgba(0,0,0,0.2)", color: accent }}
          >
            {dark ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {dark ? "LIGHT" : "DARK"}
          </button>
        </div>
      </nav>
    </>
  );
}