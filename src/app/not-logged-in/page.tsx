"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function NotLoggedIn() {
  const [searchParams] = useSearchParams();

  let path = "/";

  if (searchParams?.[0] == "path") {
    path = searchParams?.[1];
  }

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-slate-900">
        <p className="text-2xl text-white">
          You need to be logged in to visit page {path}
        </p>
        <Link href={"/api/auth/signin?retunTo=" + path}>
          <Button className="rounded-md bg-purple-600 text-white hover:bg-purple-700">
            Login
          </Button>
        </Link>
      </div>
    </>
  );
}
