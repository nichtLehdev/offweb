import { env } from "@/env";
import mariadb from "mariadb";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { type Status } from "@/types/traewelling";
import { type NextRequest, NextResponse } from "next/server";
import { io } from "socket.io-client";

const pool = mariadb.createPool({
  host: env.OFFBOT_URL,
  user: env.OFFBOT_USER,
  password: env.OFFBOT_PASSWORD,
  database: env.OFFBOT_DATABASE,
  connectionLimit: 5,
  port: Number(env.OFFBOT_PORT),
});

const socket = io("https://ws.lehdev.de");

async function verbundCodeToPrice(verbundCode: string, ctxRecon: string) {
  const reconResponse = await fetch(
    "https://www.bahn.de/web/api/angebote/recon",
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        ctxRecon: ctxRecon,
        klasse: "KLASSE_2",
        reisende: [
          {
            alter: [],
            typ: "JUGENDLICHER",
            anzahl: 1,
            ermaessigungen: [
              { art: "KEINE_ERMAESSIGUNG", klasse: "KLASSENLOS" },
            ],
          },
        ],
      }),
    },
  );
  const recon = await reconResponse.json();

  if (
    recon.verbindungen.length > 0 &&
    recon.verbindungen[0].reiseAngebote.length > 0
  ) {
    for (const offer of recon.verbindungen[0].reiseAngebote) {
      switch (verbundCode) {
        case "996": // MVV
        case "703": // KVV
        case "708": // saarVV
          if (offer.name == "Einzelfahrkarte Erwachsene") {
            return Number(offer.preis.betrag);
          }
          break;
        case "701": // VRN
          if (offer.name == "Einzel-Ticket") {
            return Number(offer.preis.betrag);
          }
          break;
      }
    }
  }
  return 0;
}

async function newStatus(status: Status) {
  // Get Price from API
  const origin = status.train.origin.evaIdentifier
    ? "L=" + status.train.origin.evaIdentifier
    : "O=" + status.train.origin.name;
  const destination = status.train.destination.evaIdentifier
    ? "L=" + status.train.destination.evaIdentifier
    : "O=" + status.train.destination.name;

  const journeyNumber = status.train.journeyNumber;
  const lineName = status.train.lineName;

  dayjs.extend(utc);

  let actualDeparture = dayjs(status.train.origin.departure);
  actualDeparture = actualDeparture.add(1, "hour");

  let departure = dayjs(status.train.origin.departurePlanned);
  // departure in UTC + 0, add offset to current timezone
  departure = departure.add(1, "hour");
  let arrival = dayjs(status.train.destination.arrivalPlanned);
  // arrival in UTC + 0, add offset to current timezone
  arrival = arrival.add(1, "hour");

  console.log("Origin: " + origin);
  console.log("Destination: " + destination);
  console.log("JourneyNumber: " + journeyNumber);
  console.log("LineName: " + lineName);
  console.log("Departure: " + departure.format("YYYY-MM-DDTHH:mm:ss"));
  console.log("Arrival: " + arrival.format("YYYY-MM-DDTHH:mm:ss"));

  const body = {
    abfahrtsHalt: origin,
    anfrageZeitpunkt: actualDeparture.format("YYYY-MM-DDTHH:mm:ss"),
    ankunftSuche: "ABFAHRT",
    ankunftsHalt: destination,
    bikeCarriage: false,
    klasse: "KLASSE_2",
    produktgattungen: [
      "ICE",
      "EC_IC",
      "IR",
      "REGIONAL",
      "SBAHN",
      "BUS",
      "SCHIFF",
      "UBAHN",
      "TRAM",
      "ANRUFPFLICHTIG",
    ],
    reisende: [
      {
        alter: [],
        typ: "JUGENDLICHER",
        anzahl: 1,
        ermaessigungen: [{ art: "KEINE_ERMAESSIGUNG", klasse: "KLASSENLOS" }],
      },
    ],
    reservierungsKontingenteVorhanden: false,
    rueckfahrtAnfrageFolgt: false,
    schnelleVerbindungen: true,
    sitzplatzOnly: false,
  };

  const response = await fetch(
    "https://www.bahn.de/web/api/angebote/fahrplan",
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  let price = 0;

  const timetable = await response.json();

  const connections = timetable.verbindungen;

  for (const connection of connections) {
    // Only check first part of connection cause Traewelling only supports one part
    const part = connection.verbindungsAbschnitte[0];
    if (
      part.abfahrtsZeitpunkt !== departure.format("YYYY-MM-DDTHH:mm:ss") ||
      part.ankunftsZeitpunkt !== arrival.format("YYYY-MM-DDTHH:mm:ss")
    ) {
      console.log(
        "Time does not match: (Abfahrt: " +
          departure.format("YYYY-MM-DDTHH:mm:ss") +
          ") (Ankunft: " +
          arrival.format("YYYY-MM-DDTHH:mm:ss") +
          ") (Part: " +
          part.abfahrtsZeitpunkt +
          " - " +
          part.ankunftsZeitpunkt +
          ")",
      );
      continue;
    }
    if (
      part.verkehrsmittel.nummer !== journeyNumber &&
      part.verkehrsmittel.name !== lineName
    ) {
      console.log(
        "Train does not match (Part: " +
          part.verkehrsmittel.name +
          ") (JourneyNumber: " +
          part.verkehrsmittel.nummer +
          ") (Train: " +
          lineName +
          ") (JourneyNumber: " +
          journeyNumber +
          ")",
      );

      continue;
    }
    console.log("Found matching connection: Train: " + lineName);
    if (connection.angebotsPreis) {
      price = connection.angebotsPreis.betrag;
    }
    if (price == 0) {
      if (connection.verbundCode) {
        const ctxRecon = connection.ctxRecon;

        price = await verbundCodeToPrice(
          connection.verbundCode as string,
          ctxRecon as string,
        );
      }
    }
    console.log("Price: " + price);
    break;
  }

  const conn = await pool.getConnection();
  const query =
    "INSERT INTO `traewelling_checkin` (tw_status_id, tw_user_id, price) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `tw_status_id` = ?";
  await conn.query(query, [status.id, status.user, price, status.id]);
  await conn.release();

  // Send Socket.io Event
  socket.on("connect", () => {
    console.log("Connected to Socket.io Server");
    socket.emit("init", {
      client: "webhook",
      module: "traewelling",
    });
    socket.emit("newStatus", status);
  });
}

async function validate(req: NextRequest, body: string) {
  // Validate Webhook
  const headers = req.headers;

  // Check if Content Length is set and correct
  const contentLength = headers.get("content-length");
  if (!contentLength) {
    return new NextResponse("Unauthorized! -- Content-Length missing", {
      status: 401,
    });
  }

  const contentLengthInt = parseInt(contentLength);
  if (contentLengthInt > 1024 * 1024) {
    return new NextResponse("Unauthorized! -- Content-Length too big", {
      status: 401,
    });
  }

  // Compare Content-Length with actual body length
  if (body.length !== contentLengthInt) {
    return new NextResponse("Unauthorized! -- Content-Length invalid", {
      status: 401,
    });
  }

  const signature = headers.get("signature");
  const userId = headers.get("x-trwl-user-id");
  const webhookId = headers.get("x-trwl-webhook-id");

  if (!signature || !userId) {
    return new NextResponse("Unauthorized! -- Signature or UserId missing", {
      status: 401,
    });
  }

  const conn = await pool.getConnection();
  const query = `SELECT webhook_secret FROM traewelling_user WHERE id = ? and webhook_id = ? LIMIT 1`;
  const secretQuery = await conn.query(query, [userId, webhookId]);
  await conn.release();

  if (secretQuery.length === 0) {
    return new NextResponse("Unauthorized! -- User not found", {
      status: 401,
    });
  }
  // TODO: Fix Signature Validation
  /*const sig = Buffer.from(signature || "", "utf8");
  const secret: string = secretQuery[0].webhook_secret;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(body).digest("hex"), "utf8");

  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    console.log(
      "Sig: " + sig.toString("utf8") + " Digest: " + digest.toString("utf8"),
    );
    return new NextResponse("Unauthorized! -- Signature invalid", {
      status: 401,
    });
  }*/
}
async function handler(req: NextRequest) {
  const body = await req.text();

  const validation = await validate(req, body);
  if (validation) return validation;

  const json = JSON.parse(body);
  const event = json.event;

  if (event == "checkin_create") await newStatus(json.status as Status);
  else if (event == "notification" && json.notification.type == "StatusLiked")
    socket.emit("newLike", json.notification);
  else console.log("Event not yet supported: " + event);

  return new NextResponse("OK", {
    status: 200,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
