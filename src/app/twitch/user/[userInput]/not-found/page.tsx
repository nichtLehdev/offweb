"use client";

import { Button } from "@/components/ui/button";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function UserNotFound() {
  const params = useParams();
  const userInput = params.userInput as string;
  return (
    <>
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
      <div className="grid h-screen w-full place-content-center justify-center bg-slate-900 align-middle text-slate-200 ">
        <div className="items-center">
          <h1 className="text-2xl text-slate-200">
            No messages stored for {userInput}
          </h1>
        </div>
      </div>
    </>
  );
}
