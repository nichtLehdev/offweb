'use client'
import Link from "next/link";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react"

export function AuthButton() {
    const session = useSession();
    
    return (
        <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
            <Button size="default" asChild>
                {session ? "Log out" : "Log in"}
            </Button>
        </Link>
    )
}