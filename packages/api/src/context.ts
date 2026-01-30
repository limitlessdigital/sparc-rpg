// tRPC Context - passed to all procedures

export interface Session {
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
}

export interface Context {
  session: Session | null;
}

export function createTRPCContext(opts: { session: Session | null }): Context {
  return {
    session: opts.session,
  };
}
