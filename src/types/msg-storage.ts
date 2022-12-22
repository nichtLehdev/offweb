export type Channel = {
  ID: number;
  channelID: number;
  channelName: string;
  current: boolean;
  sinceTS: null | number;
};

export type Message = {
  userID: number;
  userName: string;
  message: string;
  moderator: boolean;
  subscriber: boolean;
  msgTS: string;
  table_name: string;
  channelID: number;
  channelName: string;
};

export type returnedGlobalEmote = {
  name: string;
  url: string;
};

export type returnedChannelEmote = {
  name: string;
  url: string;
  channelID: string;
};

export type Emote = {
  id: string;
  name: string;
  owner: EmoteOwner;
  visibility: number;
  status: number;
  urls: [string, string][];
};

export type EmoteOwner = {
  id: string;
  twitch_id: string;
  login: string;
  display_name: string;
};
