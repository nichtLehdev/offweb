"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { CountUp } from "use-count-up";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function TwitchPage() {
  const session = useSession();
  const channelQuery = api.twitch.getChannels.useQuery();
  const msgQuery = api.twitch.getMessageCountAll.useQuery();
  const accessQuery = api.twitch.getModuleAccess.useQuery();
  const [search, setSearch] = useState("");
  const [option, setOption] = useState("user");
  const [prevCount, setPrevCount] = useState(0);

  const radioChannel = useRef<HTMLButtonElement>(null);
  const radioUser = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      void msgQuery.refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [msgQuery]);

  const channels = channelQuery.data ?? [];
  const allMessages = msgQuery.data ?? 0;

  console.log(session);

  if (!session) {
    redirect("/not-logged-in?path=/twitch");
  }

  if (accessQuery.data === false) {
    redirect("/no-access?module=twitch");
  }

  return (
    <>
      <div className=" flex justify-center bg-slate-900 align-middle">
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
        <div className="absolute right-5 top-5">
          {(session && (
            <Link href={"/api/auth/signout?callbackUrl=/"}>
              <Button
                variant={"default"}
                className="bg-slate-300 hover:bg-slate-100"
              >
                Logout
              </Button>
            </Link>
          )) || (
            <Link href={"/api/auth/signin?callbackUrl=/twitch"}>
              <Button
                variant={"default"}
                className="bg-slate-300 hover:bg-slate-100"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
        <main className="flex h-screen max-w-screen-lg flex-col items-center justify-around text-slate-300">
          <div>
            <Image
              src="/Offchat.png"
              alt={""}
              width={400}
              height={400}
              className="m-0 h-64 w-64 p-0"
            />
          </div>
          <div>
            <div>
              <form action={"/twitch/" + option + "/" + search}>
                <input
                  className="h-12 rounded-xl rounded-r-none border-2 border-gray-300 bg-inherit px-5 pr-16 text-sm focus:outline-none"
                  id="userSearch"
                  type="text"
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  placeholder={"Search for " + option.toLowerCase()}
                />
                <Button
                  type="submit"
                  className="broder-2 h-12 rounded-xl rounded-l-none border-purple-700 bg-purple-700 px-5 hover:bg-purple-950"
                >
                  Search
                </Button>
              </form>
            </div>
            <div className="md:mt-5" />
            <div>
              <Button
                ref={radioUser}
                className="h-12 w-1/2 rounded-xl rounded-r-none border border-gray-300 bg-purple-700 hover:bg-purple-700"
                onClick={() => {
                  radioUser.current!.classList.add("bg-purple-700");
                  radioUser.current!.classList.add("hover:bg-purple-700");
                  radioUser.current!.classList.remove("hover:bg-purple-950");
                  radioChannel.current!.classList.remove("bg-purple-700");
                  radioChannel.current!.classList.add("hover:bg-purple-950");
                  setOption("user");
                }}
              >
                User
              </Button>
              <Button
                ref={radioChannel}
                className="h-12 w-1/2 rounded-xl rounded-l-none border border-gray-300 bg-inherit hover:bg-purple-950 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:bg-opacity-30"
                onClick={() => {
                  radioUser.current!.classList.remove("bg-purple-700");
                  radioUser.current!.classList.add("hover:bg-purple-950");
                  radioChannel.current!.classList.add("bg-purple-700");
                  radioChannel.current!.classList.add("hover:bg-purple-700");
                  radioChannel.current!.classList.remove("hover:bg-purple-950");
                  setOption("channel");
                }}
                disabled
              >
                Channel
              </Button>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-9xl  font-black">
              <CountUp
                isCounting
                start={prevCount}
                end={allMessages}
                duration={4}
                thousandsSeparator="."
                onComplete={() => {
                  setPrevCount(allMessages);
                  return { shouldRepeat: true, duration: 1 };
                }}
              />
              <span className="block text-right text-3xl font-black ">
                Messages
              </span>
            </span>
            <div className="m-6"></div>
            <span className="text-5xl  font-black">in</span>
            <div className="m-6"></div>
            <span className="group text-9xl font-black">
              {channels.length.toLocaleString()}
              <span className="block text-right text-3xl font-black">
                Channels
              </span>
            </span>
          </div>
        </main>
      </div>
    </>
  );
}
