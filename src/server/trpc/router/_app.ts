import { router } from "../trpc";
import { authRouter } from "./auth";
import { msgRouter } from "./messages";

export const appRouter = router({
  auth: authRouter,
  messages: msgRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
