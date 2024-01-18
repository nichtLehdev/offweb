import Link from "next/link";
import { env } from "@/env";

export default function BotLoginPage() {
  const loginUrlHost = env.TRAEWELLING_URL + "/oauth/authorize";
  const loginUrlParams = new URLSearchParams({
    response_type: "code",
    client_id: env.TRAEWELLING_CLIENT_ID,
    redirect_uri: env.TRAEWELLING_REDIRECT_URI,
    scope: "read-statuses",
    trwl_webhook_url:
      "https://cce5-188-95-65-41.ngrok-free.app/api/bot/webhook",
    trwl_webhook_events:
      "checkin_create,checkin_update,checkin_delete,notification",
  });

  const loginUrl = loginUrlHost + "?" + loginUrlParams.toString();

  return (
    <>
      <main className="flex h-screen flex-col items-center justify-center gap-2">
        <h1 className="text-4xl">Bot Login</h1>
        <div className="flex flex-col gap-2">
          <Link href={loginUrl}>Login with Traewelling</Link>
        </div>
      </main>
    </>
  );
}
