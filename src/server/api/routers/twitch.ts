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

      const uniqueChannels = [] as { channelId: number; msgCount: number }[];
      channels.forEach((channel) => {
        if (
          !uniqueChannels.find(
            (uniqueChannel) => uniqueChannel.channelId === channel,
          )
        ) {
          uniqueChannels.push({ channelId: channel, msgCount: 1 });
        } else {
          uniqueChannels.find(
            (uniqueChannel) => uniqueChannel.channelId === channel,
          )!.msgCount++;
        }
      });

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
          (currentChannel) =>
            currentChannel.channelId === uniqueChannel.channelId,
        );
        if (currentChannel) {
          filteredChannels.push({
            channelId: uniqueChannel.channelId,
            displayName: currentChannel.displayName,
            msgCount: uniqueChannel.msgCount,
          });
        }
      });

      // sort by msgCount
      filteredChannels.sort((a, b) => b.msgCount - a.msgCount);

      return filteredChannels;
    }),
  getLogOfUser: protectedProcedure
    .input(
      z.object({
        userInput: z.string() || z.number(),
        limit: z.number().optional(),
        offset: z.number().optional(),
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
});
