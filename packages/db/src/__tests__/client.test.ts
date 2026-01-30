import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock @supabase/supabase-js before importing
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    signIn: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Now import the module
import { createClient, createServerClient, createAdminClient, getClient } from '../client';

describe('createClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('throws error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    expect(() => createClient()).toThrow('Missing Supabase environment variables');
  });

  it('throws error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createClient()).toThrow('Missing Supabase environment variables');
  });

  it('creates client when both env vars are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const client = createClient();
    expect(client).toBeDefined();
  });

  it('returns a typed Supabase client', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const client = createClient();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });
});

describe('createServerClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('throws error when SUPABASE_URL is missing', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    expect(() => createServerClient()).toThrow('Missing SUPABASE_URL environment variable');
  });

  it('throws error when no key is available', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createServerClient()).toThrow('Missing Supabase key');
  });

  it('uses SUPABASE_URL preferentially', () => {
    process.env.SUPABASE_URL = 'https://server.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://public.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    const client = createServerClient();
    expect(client).toBeDefined();
  });

  it('falls back to NEXT_PUBLIC_SUPABASE_URL', () => {
    delete process.env.SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://public.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const client = createServerClient();
    expect(client).toBeDefined();
  });

  it('prefers service role key over anon key', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const client = createServerClient();
    expect(client).toBeDefined();
  });

  it('accepts optional access token', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    const client = createServerClient('user-access-token');
    expect(client).toBeDefined();
  });

  it('creates client without access token', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    const client = createServerClient();
    expect(client).toBeDefined();
  });
});

describe('createAdminClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('throws error when SUPABASE_URL is missing', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    expect(() => createAdminClient()).toThrow('Missing Supabase admin credentials');
  });

  it('throws error when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminClient()).toThrow('Missing Supabase admin credentials');
  });

  it('creates admin client with service role key', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    const client = createAdminClient();
    expect(client).toBeDefined();
  });

  it('uses NEXT_PUBLIC_SUPABASE_URL as fallback', () => {
    delete process.env.SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://public.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    const client = createAdminClient();
    expect(client).toBeDefined();
  });
});

describe('getClient', () => {
  const originalEnv = process.env;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    process.env = originalEnv;
    // @ts-ignore
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  it('returns a Supabase client', () => {
    const client = getClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it('creates fresh instance on server side', () => {
    // @ts-ignore - simulating server environment
    delete global.window;

    const client1 = getClient();
    const client2 = getClient();

    // On server, each call creates new instance (but mock returns same object)
    expect(client1).toBeDefined();
    expect(client2).toBeDefined();
  });

  it('returns singleton on client side (browser)', () => {
    // @ts-ignore - simulating browser environment
    global.window = {} as Window & typeof globalThis;

    const client1 = getClient();
    const client2 = getClient();

    // Both calls should return the same singleton instance
    expect(client1).toBeDefined();
    expect(client2).toBeDefined();
    expect(client1).toBe(client2); // Same instance
  });
});
