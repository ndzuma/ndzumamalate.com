import Image from "next/image";
import Link from "next/link";

type FloatingNavProps = {
  pathname: string;
};

const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
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
        <div className="flex items-center gap-3 rounded-[1.75rem] border border-black/[0.07] bg-white/92 px-2 py-2 shadow-[0_8px_32px_rgba(17,17,17,0.09)] backdrop-blur-xl">

          {/* Logo — plain Link, no pill/button wrapper, hover handled by CSS spring in globals.css */}
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

          {/* Vertical divider */}
          <div className="h-4 w-px shrink-0 bg-black/10" />

          {/* Nav links */}
          <div className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "rounded-2xl px-3.5 py-2 text-sm font-medium tracking-[-0.01em] transition-colors duration-200",
                    active
                      ? "bg-black text-white"
                      : "text-black/50 hover:bg-black/[0.05] hover:text-black/80",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

        </div>
      </nav>
    </div>
  );
}
