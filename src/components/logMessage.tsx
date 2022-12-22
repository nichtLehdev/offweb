import {
  Message,
  returnedChannelEmote,
  returnedGlobalEmote,
} from "../types/msg-storage";

type LogMessageProps = {
  message: Message;
  emotes: {
    global: returnedGlobalEmote[];
    specific: returnedChannelEmote[];
  };
};

const LogMessage = (props: LogMessageProps) => {
  const { message, emotes } = props;

  const words = message.message.split(" ");
  const channelEmotes = emotes.specific.filter((emote) => {
    return emote.channelID === message.channelID.toString();
  });
  //go through each word and check if it is an global or channel emote
  let emoteCount = 0;
  let wordCount = 0;
  const messageWords = words.map((word) => {
    wordCount++;
    const globalEmote = emotes.global.find((emote) => {
      return emote.name === word;
    });
    const channelEmote = channelEmotes.find((emote) => {
      return emote.name === word;
    });
    if (globalEmote) {
      return (
        <img
          src={globalEmote.url}
          alt={globalEmote.name}
          key={globalEmote.name + ++emoteCount}
          className="h-6 w-6"
        />
      );
    } else if (channelEmote) {
      return (
        <img
          src={channelEmote.url}
          alt={channelEmote.name}
          key={channelEmote.name + ++emoteCount}
          className="h-6 w-6"
        />
      );
    } else {
      return <span key={word + wordCount}>{word} </span>;
    }
  });

  return (
    <span className="message__message flex flex-row flex-wrap gap-1">
      {messageWords}
    </span>
  );
};

export default LogMessage;
