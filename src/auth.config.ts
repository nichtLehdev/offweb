import Passage from "next-auth/providers/passage"
import Github from "next-auth/providers/github"
import Twitch from "next-auth/providers/twitch"
import type { NextAuthConfig } from "next-auth"

export default{
    providers: [ Passage, Github, Twitch ],
} satisfies NextAuthConfig