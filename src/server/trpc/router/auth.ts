import { router, publicProcedure, protectedProcedure } from "../trpc";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getAllChannels: protectedProcedure.query(async () => {
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
