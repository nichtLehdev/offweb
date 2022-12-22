import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const msgRouter = router({
  getChannelLog: protectedProcedure
    .input(z.object({ id: z.number() }))
    .output(
      z.array(
        z.object({
          userID: z.number(),
          userName: z.string(),
          message: z.string(),
          moderator: z.boolean(),
          subscriber: z.boolean(),
          msgTS: z.string(),
          table_name: z.string(),
          channelID: z.number(),
          channelName: z.string(),
        })
      )
    )
    .query(async ({ input }) => {
      const response = await fetch(
        process.env.MESSAGE_STORAGE_URL +
          "/getChannelLog/" +
          "?auth=" +
          process.env.MESSAGE_STORAGE_TOKEN +
          "&channelID=" +
          input.id
      );
      const log = await response.json();
      return log;
    }),
  getChannelLogLimitOffset: protectedProcedure
    .input(z.object({ id: z.number(), limit: z.number(), offset: z.number() }))
    .output(
      z.array(
        z.object({
          userID: z.number(),
          userName: z.string(),
          message: z.string(),
          moderator: z.boolean(),
          subscriber: z.boolean(),
          msgTS: z.string(),
          table_name: z.string(),
          channelID: z.number(),
          channelName: z.string(),
        })
      )
    )
    .query(async ({ input }) => {
      const response = await fetch(
        process.env.MESSAGE_STORAGE_URL +
          "/getChannelLog/" +
          "?auth=" +
          process.env.MESSAGE_STORAGE_TOKEN +
          "&channelID=" +
          input.id +
          "&limit=" +
          input.limit +
          "&offset=" +
          input.offset
      );
      const log = await response.json();
      return log;
    }),
  getLog: protectedProcedure
    .input(z.object({ input: z.string() }))
    .output(
      z.array(
        z.object({
          userID: z.number(),
          userName: z.string(),
          message: z.string(),
          moderator: z.boolean(),
          subscriber: z.boolean(),
          msgTS: z.string(),
          table_name: z.string(),
          channelID: z.number(),
          channelName: z.string(),
        })
      )
    )
    .query(async ({ input }) => {
      const response = await fetch(
        process.env.MESSAGE_STORAGE_URL +
          "/getLog/" +
          "?auth=" +
          process.env.MESSAGE_STORAGE_TOKEN +
          "&input=" +
          input.input
      );
      const log = await response.json();
      return log;
    }),
  getLogLimitOffset: protectedProcedure
    .input(
      z.object({
        input: z.string(),
        limit: z.number(),
        offset: z.number(),
      })
    )
    .output(
      z.array(
        z.object({
          userID: z.number(),
          userName: z.string(),
          message: z.string(),
          moderator: z.boolean(),
          subscriber: z.boolean(),
          msgTS: z.string(),
          table_name: z.string(),
          channelID: z.number(),
          channelName: z.string(),
        })
      )
    )
    .query(async ({ input }) => {
      const response = await fetch(
        process.env.MESSAGE_STORAGE_URL +
          "/getLog/" +
          "?auth=" +
          process.env.MESSAGE_STORAGE_TOKEN +
          "&input=" +
          input.input +
          "&limit=" +
          input.limit +
          "&offset=" +
          input.offset
      );
      const log = await response.json();
      return log;
    }),
  getLogFromChannel: protectedProcedure
    .input(z.object({ userInput: z.string(), channelId: z.number() }))
    .output(
      z.array(
        z.object({
          userID: z.number(),
          userName: z.string(),
          message: z.string(),
          moderator: z.boolean(),
          subscriber: z.boolean(),
          msgTS: z.string(),
          table_name: z.string(),
          channelID: z.number(),
          channelName: z.string(),
        })
      )
    )
    .query(async ({ input }) => {
      const response = await fetch(
        process.env.MESSAGE_STORAGE_URL +
          "/getLogFromChannel/" +
          "?auth=" +
          process.env.MESSAGE_STORAGE_TOKEN +
          "&input=" +
          input.userInput +
          "&channelID=" +
          input.channelId
      );
      const log = await response.json();
      return log;
    }),
  getLogFromChannelLimitOffset: protectedProcedure
    .input(
      z.object({
        userInput: z.string(),
        channelId: z.number(),
        limit: z.number(),
        offset: z.number(),
      })
    )
    .output(
      z.array(
        z.object({
          userID: z.number(),
          userName: z.string(),
          message: z.string(),
          moderator: z.boolean(),
          subscriber: z.boolean(),
          msgTS: z.string(),
          table_name: z.string(),
          channelID: z.number(),
          channelName: z.string(),
        })
      )
    )
    .query(async ({ input }) => {
      const response = await fetch(
        process.env.MESSAGE_STORAGE_URL +
          "/getLogFromChannel/" +
          "?auth=" +
          process.env.MESSAGE_STORAGE_TOKEN +
          "&input=" +
          input.userInput +
          "&channelID=" +
          input.channelId +
          "&limit=" +
          input.limit +
          "&offset=" +
          input.offset
      );
      const log = await response.json();
      return log;
    }),
  getUserMsgCount: protectedProcedure
    .input(z.object({ input: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        process.env.MESSAGE_STORAGE_URL +
          "/msgCount/" +
          "?auth=" +
          process.env.MESSAGE_STORAGE_TOKEN +
          "&input=" +
          input.input
      );
      const log = await response.json();
      return log;
    }),

  getChannelMsgCount: protectedProcedure
    .input(z.object({ input: z.string() }))
    .output(z.object({ channelID: z.number(), count: z.number() }))
    .query(async ({ input }) => {
      const response = await fetch(
        process.env.MESSAGE_STORAGE_URL +
          "/msgCountChannel/" +
          "?auth=" +
          process.env.MESSAGE_STORAGE_TOKEN +
          "&input=" +
          input.input
      );
      const log = await response.json();
      return log;
    }),
  getOverallMsgCount: protectedProcedure.output(z.number()).query(async () => {
    const response = await fetch(
      process.env.MESSAGE_STORAGE_URL +
        "/msgCountAll/" +
        "?auth=" +
        process.env.MESSAGE_STORAGE_TOKEN
    );
    const log = await response.json();
    return log;
  }),
});
