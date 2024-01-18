/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { type NextApiRequest } from "next";
import { env } from "@/env";
import { URLSearchParams } from "url";
import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: env.OFFBOT_URL,
  user: env.OFFBOT_USER,
  password: env.OFFBOT_PASSWORD,
  database: env.OFFBOT_DATABASE,
  connectionLimit: 5,
  port: Number(env.OFFBOT_PORT),
});

// Example API route
const GET = async (req: NextApiRequest) => {
  if (req.url === undefined) {
    return new Response("Hello World", {
      status: 500,
    });
  }
  const params = new URL(req.url).searchParams;
  const code = params.get("code");

  if (code === null) {
    return new Response("No Code returned from Traewelling", {
      status: 500,
    });
  }

  const formData = new URLSearchParams();
  formData.append("client_id", env.TRAEWELLING_CLIENT_ID);
  formData.append("client_secret", env.TRAEWELLING_CLIENT_SECRET);
  formData.append("redirect_uri", env.TRAEWELLING_REDIRECT_URI);
  formData.append("grant_type", "authorization_code");
  formData.append("code", code);
  formData.append(
    "trwl_webhook_url",
    "https://cce5-188-95-65-41.ngrok-free.app/api/bot/webhook",
  );
  formData.append(
    "trwl_webhook_events",
    "checkin_create,checkin_update,checkin_delete,notification",
  );

  const tokenResponse = await fetch(env.TRAEWELLING_URL + "/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const json = await tokenResponse.json();

  const access_token = json.access_token;
  const refresh_token = json.refresh_token;
  const expires_in = json.expires_in;

  const userResponse = await fetch(env.TRAEWELLING_URL + "/api/v1/auth/user", {
    headers: {
      Authorization: "Bearer " + access_token,
      Accept: "application/json",
    },
  });

  const userJson = await userResponse.json();

  if (userJson.data.id === undefined) {
    console.log(userResponse, userJson);
    return new Response("No User returned from Traewelling ", {
      status: 500,
    });
  }

  const user = {
    id: userJson.data.id,
    displayName: userJson.data.displayName,
    username: userJson.data.username,
    access_token,
    refresh_token,
    webhook_secret: json.webhook.secret,
  };

  const query =
    "INSERT INTO traewelling_user (`id`, `display_name`, `name`, `valid_until`, `access_token`, `refresh_token`, `webhook_secret`) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `display_name` = ?, `name` = ?, `valid_until` = ?, `access_token` = ?, `refresh_token` = ?, `webhook_secret` = ?";

  const conn = await pool.getConnection();
  await conn.query(query, [
    user.id,
    user.displayName,
    user.username,
    new Date(Date.now() + (expires_in - 7 * 24 * 60 * 60) * 1000).toISOString(),
    user.access_token,
    user.refresh_token,
    user.webhook_secret,
    user.displayName,
    user.username,
    new Date(Date.now() + (expires_in - 7 * 24 * 60 * 60) * 1000).toISOString(),
    user.access_token,
    user.refresh_token,
    user.webhook_secret,
  ]);
  await conn.release();

  return new Response("User registered! You can close this page now!", {
    status: 200,
  });
};

export { GET };
