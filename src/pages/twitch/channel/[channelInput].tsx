import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NavBar from "../../../components/navbar";
import { Channel, Message } from "../../../types/msg-storage";
import { trpc } from "../../../utils/trpc";
import bcIcon from "../../../../public/broadcaster.png";
import modIcon from "../../../../public/moderator.png";
import subIcon from "../../../../public/subscriber.png";
import Image from "next/image";
import { Dropdown } from "flowbite-react";

const ChannelPage: NextPage = () => {
  return <div>Work in Progress</div>;
  const { data: session, status } = useSession();
  const { query, isReady } = useRouter();
  const [showNames, setShowNames] = useState(false);
  const [limit, setLimit] = useState(100);
  const { channelInput } = query;
  let page = Number(query.page) || 0;
  if (page < 0) page = 0;

  const channel = Number(channelInput as string);
  console.log(channel);

  const msgCountQuery = trpc.auth.getChannelMsgCount.useQuery({
    input: channelInput as string,
  });

  const msgQuery = trpc.auth.getChannelLogLimitOffset.useQuery({
    limit: limit,
    offset: limit * page,
    id: channel,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      msgQuery.refetch();
      msgCountQuery.refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [msgQuery]);

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
  if (!session || !session!.user!.access) {
    return (
      <>
        <NavBar />
        <main>Not logged in</main>
      </>
    );
  }
  const msgCount = msgCountQuery.data!.count;

  if (page > Math.floor(msgCount / limit)) {
    page = Math.floor(msgCount / limit);
    window.location.href = `/twitch/user/${channel}?page=${page}`;
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
              This User has no messages stored in our database or does not exist
            </p>
            <button className="mt-4 h-12 rounded-xl bg-purple-700 px-8 text-neutral-50 hover:border hover:border-gray-300">
              <Link href="/twitch">Back</Link>
            </button>
          </div>
        </main>
      </>
    );
  }
  const logs = msgQuery.data as Message[];
  const channelName = logs[0]!.channelName;

  return (
    <>
      <NavBar />
      <main className="flex flex-col items-center">
        <div className="flex h-1/6 flex-col items-center justify-center pt-5">
          <h2 className="text-2xl font-bold">Messages in {channelName}</h2>
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
                    {showNames ? (
                      <td className="flex h-fit w-fit flex-row px-1 py-2">
                        {log.userName}{" "}
                        {log.userID == log.channelID ? (
                          <Image
                            className="mt-1.5 ml-2 inline-flex h-4 w-4"
                            src={bcIcon}
                            alt=""
                          />
                        ) : (
                          ""
                        )}
                        {log.moderator ? (
                          <Image
                            className="mt-1.5 ml-2 inline-flex h-4 w-4"
                            src={modIcon}
                            alt=""
                          />
                        ) : (
                          ""
                        )}
                        {log.subscriber ? (
                          <Image
                            className="mt-1.5 ml-2 inline-flex h-4 w-4"
                            src={subIcon}
                            alt=""
                          />
                        ) : (
                          ""
                        )}
                      </td>
                    ) : (
                      ""
                    )}
                    <td className="px-4 py-2">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex h-16 w-full flex-row items-center justify-between rounded-xl rounded-t-none border border-gray-300">
            <div className="ml-4 flex flex-row items-center justify-center">
              <Dropdown label={limit}>
                <Dropdown.Item>
                  <button onClick={() => setLimit(5)}>5</button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <button onClick={() => setLimit(10)}>10</button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <button onClick={() => setLimit(25)}>25</button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <button onClick={() => setLimit(50)}>50</button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <button onClick={() => setLimit(100)}>100</button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <button onClick={() => setLimit(250)}>250</button>
                </Dropdown.Item>
              </Dropdown>
            </div>
            <div className="flex items-center ">
              {page == 0 ? (
                " "
              ) : (
                <>
                  <Link href={`/twitch/user/${channel}?page=0`}>
                    <span className="mr-2 cursor-pointer rounded-lg border border-gray-300 p-2">
                      {0}
                    </span>
                  </Link>
                  <Link href={`/twitch/user/${channel}?page=${page - 5}`}>
                    <span className="mr-2 cursor-pointer rounded-lg border border-gray-300 p-2">
                      {"<<"}
                    </span>
                  </Link>
                  <Link href={`/twitch/user/${channel}?page=${page - 1}`}>
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
                  <Link href={`/twitch/user/${channel}?page=${page + 1}`}>
                    <span className="ml-2 cursor-pointer rounded-lg border border-gray-300 p-2">
                      {">"}
                    </span>
                  </Link>
                  <Link href={`/twitch/user/${channel}?page=${page + 5}`}>
                    <span className="ml-2 cursor-pointer rounded-lg border border-gray-300 p-2">
                      {">>"}
                    </span>
                  </Link>
                  <Link
                    href={`/twitch/user/${channel}?page=${Math.floor(
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
            <div className="mr-4 flex ">
              <input
                type={"checkbox"}
                checked={showNames}
                id={"showName"}
                onChange={() => {
                  setShowNames(!showNames);
                }}
              />
              <label className="ml-2" htmlFor="showName">
                Show Usernames
              </label>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ChannelPage;
