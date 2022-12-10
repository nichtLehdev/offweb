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
