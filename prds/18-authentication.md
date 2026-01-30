# PRD 18: Authentication System

> **Status**: Ready for Implementation  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 5 days  
> **Dependencies**: 17-database-schema

---

## Overview

The Authentication System manages user identity, session security, and role-based access control for SPARC RPG. Built on Supabase Auth with OAuth providers, it enables frictionless sign-up while maintaining security best practices.

### Goals
- Enable quick sign-up via OAuth (Google, Discord, Apple)
- Secure session management with JWT tokens
- Role-based access control (player, seer, admin)
- Protect user data with Row Level Security (RLS)

### Non-Goals
- Username/password authentication (OAuth only for v1)
- Multi-factor authentication (future enhancement)
- SSO for enterprise (out of scope)

---

## User Stories

### US-01: OAuth Sign-In
**As a** new user  
**I want to** sign in with my Google/Discord/Apple account  
**So that** I can start playing without creating new credentials

**Acceptance Criteria:**
- [ ] Google OAuth provider enabled and working
- [ ] Discord OAuth provider enabled and working
- [ ] Apple OAuth provider enabled and working
- [ ] User redirected to provider and back to app
- [ ] Profile auto-populated from OAuth data
- [ ] Sign-in completes in <3 seconds

### US-02: Session Persistence
**As a** returning user  
**I want to** stay logged in across browser sessions  
**So that** I don't have to sign in every time

**Acceptance Criteria:**
- [ ] JWT stored securely in browser
- [ ] Automatic token refresh before expiration
- [ ] Session persists for 7 days of inactivity
- [ ] Manual sign-out clears all tokens

### US-03: Role Assignment
**As a** new user  
**I want to** be assigned the player role by default  
**So that** I can immediately join games

**Acceptance Criteria:**
- [ ] New users get "player" role automatically
- [ ] Users can request "seer" role upgrade
- [ ] Admins can promote/demote roles
- [ ] Role changes take effect immediately

### US-04: Protected Routes
**As a** Seer  
**I want to** access Seer-only features  
**So that** I can manage games and create adventures

**Acceptance Criteria:**
- [ ] Seer Dashboard requires seer/admin role
- [ ] Adventure Forge requires seer/admin role
- [ ] Admin panel requires admin role
- [ ] Unauthorized access redirects to appropriate page

### US-05: Account Linking
**As a** user with multiple OAuth accounts  
**I want to** link them to a single SPARC account  
**So that** I can sign in with any provider

**Acceptance Criteria:**
- [ ] User can link additional OAuth providers
- [ ] User can unlink providers (minimum 1 required)
- [ ] All linked accounts access same data
- [ ] Clear UI showing linked providers

### US-06: Sign Out
**As a** user  
**I want to** sign out securely  
**So that** my account is protected on shared devices

**Acceptance Criteria:**
- [ ] Sign out clears all local tokens
- [ ] Sign out invalidates server session
- [ ] "Sign out everywhere" option available
- [ ] Confirmation before signing out of all devices

---

## Technical Specification

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  React Application                                                      │
│  ├── AuthProvider (Context)                                             │
│  ├── useAuth() Hook                                                     │
│  ├── ProtectedRoute Component                                           │
│  └── OAuth Buttons                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE AUTH                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ├── OAuth Providers (Google, Discord, Apple)                           │
│  ├── JWT Token Management                                               │
│  ├── Session Storage                                                    │
│  └── User Management                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL + Row Level Security                                        │
│  ├── auth.users (Supabase managed)                                      │
│  ├── public.profiles (app user data)                                    │
│  └── public.user_roles (role assignments)                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### OAuth Provider Configuration

#### Google OAuth
```typescript
// Environment variables
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

// Google Cloud Console settings
Authorized redirect URIs:
- https://xxx.supabase.co/auth/v1/callback

Scopes requested:
- openid
- email
- profile
```

#### Discord OAuth
```typescript
// Discord Developer Portal settings
Redirect URL:
- https://xxx.supabase.co/auth/v1/callback

Scopes requested:
- identify
- email
```

#### Apple OAuth
```typescript
// Apple Developer Console settings
Redirect URL:
- https://xxx.supabase.co/auth/v1/callback

Scopes requested:
- name
- email
```

### Database Schema

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles
CREATE TYPE user_role AS ENUM ('player', 'seer', 'admin');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'player',
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Linked OAuth providers
CREATE TABLE linked_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_providers ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Role policies
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Linked providers policies
CREATE POLICY "Users can view own linked providers"
  ON linked_providers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own linked providers"
  ON linked_providers FOR ALL
  USING (auth.uid() = user_id);
```

### TypeScript Types

```typescript
// User types
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: UserRole[];
  linkedProviders: OAuthProvider[];
  createdAt: Date;
  updatedAt: Date;
}

type UserRole = 'player' | 'seer' | 'admin';
type OAuthProvider = 'google' | 'discord' | 'apple';

// Session types
interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: User;
}

// Auth context
interface AuthContext {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  signOutEverywhere: () => Promise<void>;
  linkProvider: (provider: OAuthProvider) => Promise<void>;
  unlinkProvider: (provider: OAuthProvider) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAuthenticated: boolean;
}
```

### React Components

#### AuthProvider
```typescript
// src/providers/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserData(session);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadUserData(session);
        } else {
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (session: Session) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id);

    setUser({
      id: session.user.id,
      email: session.user.email!,
      displayName: profile?.display_name ?? session.user.email!,
      avatarUrl: profile?.avatar_url,
      roles: roles?.map(r => r.role) ?? ['player'],
      linkedProviders: [], // Load separately if needed
      createdAt: new Date(profile?.created_at),
      updatedAt: new Date(profile?.updated_at),
    });
    setSession(session);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' }
    });
  };

  const signInWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin + '/auth/callback' }
    });
  };

  const signInWithApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin + '/auth/callback' }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signOutEverywhere = async () => {
    await supabase.auth.signOut({ scope: 'global' });
  };

  const hasRole = (role: UserRole) => {
    return user?.roles.includes(role) || user?.roles.includes('admin') || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      signInWithGoogle,
      signInWithDiscord,
      signInWithApple,
      signOut,
      signOutEverywhere,
      linkProvider,
      unlinkProvider,
      hasRole,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### ProtectedRoute
```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

#### OAuth Buttons
```typescript
// src/components/auth/OAuthButtons.tsx
import { useAuth } from '@/providers/AuthProvider';

export function OAuthButtons() {
  const { signInWithGoogle, signInWithDiscord, signInWithApple } = useAuth();

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={signInWithGoogle}
        className="oauth-button oauth-google"
      >
        <GoogleIcon />
        Continue with Google
      </button>
      
      <button
        onClick={signInWithDiscord}
        className="oauth-button oauth-discord"
      >
        <DiscordIcon />
        Continue with Discord
      </button>
      
      <button
        onClick={signInWithApple}
        className="oauth-button oauth-apple"
      >
        <AppleIcon />
        Continue with Apple
      </button>
    </div>
  );
}
```

### JWT Token Handling

```typescript
// Token configuration
const TOKEN_CONFIG = {
  accessTokenLifetime: 3600,      // 1 hour
  refreshTokenLifetime: 604800,   // 7 days
  refreshThreshold: 300,          // Refresh 5 mins before expiry
};

// Automatic token refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    // Token was automatically refreshed
    console.log('Token refreshed');
  }
});

// Manual refresh if needed
async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    // Force re-authentication
    await supabase.auth.signOut();
  }
  return data.session;
}
```

### API Route Protection

```python
# python/src/server/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase)
) -> User:
    """Verify JWT and return current user."""
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

async def require_seer(
    user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
) -> User:
    """Require seer or admin role."""
    roles = supabase.table('user_roles').select('role').eq('user_id', user.id).execute()
    user_roles = [r['role'] for r in roles.data]
    
    if 'seer' not in user_roles and 'admin' not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seer role required"
        )
    return user

async def require_admin(
    user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
) -> User:
    """Require admin role."""
    roles = supabase.table('user_roles').select('role').eq('user_id', user.id).execute()
    user_roles = [r['role'] for r in roles.data]
    
    if 'admin' not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    return user
```

---

## Security Best Practices

### Token Security
1. **Storage**: Use `httpOnly` cookies when possible, fallback to `localStorage`
2. **Transmission**: Always use HTTPS in production
3. **Validation**: Verify JWT signature and expiration server-side
4. **Rotation**: Implement token rotation on refresh

### OAuth Security
1. **State Parameter**: Use PKCE flow to prevent CSRF attacks
2. **Redirect Validation**: Whitelist allowed redirect URIs
3. **Scope Minimization**: Request only required scopes
4. **Provider Verification**: Validate provider identity claims

### Session Security
1. **Timeout**: Auto-logout after 7 days of inactivity
2. **Invalidation**: Support "sign out everywhere"
3. **Device Tracking**: Log active sessions (future enhancement)
4. **Concurrent Limits**: None for v1 (consider for future)

### Data Protection
1. **RLS**: All user data protected by Row Level Security
2. **Encryption**: Passwords hashed by Supabase (not applicable for OAuth-only)
3. **PII Minimization**: Store only necessary profile data
4. **Audit Logging**: Log authentication events

---

## Testing Plan

### Unit Tests
```typescript
describe('AuthProvider', () => {
  it('loads user data on mount', async () => {
    // Mock supabase session
    // Assert user state populated
  });

  it('handles sign in with Google', async () => {
    // Assert OAuth flow initiated
  });

  it('handles sign out', async () => {
    // Assert tokens cleared
    // Assert user state null
  });

  it('checks roles correctly', () => {
    // Assert hasRole returns correct values
    // Assert admin has all roles
  });
});

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    // Assert redirect to /login
  });

  it('allows authenticated users through', () => {
    // Assert children rendered
  });

  it('blocks users without required role', () => {
    // Assert redirect to /unauthorized
  });
});
```

### Integration Tests
```typescript
describe('OAuth Flow', () => {
  it('completes Google sign-in flow', async () => {
    // Mock OAuth redirect
    // Assert user created/updated
    // Assert session established
  });

  it('creates profile for new users', async () => {
    // Sign in new user
    // Assert profile created in database
    // Assert default role assigned
  });

  it('links additional provider', async () => {
    // Sign in with Google
    // Link Discord
    // Assert both providers work
  });
});

describe('Token Management', () => {
  it('refreshes token before expiration', async () => {
    // Create session with short expiry
    // Wait for refresh
    // Assert new token issued
  });

  it('handles expired refresh token', async () => {
    // Create expired session
    // Assert user signed out
    // Assert redirected to login
  });
});
```

### E2E Tests
```typescript
describe('Authentication Flow', () => {
  it('allows new user to sign up and play', () => {
    cy.visit('/');
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="oauth-google"]').click();
    // Mock OAuth flow
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome');
  });

  it('protects seer dashboard from players', () => {
    // Sign in as player
    cy.visit('/seer');
    cy.url().should('include', '/unauthorized');
  });

  it('allows seer to access dashboard', () => {
    // Sign in as seer
    cy.visit('/seer');
    cy.contains('Seer Dashboard');
  });
});
```

---

## Acceptance Criteria

### P0 - Must Have
- [ ] Google OAuth working end-to-end
- [ ] Discord OAuth working end-to-end
- [ ] JWT tokens stored and refreshed automatically
- [ ] Role-based route protection working
- [ ] RLS policies protecting user data
- [ ] Sign out clears all tokens

### P1 - Should Have
- [ ] Apple OAuth working
- [ ] Profile auto-populated from OAuth
- [ ] "Sign out everywhere" functionality
- [ ] Provider linking/unlinking

### P2 - Nice to Have
- [ ] Active session list
- [ ] Login notifications
- [ ] Account deletion flow

---

## Dependencies

### Upstream
- 17-database-schema: Profile and role tables

### Downstream
- 16-backend-api: Uses auth dependencies
- 05-seer-dashboard: Requires seer role
- 08-canvas-system: Requires authentication
- 12-publishing-system: Requires seer role

---

## Open Questions

1. **Should we support email/password as fallback?**
   - Decision: No, OAuth-only for v1 simplicity

2. **Session timeout length?**
   - Decision: 7 days of inactivity, matching Supabase defaults

3. **How to handle seer role requests?**
   - Decision: Manual approval by admin for v1, self-service later

---

## Appendix

### OAuth Provider Setup Checklist

#### Google
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI
4. Enable Google+ API (for profile data)
5. Add client ID/secret to Supabase

#### Discord
1. Go to Discord Developer Portal
2. Create new application
3. Add OAuth2 redirect URI
4. Copy client ID/secret to Supabase

#### Apple
1. Go to Apple Developer Console
2. Configure Sign in with Apple
3. Create Services ID
4. Configure redirect URI
5. Generate client secret key
6. Add credentials to Supabase

### Environment Variables
```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Backend
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx

# OAuth (configured in Supabase dashboard)
# GOOGLE_CLIENT_ID=xxx
# GOOGLE_CLIENT_SECRET=xxx
# DISCORD_CLIENT_ID=xxx
# DISCORD_CLIENT_SECRET=xxx
# APPLE_CLIENT_ID=xxx
# APPLE_CLIENT_SECRET=xxx
```
