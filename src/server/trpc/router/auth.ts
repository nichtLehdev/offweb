import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getAllChannels: protectedProcedure
    .input(z.object({ onlyCurrent: z.boolean() }))
    .output(z.array(z.object({})))
    .query(async () => {
      const response = await fetch(
        process.env.MESSAGE_STORAGE_URL +
          "/channels" +
          "?auth=" +
          process.env.MESSAGE_STORAGE_TOKEN
      );
      const channels = await response.json();
      return channels;
    }),
});
