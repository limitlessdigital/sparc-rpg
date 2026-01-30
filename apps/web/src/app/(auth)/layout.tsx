import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal header with logo */}
      <header className="p-6">
        <Link 
          href="/" 
          className="inline-block hover:opacity-80 transition-opacity"
        >
          <Image
            src="/sparc-logo-weathered.png"
            alt="SPARC RPG"
            width={150}
            height={60}
            priority
            className="h-12 w-auto"
          />
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        © 2025 SPARC RPG
      </footer>
    </div>
  );
}
