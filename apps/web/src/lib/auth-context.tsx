"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseClient } from "./supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
}

// Transform Supabase user to our User type
function transformUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    username: supabaseUser.user_metadata?.display_name || 
              supabaseUser.user_metadata?.username ||
              supabaseUser.email?.split("@")[0] || 
              "User",
    avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
    createdAt: new Date(supabaseUser.created_at),
  };
}

// Context
const AuthContext = React.createContext<AuthContextValue | null>(null);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [supabaseUser, setSupabaseUser] = React.useState<SupabaseUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const router = useRouter();
  const supabase = getSupabaseClient();

  // Initialize auth state
  React.useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setSupabaseUser(initialSession.user);
          setState({
            user: transformUser(initialSession.user),
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        
        setSession(newSession);
        setSupabaseUser(newSession?.user || null);
        
        if (newSession?.user) {
          setState({
            user: transformUser(newSession.user),
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setSession(data.session);
        setSupabaseUser(data.user);
        setState({
          user: transformUser(data.user),
          isLoading: false,
          isAuthenticated: true,
        });
        router.push("/sessions");
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: username,
            username,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Note: User might need to verify email depending on Supabase settings
        if (data.session) {
          setSession(data.session);
          setSupabaseUser(data.user);
          setState({
            user: transformUser(data.user),
            isLoading: false,
            isAuthenticated: true,
          });
          router.push("/sessions");
        } else {
          // Email confirmation required
          setState((prev) => ({ ...prev, isLoading: false }));
          router.push("/login?message=Check your email to confirm your account");
        }
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setSupabaseUser(null);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force local state clear even if API fails
      setSession(null);
      setSupabaseUser(null);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        supabaseUser,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Protected Route Component
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-bronze border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
