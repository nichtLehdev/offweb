import { type NextApiRequest } from "next";
import { env } from "@/env";
import mariadb from "mariadb";
import dayjs from "dayjs";

const pool = mariadb.createPool({
  host: env.OFFBOT_URL,
  user: env.OFFBOT_USER,
  password: env.OFFBOT_PASSWORD,
  database: env.OFFBOT_DATABASE,
  connectionLimit: 5,
  port: Number(env.OFFBOT_PORT),
});

async function handler(req: NextApiRequest) {
  // @ts-expect-error: 2339
  const json = await req.json();

  const status = json.status;

  // Get Price from API
  const origin = status.train.origin.evaIdentifier
    ? "L=" + status.train.origin.evaIdentifier
    : "O=" + status.train.origin.name;
  const destination = status.train.destination.evaIdentifier
    ? "L=" + status.train.destination.evaIdentifier
    : "O=" + status.train.destination.name;

  const journeyNumber = status.train.journeyNumber;
  const lineName = status.train.lineName;

  const departure = dayjs(status.train.origin.departurePlanned as string);
  // departure in UTC + 0, add offset to current timezone
  departure.add(dayjs().utcOffset(), "minute");
  const arrival = dayjs(status.train.destination.arrivalPlanned as string);
  // arrival in UTC + 0, add offset to current timezone
  arrival.add(dayjs().utcOffset(), "minute");

  console.log("Origin: " + origin);
  console.log("Destination: " + destination);
  console.log("JourneyNumber: " + journeyNumber);
  console.log("LineName: " + lineName);
  console.log("Departure: " + departure.format("YYYY-MM-DDTHH:mm:ss"));
  console.log("Arrival: " + arrival.format("YYYY-MM-DDTHH:mm:ss"));

  // Add x hours to departure and arrival

  const body = {
    abfahrtsHalt: origin,
    anfrageZeitpunkt: departure.format("YYYY-MM-DDTHH:mm:ss"),
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
    if (part.verkehrsmittel.nummer !== journeyNumber) {
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
      console.log("Price: " + price);
    }
    break;
  }

  const conn = await pool.getConnection();
  const query =
    "INSERT INTO `traewelling_checkin` VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `tw_status_id` = ?";
  await conn.query(query, [status.id, status.user, price, status.id]);
  await conn.release();

  return new Response("New Checkin imported", {
    status: 200,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
