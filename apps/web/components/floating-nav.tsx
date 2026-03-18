import Image from "next/image";
import Link from "next/link";

type FloatingNavProps = {
  pathname: string;
};

const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/this", label: "This" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function FloatingNav({ pathname }: FloatingNavProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4 sm:top-6">
      <nav
        aria-label="Primary"
        className="pointer-events-auto w-full max-w-[min(94vw,54rem)]"
      >
        <div className="flex items-center justify-between rounded-[1.75rem] border border-black/[0.07] bg-white/92 px-4 py-2 shadow-[0_8px_32px_rgba(17,17,17,0.09)] backdrop-blur-xl">

          {/* Logo */}
          <Link
            href="/"
            aria-label="Home"
            className="nav-logo-link flex shrink-0 items-center px-2 py-1"
          >
            <Image
              src="/assets/Face logo.svg"
              alt="ndzuma malate"
              width={22}
              height={22}
              priority
              className="nav-logo"
            />
          </Link>

          {/* Centered nav links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  style={{
                    backgroundColor: active ? "#000000" : "transparent",
                    color: active ? "#ffffff" : "rgba(0, 0, 0, 0.5)",
                  }}
                  className="rounded-2xl px-3.5 py-2 text-sm font-medium tracking-[-0.01em] transition-colors duration-200 hover:bg-black/[0.05] hover:text-black/80"
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.color = "rgba(0, 0, 0, 0.8)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(0, 0, 0, 0.5)";
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Get in touch button */}
          <Link
            href="/contact"
            style={{
              backgroundColor: "#000000",
              color: "#ffffff",
            }}
            className="rounded-2xl px-4 py-2 text-sm font-medium tracking-[-0.01em] transition-opacity duration-200 hover:opacity-80 shrink-0"
          >
            Get in touch
          </Link>

        </div>
      </nav>
    </div>
  );
}
