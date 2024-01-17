import { z } from "zod";
import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { TRPCError, initTRPC } from "@trpc/server";
import { type Message } from "@/types/msg-storage";
export const t = initTRPC.create();

export const twitchRouter = t.router({
  getMessageCountAll: protectedProcedure.query(async () => {
    return (await (
      await fetch(
        env.CARDINAL_URL + "msgCountAll" + "?auth=" + env.CARDINAL_TOKEN,
      )
    ).json()) as number;
  }),
  getChannels: protectedProcedure.query(async () => {
    return (await (
      await fetch(env.CARDINAL_URL + "channels" + "?auth=" + env.CARDINAL_TOKEN)
    ).json()) as string[];
  }),
  getChannelsOfUser: protectedProcedure
    .input(
      z.object({
        userInput: z.string() || z.number(),
      }),
    )
    .query(async ({ input }) => {
      const logs = (await (
        await fetch(
          env.CARDINAL_URL +
            "getLog" +
            "?input=" +
            input.userInput +
            "&auth=" +
            env.CARDINAL_TOKEN,
        )
      ).json()) as Message[];
      const channels = logs.map((log) => log.channelID);

      const uniqueChannels = [...new Set(channels)];

      const allCurrentChannels = (await (
        await fetch(
          env.CARDINAL_URL + "channels" + "?auth=" + env.CARDINAL_TOKEN,
        )
      ).json()) as { channelId: number; displayName: string }[];

      const filteredChannels = [] as {
        channelId: number;
        displayName: string;
        msgCount: number;
      }[];
      uniqueChannels.forEach((uniqueChannel) => {
        const currentChannel = allCurrentChannels.find(
          (currentChannel) => currentChannel.channelId === uniqueChannel,
        );
        if (currentChannel) {
          filteredChannels.push({
            channelId: uniqueChannel,
            displayName: currentChannel.displayName,
            msgCount: 0,
          });
        }
      });

      for (const filteredChannel of filteredChannels) {
        // get count of logs of user in channel
        const count = (await (
          await fetch(
            env.CARDINAL_URL +
              "msgCount" +
              "?input=" +
              input.userInput +
              "&channelID=" +
              filteredChannel.channelId +
              "&auth=" +
              env.CARDINAL_TOKEN,
          )
        ).json()) as {
          channels: number;
          count: number;
          userID: number;
          userName: string;
        };
        filteredChannel.msgCount = count.count;
      }

      // sort by msgCount
      filteredChannels.sort((a, b) => b.msgCount - a.msgCount);

      return filteredChannels;
    }),
  getLogOfUser: protectedProcedure
    .input(
      z.object({
        userInput: z.string() || z.number(),
        limit: z.number().optional(),
        offset: z.number().optional().default(0),
      }),
    )
    .query(async ({ input }) => {
      const limitoffset =
        input.limit && input.offset
          ? "&limit=" + input.limit + "&offset=" + input.offset
          : "";
      const logs = (await (
        await fetch(
          env.CARDINAL_URL +
            "getLog" +
            "?input=" +
            input.userInput +
            "&auth=" +
            env.CARDINAL_TOKEN +
            limitoffset,
        )
      ).json()) as Message[];

      // remove duplicates
      const uniqueLogs = [] as Message[];
      logs.forEach((log) => {
        if (!uniqueLogs.find((uniqueLog) => uniqueLog.msgTS === log.msgTS)) {
          uniqueLogs.push(log);
        }
      });

      // sort by msgTS
      uniqueLogs.sort(
        (a, b) => new Date(b.msgTS).getTime() - new Date(a.msgTS).getTime(),
      );
      return logs;
    }),
  getMessageCountOfUser: protectedProcedure
    .input(
      z.object({
        userInput: z.string() || z.number(),
      }),
    )
    .query(async ({ input }) => {
      return (await (
        await fetch(
          env.CARDINAL_URL +
            "msgCount" +
            "?input=" +
            input.userInput +
            "&auth=" +
            env.CARDINAL_TOKEN,
        )
      ).json()) as {
        channels: number;
        count: number;
        userID: number;
        userName: string;
      };
    }),
  getModuleAccess: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) return false;

    const currentUserMail = ctx.session.user.email;
    const currentUser = await ctx.db.user.findFirst({
      where: {
        email: currentUserMail,
      },
    });
    const twitchModule = await ctx.db.module.findFirst({
      where: {
        name: "Twitch",
      },
    });
    if (!currentUser) {
      return false;
    }

    if (!twitchModule) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Twitch module not found",
      });
    }
    const moduleAccess = await ctx.db.userAccess.findFirst({
      where: {
        userId: currentUser.id,
        accessTo: {
          some: {
            id: twitchModule.id,
          },
        },
      },
    });

    return moduleAccess ? true : false;
  }),
  getLogsInChannel: protectedProcedure
    .input(
      z.object({
        userInput: z.string() || z.number(),
        length: z.number().default(50),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ input }) => {
      const limitoffset =
        input.length && input.offset
          ? "&limit=" + input.length + "&offset=" + input.offset
          : "&limit=" + 50 + "&offset=" + 0;

      const channel = (await (
        await fetch(
          env.CARDINAL_URL +
            "msgCountChannel" +
            "?input=" +
            input.userInput +
            "&auth=" +
            env.CARDINAL_TOKEN,
        )
      ).json()) as {
        channelID: number;
        count: number;
      };

      const logs = (await (
        await fetch(
          env.CARDINAL_URL +
            "getChannelLog" +
            "?channelId=" +
            Number(channel.channelID) +
            "&auth=" +
            env.CARDINAL_TOKEN +
            limitoffset,
        )
      ).json()) as Message[];

      // remove duplicates
      const uniqueLogs = [] as Message[];
      logs.forEach((log) => {
        if (!uniqueLogs.find((uniqueLog) => uniqueLog.msgTS === log.msgTS)) {
          uniqueLogs.push(log);
        }
      });

      // sort by msgTS
      uniqueLogs.sort(
        (a, b) => new Date(b.msgTS).getTime() - new Date(a.msgTS).getTime(),
      );
      return logs;
    }),
  getMessageCountOfChannel: protectedProcedure
    .input(
      z.object({
        userInput: z.string() || z.number(),
      }),
    )
    .query(async ({ input }) => {
      return (await (
        await fetch(
          env.CARDINAL_URL +
            "msgCountChannel" +
            "?input=" +
            input.userInput +
            "&auth=" +
            env.CARDINAL_TOKEN,
        )
      ).json()) as {
        channelID: number;
        count: number;
      };
    }),
});
