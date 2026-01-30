import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { type Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
