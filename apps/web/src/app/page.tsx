"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@sparc/ui";
import { useAuth } from "@/lib/auth-context";

// Feature cards data
const features = [
  {
    icon: "/assets/icons/dark/characters.svg",
    title: "Character Creation",
    description: "Build unique heroes with the SPARC attribute system. Might, Grace, Wit, and Heart define your legend.",
  },
  {
    icon: "/assets/icons/dark/sessions.svg",
    title: "Dynamic Sessions",
    description: "Join real-time multiplayer sessions. Roll dice, make choices, and shape the story together.",
  },
  {
    icon: "/assets/icons/dark/forge.svg",
    title: "Adventure Forge",
    description: "Game Masters can craft branching narratives with our visual editor. Every choice matters.",
  },
  {
    icon: "/assets/icons/dark/portal.svg",
    title: "Play Anywhere",
    description: "Cross-platform support. Start on desktop, continue on mobile. Your adventure never stops.",
  },
];

// Stat display
const stats = [
  { value: "1,000+", label: "Adventures" },
  { value: "10,000+", label: "Heroes" },
  { value: "50,000+", label: "Sessions" },
];

export default function Home(): JSX.Element | null {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-base/80 backdrop-blur-md border-b border-surface-divider">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/sparc-logo-weathered.png" 
              alt="SPARC RPG" 
              width={120} 
              height={56}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/sessions">
                <Button variant="primary" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-bronze/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-bronze via-gold to-bronze bg-clip-text text-transparent">
              Your Legend
            </span>
            <br />
            <span className="text-foreground">Awaits</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The next generation tabletop RPG platform. Create characters, run
            sessions, and bring your stories to life with friends.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href={isAuthenticated ? "/sessions" : "/register"}>
              <Button variant="primary" size="lg">
                {isAuthenticated ? "Continue Adventure" : "Start Your Journey"}
              </Button>
            </Link>
            <Button variant="ghost" size="lg">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 pt-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-bronze">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete platform for running tabletop RPG sessions online
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-surface-card border border-surface-divider rounded-lg hover:border-bronze/50 hover:shadow-glow transition-all duration-300"
              >
                <div className="mb-4">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Begin?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of players and game masters. Your adventure starts now.
          </p>
          <Link href={isAuthenticated ? "/sessions" : "/register"}>
            <Button variant="primary" size="lg">
              {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-surface-divider">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 SPARC RPG. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-bronze transition-colors">Terms</a>
            <a href="#" className="hover:text-bronze transition-colors">Privacy</a>
            <a href="#" className="hover:text-bronze transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
