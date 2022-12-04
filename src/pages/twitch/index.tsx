import { Button } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import NavBar from "../../components/navbar";
import { Channel } from "../../types/msg-storage";
import { trpc } from "../../utils/trpc";

const TwitchPage: NextPage = () => {
  const { data: session, status } = useSession();
  const channels = trpc.auth.getAllChannels.useQuery();
  const chnCount = trpc.auth.getChannelMsgCount.useQuery({
    id: 92108465,
  });

  if (
    status === "loading" ||
    channels.status === "loading" ||
    chnCount.status === "loading"
  ) {
    return (
      <>
        <main>Loading...</main>
      </>
    );
  }
  if (!session || !session.user!.access) {
    return (
      <>
        <NavBar />
        <main>
          Not logged in
          <Button>
            <Link href={"/"}>Back to Home</Link>
          </Button>
        </main>
      </>
    );
  }
  var chn = channels.data as Channel[];

  return (
    <div>
      <NavBar></NavBar>
      <h1>Twitch - Test</h1>
      <p>Currently monitoring {chn.length} Channels</p>
      <p>Message Count of channel with id 92108465: {chnCount.data!.count}</p>
    </div>
  );
};

export default TwitchPage;
