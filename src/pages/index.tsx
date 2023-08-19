import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";

import NavBar from "../components/navbar";

const Home: NextPage = () => {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <>
        <main>Loading...</main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="flex  h-screen flex-col items-center justify-around">
        <div className="flex w-full flex-col items-center justify-center">
          <div>
            <span className="group relative text-9xl font-black">Offchat</span>
          </div>

          <div className="w-xl flex flex-row items-center justify-center overflow-hidden">
            <span className="block max-w-xl animate-banner whitespace-nowrap text-center text-3xl font-black">
              We are a group of hobbyist developers with different projects.
              This website is currently under development.
            </span>
          </div>
          <span className="mt-10 animate-pulse whitespace-nowrap text-3xl font-black underline ">
            <Link href={"https://github.com/Offchat"}>Go to Github</Link>
          </span>
        </div>
      </main>
    </>
  );
};

export default Home;
