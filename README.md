# Shoukaku

## A stable and updated wrapper around Lavalink
> This is a modified version used in our application infrastructure. <br/>
> Shoukaku: https://github.com/Deivu/Shoukaku <br/>
> Documentation: https://deivu.github.io/Shoukaku/ <br />
> Also modified by: https://github.com/MoscowMusic

### What's the difference?
> We added the "player.info" interface, which wasn't included in Shoukaku, and implemented session recovery from a dump stored in Redis or a Database.<br/>
<hr/>

Please, make sure that only the added changes and examples of their usage will be shown, so it's recommended to familiarize yourself with the [original repository](https://github.com/Deivu/Shoukaku) before starting to read.
<br/>

### Track Interface:
```TS
export interface Track {
    encoded: string;
    info: TrackInfo;
};

export interface TrackInfo {
    identifier: string;
    isSeekable: boolean;
    author: string;
    duration: number;
    isStream: boolean;
    position: number;
    title: string;
    uri?: string;
    sourceName?: string;
    artworkUrl?: string;
    isrc?: string;
};
```
<br/>
So, now information will be available by calling:

```TS
shoukaku.players.get("id").track.info
```

### Session Restore:
> You should listen to the "raw" event from Shoukaku and redirect it to your functions, as regular "player.on" will stop working after a restart and will need to be reassigned manually.

```TS
shoukaku.on("raw", (name: string, json: any) => {
    // Forward to your functions like that
    this.listeners[(json.op.type || json.op) as keyof PlayerListeners]?.(name, json)
});
```
> "this.listeners" —  the "PlayerListeners" assigned through the constructor. An example class is provided below.

```TS
import { PlayerUpdate } from "@twokei/shoukaku";

export class PlayerListeners {
    playerUpdate(name: string, data: PlayerUpdate) {
        // Updating data for the received guild
        this.database.updateData("queue", { guild: data.guildId }, 
            { session: this.shoukaku.playersDump.get(data.guildId) }
        );
    };
};
```
> Upon restart, we retrieve the data from the model and give it to Shoukaku.

```TS
// queue.session is a PlayerDump that we previously saved using this.shoukaku.playersDump.get(data.guildId).
const previousSessions = await kil.select().from(sessions);

// It doesn't matter how you store the session, but you need to convert them to [String, PlayerDump], where String = guildId
const playerDumps = previousSessions.map((session) => [sessions.guildId, session.state]);

this.shoukaku = new Shoukaku(..., playerDumps);
```
<br/>

[⚡Twokei Music Bot](https://twokei.com)
