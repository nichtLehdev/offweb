"use client";
import { api } from "@/trpc/react";
import { redirect, useParams } from "next/navigation";
import { useState } from "react";
import { ChannelFilter } from "@/components/channel-filter";
import { MessageBox } from "@/components/message-box";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";

export default function UserPage() {
  const session = useSession();

  const params = useParams();
  const userInput = params.userInput as string;

  // stores the names of the channels that are currently visible
  const [visibleChannels, setVisibleChannels] = useState<string[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [page, setPage] = useState(1);

  const channelQuery = api.twitch.getChannelsOfUser.useQuery({
    userInput: userInput,
  });
  const messageQuery = api.twitch.getLogOfUser.useQuery({
    userInput: userInput,
  });
  const messageCountQuery = api.twitch.getMessageCountOfUser.useQuery({
    userInput: userInput,
  });
  const accessQuery = api.twitch.getModuleAccess.useQuery();

  // set all channels to visible by default
  if (visibleChannels.length === 0 && channelQuery.data) {
    setVisibleChannels(channelQuery.data.map((channel) => channel.displayName));
  }

  // get the channel ids of the visible channels
  const visibleChannelIds = visibleChannels.map((channel) => {
    const channelData = channelQuery.data?.find(
      (channelData) => channelData.displayName === channel,
    );
    return channelData?.channelId ?? -1;
  });

  if (!session) {
    redirect("/not-logged-in?path=/twitch/user/" + userInput);
  }

  if (messageCountQuery.data && messageCountQuery.data.count === 0) {
    redirect(`${userInput}/not-found`);
  }

  if (accessQuery.data === false) {
    redirect("/no-access?module=twitch");
  }

  return (
    <>
      <div className="flex min-w-[800px] justify-center bg-slate-900">
        <div className="absolute left-5 top-5">
          <Link href={"/"}>
            <Button
              variant={"default"}
              className="bg-slate-300 hover:bg-slate-100"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
            </Button>
          </Link>
        </div>
        <div className="absolute left-5 top-20">
          <Link href={"/twitch"}>
            <Button
              variant={"default"}
              className="bg-slate-300 hover:bg-slate-100"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Twitch
            </Button>
          </Link>
        </div>
        <main className="flex h-screen w-full max-w-7xl flex-col justify-center gap-8 ">
          <div>
            <h1 className="text-center text-2xl font-bold text-slate-200">
              Messages of {userInput}
            </h1>
            <h2 className="text-center text-xl text-slate-400">
              Stored <b>{messageCountQuery.data?.count ?? 0}</b> messages in{" "}
              <b>{messageCountQuery.data?.channels ?? 0}</b> channels
            </h2>
          </div>
          <div className="flex max-h-[48rem] gap-4">
            <ChannelFilter
              allChannels={channelQuery.data ?? []}
              filteredChannels={visibleChannels}
              setChannels={setVisibleChannels}
            />
            <MessageBox
              logs={messageQuery.data ?? []}
              visibleChannelIds={visibleChannelIds}
              page={page}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              setPage={setPage}
            />
          </div>
        </main>
      </div>
    </>
  );
}
