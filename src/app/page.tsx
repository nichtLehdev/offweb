import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/server";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const twitchAccess = await api.twitch.getModuleAccess.query();

  return (
    <>
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
        )) ?? (
          <Link href={"/api/auth/signin?callbackUrl=/"}>
            <Button
              variant={"default"}
              className="bg-slate-300 hover:bg-slate-100"
            >
              Login
            </Button>
          </Link>
        )}
      </div>
      <main className="flex  h-screen flex-col items-center justify-around bg-slate-900 text-slate-200">
        <div className="flex w-full flex-col items-center justify-center">
          <div>
            <span className="group relative bg-gradient-to-r from-violet-950 via-violet-600 to-violet-900 bg-clip-text text-9xl font-black text-transparent">
              Offchat
            </span>
          </div>

          <div className="w-xl flex flex-row items-center justify-center overflow-hidden">
            <span className="animate-banner block max-w-xl whitespace-nowrap text-center text-3xl font-black">
              We are a group of hobbyist developers with different projects.
              This website is currently under development.
            </span>
          </div>
          <span className="mt-10 animate-pulse whitespace-nowrap text-3xl font-black underline ">
            <Link href={"https://github.com/Offchat"}>Go to Github</Link>
          </span>
          {twitchAccess && (
            <div className="mt-5 text-slate-900">
              <Link href={"/twitch"}>
                <Button
                  variant={"default"}
                  className="bg-slate-300 hover:bg-slate-100"
                >
                  Twitch
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
