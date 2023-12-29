import { type Message as MessageType } from "@/types/msg-storage";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

export function MessageBox(props: {
  logs: MessageType[];
  visibleChannelIds: number[];
  page: number;
  itemsPerPage: number;
  setItemsPerPage: (itemsPerPage: number) => void;
  setPage: (page: number) => void;
}) {
  const filteredPageCount = Math.ceil(
    props.logs.filter((log) => props.visibleChannelIds.includes(log.channelID))
      .length / props.itemsPerPage,
  );

  const pageLogs = props.logs
    .filter((log) => props.visibleChannelIds.includes(log.channelID))
    .slice(
      (props.page - 1) * props.itemsPerPage,
      props.page * props.itemsPerPage,
    );

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

  return (
    <>
      <div className="flex flex-col justify-center gap-2">
        <div className=" flex max-h-screen w-full flex-col gap-2 overflow-x-hidden overflow-y-scroll rounded-lg border-2 border-solid border-slate-300 bg-slate-900 p-2 text-slate-300">
          {pageLogs.map((log) => {
            if (props.visibleChannelIds.includes(log.channelID)) {
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
}) {
  if (props.showName) {
    return (
      <>
        <div className="grid w-full grid-cols-[10%_10%_10%_70%] gap-1">
          <span className="col-span-1 text-xs text-slate-600">
            {new Date(props.timestamp).toLocaleString()}
          </span>
          <span className="col-span-1">#{props.channelName}</span>
          <span className="col-span-1">@{props.userName}</span>
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
