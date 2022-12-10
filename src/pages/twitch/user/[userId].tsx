import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../../components/navbar";
import { Message } from "../../../types/msg-storage";
import { trpc } from "../../../utils/trpc";

const UserPage: NextPage = () => {
  const { data: session, status } = useSession();
  const { query, isReady } = useRouter();
  const limit = 100;
  const { userId } = query;
  var page = Number(query.page) || 0;
  if (page < 0) page = 0;

  const msgCountQuery = trpc.auth.getUserMsgCount.useQuery({
    id: Number(userId),
  });

  const msgQuery = trpc.auth.getLogLimitOffset.useQuery({
    limit: limit,
    offset: limit * page,
    id: Number(userId),
  });

  if (
    status === "loading" ||
    !isReady ||
    msgCountQuery.status === "loading" ||
    msgQuery.status === "loading" ||
    !msgQuery.data
  ) {
    return (
      <>
        <NavBar />
        <main>Loading...</main>
      </>
    );
  }
  if (!session || !session.user!.access) {
    return (
      <>
        <NavBar />
        <main>Not logged in</main>
      </>
    );
  }
  var msgCount = msgCountQuery.data.count;

  if (page > Math.floor(msgCount / limit)) {
    page = Math.floor(msgCount / limit);
    window.location.href = `/twitch/user/${userId}?page=${page}`;
    return (
      <>
        <main>Loading...</main>
      </>
    );
  }

  if (msgCount === 0) {
    return (
      <>
        <NavBar />
        <main>
          <div className="flex flex-col items-center justify-center pt-5">
            <p className="text-xl font-bold">
              This User has no messages stored in our database
            </p>
          </div>
        </main>
      </>
    );
  }
  var logs = msgQuery.data as Message[];
  const userName = logs[0]!.userName;

  return (
    <>
      <NavBar />
      <main className="flex flex-col items-center">
        <div className="flex h-1/6 flex-col items-center justify-center pt-5">
          <h2 className="text-2xl font-bold">Messages of {userName}</h2>
          <p className="text-xl font-bold">Total Messages: {msgCount}</p>
        </div>
        <div className="flex h-4/6  w-4/5 flex-col items-center justify-center overflow-hidden ">
          <div className="flex h-5/6 w-full flex-col  overflow-y-scroll rounded-xl rounded-b-none border border-gray-300 pt-5">
            <table className="table-auto">
              <tbody>
                {logs.map((log) => (
                  <tr key={log.msgTS}>
                    <td className="w-32 py-2 pr-0 pl-2">
                      {new Date(parseInt(log.msgTS)).toLocaleTimeString()}
                    </td>
                    <td className="w-fit px-1 py-2 font-semibold">
                      #{log.channelName}
                    </td>

                    <td className="px-4 py-2">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex h-16 w-full items-center justify-center rounded-xl rounded-t-none border border-gray-300">
            {page == 0 ? (
              " "
            ) : (
              <>
                <Link href={`/twitch/user/${userId}?page=0`}>
                  <span className="mr-2 cursor-pointer rounded-lg border border-gray-300 p-2">
                    {0}
                  </span>
                </Link>
                <Link href={`/twitch/user/${userId}?page=${page - 5}`}>
                  <span className="mr-2 cursor-pointer rounded-lg border border-gray-300 p-2">
                    {"<<"}
                  </span>
                </Link>
                <Link href={`/twitch/user/${userId}?page=${page - 1}`}>
                  <span className="mr-2 cursor-pointer rounded-lg border border-gray-300 p-2">
                    {"<"}
                  </span>
                </Link>
              </>
            )}
            <span>{page + 1}</span>
            {page == Math.floor(msgCount / limit) ? (
              " "
            ) : (
              <>
                <Link href={`/twitch/user/${userId}?page=${page + 1}`}>
                  <span className="ml-2 cursor-pointer rounded-lg border border-gray-300 p-2">
                    {">"}
                  </span>
                </Link>
                <Link href={`/twitch/user/${userId}?page=${page + 5}`}>
                  <span className="ml-2 cursor-pointer rounded-lg border border-gray-300 p-2">
                    {">>"}
                  </span>
                </Link>
                <Link
                  href={`/twitch/user/${userId}?page=${Math.floor(
                    msgCount / limit
                  )}`}
                >
                  <span className="ml-2 cursor-pointer rounded-lg border border-gray-300 p-2">
                    {Math.floor(msgCount / limit) + 1}
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default UserPage;
