import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { Emote, Message } from "../../../types/msg-storage";
import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

const getGlobalEmotes = async () => {
  const response = await fetch(`${process.env.SEVENTV_API_URL}/emotes/global`);
  const emotes = await response.json();
  return emotes;
};

const getChannelEmotes = async (channelID: string) => {
  const response = await fetch(
    `${process.env.SEVENTV_API_URL}/users/${channelID}/emotes`
  );
  if (response.status === 404) {
    return [];
  }
  const emotes = (await response.json()) as Emote[];
  return emotes;
};

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
      z.object({
        emotes: z.object({
          global: z.array(
            z.object({
              name: z.string(),
              url: z.string(),
            })
          ),
          specific: z.array(
            z.object({
              name: z.string(),
              url: z.string(),
              channelID: z.string(),
            })
          ),
        }),
        log: z.array(
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
        ),
      })
    )
    .query(async ({ input }) => {
      const authProvider = new ClientCredentialsAuthProvider(
        process.env.TWITCH_CLIENT_ID!,
        process.env.TWITCH_CLIENT_SECRET!
      );

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
      const globalEmotes = await getGlobalEmotes();
      const globalEmotesShort = globalEmotes.map((emote: Emote) => ({
        name: emote.name,
        url: emote.urls[1]![1],
      }));
      const channels = log.map((msg: Message) => msg.channelID);
      const uniqueChannels = [...new Set(channels)] as string[];
      const channelEmotes: { name: string; url: string; channelID: string }[] =
        [];
      for (const channel of uniqueChannels) {
        const emotes = await getChannelEmotes(channel);
        for (const emote of emotes) {
          channelEmotes.push({
            name: emote.name,
            url: emote.urls[0]![1],
            channelID: channel.toString(),
          });
        }
      }
      const apiClient = new ApiClient({ authProvider });
      if (apiClient) {
        for (const channel of channels) {
          const twitchEmotes = await apiClient.chat.getChannelEmotes(channel);
          if (twitchEmotes[0]) {
            const allTwitchEmotes =
              await twitchEmotes[0]!.getAllEmotesFromSet();
            for (const emote of allTwitchEmotes) {
              channelEmotes.push({
                name: emote.name,
                url:
                  emote.getAnimatedImageUrl("1.0", "light") ||
                  emote.getImageUrl(1),
                channelID: channel.toString(),
              });
            }
          }
        }
      }

      return {
        emotes: {
          global: globalEmotesShort,
          specific: channelEmotes,
        },
        log: log,
      };
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
