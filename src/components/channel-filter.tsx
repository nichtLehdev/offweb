import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Skeleton } from "./ui/skeleton";

export function ChannelFilter(props: {
  allChannels: { displayName: string; msgCount: number }[];
  filteredChannels: string[];
  setChannels: (channels: string[]) => void;
}) {
  return (
    <>
      <div className="flex flex-col justify-center gap-2">
        <ChannelSelect
          allChannels={props.allChannels}
          filteredChannels={props.filteredChannels}
          setChannels={props.setChannels}
        />
        {props.allChannels.length > 0 && (
          <div className="flex justify-center gap-2">
            <Button
              className="rounded-lg bg-slate-300 p-2 hover:bg-slate-100"
              onClick={() => {
                props.setChannels([]);
              }}
            >
              Clear
            </Button>
            <Button
              className="rounded-lg bg-slate-300 p-2 hover:bg-slate-100"
              onClick={() => {
                props.setChannels(
                  props.allChannels.map((channel) => channel.displayName),
                );
              }}
            >
              Select All
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

function ChannelSelect(props: {
  allChannels: { displayName: string; msgCount: number }[];
  filteredChannels: string[];
  setChannels: (channels: string[]) => void;
}) {
  if (props.allChannels.length === 0) {
    return (
      <>
        <main className="flex w-32 max-w-sm flex-col justify-center gap-2 rounded-lg border-2 border-solid border-slate-300 bg-slate-900 p-1 text-slate-300">
          <Skeleton className="h-4 w-20 justify-self-center" />
          <Skeleton className="h-4 w-20 justify-self-center" />
          <Skeleton className="h-4 w-20 justify-self-center" />
          <Skeleton className="h-4 w-20 justify-self-center" />
          <Skeleton className="h-4 w-20 justify-self-center" />
          <Skeleton className="h-4 w-20 justify-self-center" />
          <Skeleton className="h-4 w-20 justify-self-center" />
          <Skeleton className="h-4 w-20 justify-self-center" />
        </main>
      </>
    );
  }

  return (
    <>
      <main className="flex w-fit max-w-sm flex-col gap-2 overflow-y-scroll rounded-lg border-2 border-solid border-slate-300 bg-slate-900 p-1 text-slate-300">
        {props.allChannels.map((channel) => {
          return (
            <div
              key={channel.displayName}
              className="flex justify-start gap-1 align-middle"
            >
              <div className="">
                <Checkbox
                  id={channel.displayName}
                  name={channel.displayName}
                  checked={props.filteredChannels.includes(channel.displayName)}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      props.setChannels([
                        ...props.filteredChannels,
                        channel.displayName,
                      ]);
                    } else {
                      props.setChannels(
                        props.filteredChannels.filter(
                          (channelName) => channelName !== channel.displayName,
                        ),
                      );
                    }
                  }}
                />
              </div>
              <label htmlFor={channel.displayName} className="break-words">
                {channel.displayName}{" "}
                <span className="text-right text-sm text-slate-500">
                  [{channel.msgCount}]
                </span>
              </label>
            </div>
          );
        })}
      </main>
    </>
  );
}
