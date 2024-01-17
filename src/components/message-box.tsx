import { type Message as MessageType } from "@/types/msg-storage";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import Image from "next/image";

export function MessageBox(props: {
  logs: MessageType[];
  logCount: number;
  visibleChannelIds: number[];
  page: number;
  itemsPerPage: number;
  fullDataLoaded: boolean;
  mode: "user" | "channel";
  setItemsPerPage: (itemsPerPage: number) => void;
  setPage: (page: number) => void;
}) {
  const filteredPageCount =
    props.mode == "user"
      ? Math.ceil(
          props.logs.filter((log) =>
            props.visibleChannelIds.includes(log.channelID),
          ).length / props.itemsPerPage,
        )
      : Math.ceil(props.logCount / props.itemsPerPage);

  const pageLogs =
    props.mode == "user"
      ? props.logs
          .filter((log) => props.visibleChannelIds.includes(log.channelID))
          .slice(
            (props.page - 1) * props.itemsPerPage,
            props.page * props.itemsPerPage,
          )
      : props.logs;

  if (props.logs.length === 0) {
    return (
      <div className=" flex max-h-screen w-full flex-col gap-2 overflow-x-hidden rounded-lg border-2 border-solid border-slate-300 bg-slate-900 p-2 text-slate-300">
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
      </div>
    );
  }

  if (pageLogs.length === 0) {
    return (
      <div className=" flex max-h-screen w-full flex-col gap-2 overflow-x-hidden rounded-lg border-2 border-solid border-slate-300 bg-slate-900 p-2 text-slate-300">
        <span className="text-center text-slate-300">
          No messages here! You may need to change the filter.
        </span>
        {!props.fullDataLoaded && (
          <div>
            <span className="text-center text-slate-300">
              Loading more messages...
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex min-w-full flex-col justify-center gap-2">
        {!props.fullDataLoaded && (
          <div>
            <span className="text-center text-slate-300">
              Loading more messages...
            </span>
          </div>
        )}
        <div className=" flex max-h-screen w-full flex-col gap-2 overflow-x-hidden overflow-y-scroll rounded-lg border-2 border-solid border-slate-300 bg-slate-900 p-2 text-slate-300">
          {pageLogs.map((log) => {
            if (
              props.visibleChannelIds.includes(log.channelID) ||
              props.mode == "channel"
            ) {
              return (
                <div
                  key={log.msgTS + new Date().getTime()}
                  className="flex justify-start gap-1 align-middle"
                >
                  <Message
                    message={log.message}
                    channelName={log.channelName}
                    userName={log.userName}
                    timestamp={Number(log.msgTS)}
                    subscriber={log.subscriber}
                    moderator={log.moderator}
                    broadcaster={log.userName === log.channelName}
                    showName
                    mode={props.mode}
                  />
                </div>
              );
            }
          })}
        </div>
        <div>
          <div className="flex justify-center gap-2">
            <Button
              className="rounded-lg bg-slate-300 p-2 hover:bg-slate-100"
              onClick={() => {
                props.setPage(1);
              }}
              disabled={props.page === 1}
            >
              First
            </Button>
            <Button
              className="rounded-lg bg-slate-300 p-2 hover:bg-slate-100"
              onClick={() => {
                props.setPage(props.page - 1);
              }}
              disabled={props.page === 1}
            >
              Previous
            </Button>
            <span className="mt-2 h-full align-middle text-slate-300">
              Page {props.page} of {filteredPageCount}
            </span>
            <Button
              className="rounded-lg bg-slate-300 p-2 hover:bg-slate-100"
              onClick={() => {
                props.setPage(props.page + 1);
              }}
              disabled={props.page === filteredPageCount}
            >
              Next
            </Button>
            <Button
              className="rounded-lg bg-slate-300 p-2 hover:bg-slate-100"
              onClick={() => {
                props.setPage(filteredPageCount);
              }}
              disabled={props.page === filteredPageCount}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function MessageSkeleton() {
  return (
    <div className="grid w-full grid-cols-[20%_20%_60%] gap-1 md:min-w-fit">
      <Skeleton className="col-span-1 h-4 w-2/3 justify-self-center" />
      <Skeleton className="col-span-1 h-4 w-2/3 justify-self-center" />
      <Skeleton className="col-span-1 h-4 w-2/3 justify-self-center" />
    </div>
  );
}

function Message(props: {
  message: string;
  channelName: string;
  userName: string;
  timestamp: number;
  subscriber: boolean;
  moderator: boolean;
  broadcaster: boolean;
  showName?: boolean;
  mode?: "user" | "channel";
}) {
  if (props.mode == "channel") {
    return (
      <>
        <div className="grid w-full grid-cols-[15%_15%_60%] gap-1">
          <span className="col-span-1 text-xs text-slate-600">
            {new Date(props.timestamp).toLocaleString()}
          </span>
          <span className="col-span-1 flex h-full gap-1 align-middle">
            {(props.broadcaster && (
              <Image
                src={"/broadcaster.png"}
                className="mt-1 h-4 w-4"
                alt=""
                width={50}
                height={50}
              />
            )) ||
              (props.moderator && (
                <Image
                  src={"/moderator.png"}
                  className="mt-1 h-4 w-4"
                  alt=""
                  width={50}
                  height={50}
                />
              ))}
            {props.subscriber && (
              <Image
                src={"/subscriber.png"}
                className="mt-1 h-4 w-4"
                alt=""
                width={50}
                height={50}
              />
            )}
            {props.userName}
          </span>
          <span className="col-span-1">{props.message}</span>
        </div>
      </>
    );
  }
  if (props.showName) {
    return (
      <>
        <div className="grid w-full grid-cols-[15%_10%_15%_60%] gap-1">
          <span className="col-span-1 text-xs text-slate-600">
            {new Date(props.timestamp).toLocaleString()}
          </span>
          <span className="col-span-1 break-words">#{props.channelName}</span>
          <span className="col-span-1 flex h-full gap-1 align-middle">
            {(props.broadcaster && (
              <Image
                src={"/broadcaster.png"}
                className="mt-1 h-4 w-4"
                alt=""
                width={50}
                height={50}
              />
            )) ||
              (props.moderator && (
                <Image
                  src={"/moderator.png"}
                  className="mt-1 h-4 w-4"
                  alt=""
                  width={50}
                  height={50}
                />
              ))}
            {props.subscriber && (
              <Image
                src={"/subscriber.png"}
                className="mt-1 h-4 w-4"
                alt=""
                width={50}
                height={50}
              />
            )}
            {props.userName}
          </span>
          <span className="col-span-1">{props.message}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grid w-full grid-cols-[20%_20%_60%] gap-1 md:min-w-fit">
        <span className="col-span-1 h-full align-bottom text-xs text-slate-600">
          {new Date(props.timestamp).toLocaleString()}
        </span>
        <span className="col-span-1 min-w-fit">#{props.channelName}</span>
        <span className="col-span-1 break-words">{props.message}</span>
      </div>
    </>
  );
}
