import { Button } from "flowbite-react";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import NavBar from "../../components/navbar";
import { trpc } from "../../utils/trpc";

const TwitchPage: NextPage = () => {
  const { data: session, status } = useSession();
  const channelQuery = trpc.auth.getAllChannels.useQuery({ onlyCurrent: true });
  const msgQuery = trpc.messages.getOverallMsgCount.useQuery();
  const [search, setSearch] = useState("");
  const [option, setOption] = useState("user");

  const radioChannel = useRef<HTMLButtonElement>(null);
  const radioUser = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      msgQuery.refetch();
    }, 2500);
    return () => clearInterval(interval);
  }, [msgQuery]);

  const channels = channelQuery.data || [];
  const allMessages = msgQuery.data || 0;

  if (
    status === "loading" ||
    channelQuery.status === "loading" ||
    msgQuery.status === "loading"
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

  return (
    <>
      <NavBar />
      <main className="flex  h-screen flex-col items-center justify-around">
        <div>
          <div>
            <form action={"/twitch/" + option + "/" + search}>
              <input
                className="h-12 rounded-lg rounded-r-none border-2 border-gray-300  bg-inherit px-5 pr-16 text-sm focus:outline-none"
                id="userSearch"
                type="text"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder={"search for " + option.toLowerCase()}
              />
              <button
                type="submit"
                className="broder-2 h-12 rounded-lg rounded-l-none border-purple-700 bg-purple-700 px-5"
              >
                Search
              </button>
            </form>
          </div>
          <div className="md:mt-5" />
          <div>
            <button
              ref={radioUser}
              className="h-12 w-1/2 rounded-lg rounded-r-none border border-gray-300 bg-purple-700"
              onClick={(e) => {
                radioUser.current!.classList.add("bg-purple-700");
                radioChannel.current!.classList.remove("bg-purple-700");
                setOption("user");
              }}
            >
              User
            </button>
            <button
              ref={radioChannel}
              disabled
              className="h-12 w-1/2 rounded-lg rounded-l-none border border-gray-300 bg-inherit disabled:cursor-not-allowed disabled:bg-gray-200 disabled:bg-opacity-30"
              onClick={() => {
                radioUser.current!.classList.remove("bg-purple-700");
                radioChannel.current!.classList.add("bg-purple-700");
                setOption("channel");
              }}
            >
              Channel
            </button>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center">
          <span className="text-9xl font-black">
            {allMessages.toLocaleString()}
            <span className="block text-right text-3xl font-black ">
              Messages
            </span>
          </span>
          <div className="m-6"></div>
          <span className="text-5xl font-black">in</span>
          <div className="m-6"></div>
          <span className="group text-9xl font-black">
            {channels.length.toLocaleString()}
            <span className="block text-right text-3xl font-black">
              Channels
            </span>
          </span>
        </div>
      </main>
    </>
  );
};

export default TwitchPage;
