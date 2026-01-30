"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@sparc/ui";
import { useAuth } from "@/lib/auth-context";

// Placeholder stats
const stats = [
  { label: "Characters", value: 3, icon: "/assets/icons/dark/characters.svg", href: "/characters" },
  { label: "Sessions Played", value: 12, icon: "/assets/icons/dark/sessions.svg", href: "/sessions" },
  { label: "Adventures", value: 2, icon: "/assets/icons/dark/adventures.svg", href: "/adventures" },
  { label: "Hours Played", value: 48, icon: "/assets/icons/dark/home.svg", href: "#" },
];

// Placeholder recent activity
const recentActivity = [
  { type: "session", text: "Completed \"The Dragon's Lair\" session", time: "2 hours ago" },
  { type: "character", text: "Created new character: Theron the Bold", time: "Yesterday" },
  { type: "adventure", text: "Started drafting \"Curse of the Moonstone\"", time: "3 days ago" },
  { type: "session", text: "Joined \"Heroes of Brighthollow\" campaign", time: "1 week ago" },
];

// Quick actions
const quickActions = [
  { label: "Create Character", href: "/characters/new", icon: "/assets/icons/dark/create.svg" },
  { label: "Join Session", href: "/sessions", icon: "/assets/icons/dark/sessions.svg" },
  { label: "Browse Adventures", href: "/adventures", icon: "/assets/icons/dark/adventures.svg" },
];

export default function DashboardPage(): JSX.Element | null {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.username}!</h2>
          <p className="text-muted-foreground">Ready for your next adventure?</p>
        </div>
        <Link href="/characters/new">
          <Button variant="primary">Create Character</Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card interactive className="h-full">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Image
                          src={stat.icon}
                          alt={stat.label}
                          width={40}
                          height={40}
                          className="w-10 h-10"
                        />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 pb-4 border-b border-surface-divider last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 mt-2 rounded-full bg-bronze flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump right in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3"
                >
                  <Image
                      src={action.icon}
                      alt={action.label}
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  {action.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions Banner */}
      <Card className="bg-gradient-to-r from-bronze/20 to-gold/10 border-bronze/30">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">No Active Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Join or create a session to start playing!
              </p>
            </div>
            <Link href="/sessions">
              <Button variant="primary">Browse Sessions</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
