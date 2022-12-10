import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import NavBar from "../components/navbar";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

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
      <main>Guestbook</main>
      {session ? (
        <div>
          <p>Hi {session.user?.name}</p>
          <button onClick={() => signOut()}> Logout</button>
        </div>
      ) : (
        <div>
          <button
            className="rounded-md bg-neutral-600 p-2"
            onClick={() => signIn("discord")}
          >
            Login with Discord
          </button>
          <button
            className="rounded-md bg-neutral-600 p-2"
            onClick={() => signIn("github")}
          >
            Login with Github
          </button>
        </div>
      )}
    </>
  );
};

export default Home;
