"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function NoAccess() {
  const [searchParams] = useSearchParams();

  let moduleName = "/";

  if (searchParams?.[0] == "module") {
    moduleName = searchParams?.[1];
  }

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-slate-900">
        <p className="text-2xl text-white">
          You have no access to the {moduleName} module. Please contact an
          admin.
        </p>
        <div className="">
          <Link href={"/"}>
            <Button
              variant={"default"}
              className="bg-slate-300 hover:bg-slate-100"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
