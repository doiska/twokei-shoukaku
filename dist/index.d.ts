import Websocket from 'ws';
import { EventEmitter } from 'events';

declare enum State {
    CONNECTING = "CONNECTING",
    NEARLY = "NEARLY",
    CONNECTED = "CONNECTED",
    RECONNECTING = "RECONNECTING",
    DISCONNECTING = "DISCONNECTING",
    DISCONNECTED = "DISCONNECTED"
}
declare enum VoiceState {
    SESSION_READY = 0,
    SESSION_ID_MISSING = 1,
    SESSION_ENDPOINT_MISSING = 2,
    SESSION_FAILED_UPDATE = 3
}
declare enum OpCodes {
    PLAYER_UPDATE = "playerUpdate",
    PLAYER_RESTORE = "playerRestore",
    STATS = "stats",
    EVENT = "event",
    READY = "ready"
}
declare enum Versions {
    REST_VERSION = 4,
    WEBSOCKET_VERSION = 4
}
declare const ShoukakuDefaults: ShoukakuOptions;
declare const NodeDefaults: NodeOption;

declare const Constants_NodeDefaults: typeof NodeDefaults;
type Constants_OpCodes = OpCodes;
declare const Constants_OpCodes: typeof OpCodes;
declare const Constants_ShoukakuDefaults: typeof ShoukakuDefaults;
type Constants_State = State;
declare const Constants_State: typeof State;
type Constants_Versions = Versions;
declare const Constants_Versions: typeof Versions;
type Constants_VoiceState = VoiceState;
declare const Constants_VoiceState: typeof VoiceState;
declare namespace Constants {
  export {
    Constants_NodeDefaults as NodeDefaults,
    Constants_OpCodes as OpCodes,
    Constants_ShoukakuDefaults as ShoukakuDefaults,
    Constants_State as State,
    Constants_Versions as Versions,
    Constants_VoiceState as VoiceState,
  };
}

/**
 * Represents the partial payload from a stateUpdate event
 */
interface StateUpdatePartial {
    channel_id?: string;
    session_id?: string;
    self_deaf: boolean;
    self_mute: boolean;
}
/**
 * Represents the payload from a serverUpdate event
 */
interface ServerUpdate {
    token: string;
    guild_id: string;
    endpoint: string;
}
/**
 * Represents a connection to a Discord voice channel
 */
declare class Connection extends EventEmitter {
    /**
     * The manager where this connection is on
     */
    manager: Shoukaku;
    /**
     * ID of Guild that contains the connected voice channel
     */
    guildId: string;
    /**
     * ID of the connected voice channel
     */
    channelId: string | null;
    /**
     * ID of the Shard that contains the guild that contains the connected voice channel
     */
    shardId: number;
    /**
     * Mute status in connected voice channel
     */
    muted: boolean;
    /**
     * Deafen status in connected voice channel
     */
    deafened: boolean;
    /**
     * ID of current session
     */
    sessionId: string | null;
    /**
     * Region of connected voice channel
     */
    region: string | null;
    /**
     * Connection state
     */
    state: State;
    /**
     * Boolean that indicates if voice channel changed since initial connection
     */
    moved: boolean;
    /**
     * Boolean that indicates if this instance is reconnecting
     */
    reconnecting: boolean;
    /**
     * If this connection has been established once
     */
    established: boolean;
    /**
     * Cached serverUpdate event from Lavalink
     */
    serverUpdate: ServerUpdate | null;
    /**
     * Get node function to get new nodes
     */
    getNode: (node: Map<string, Node>, connection: Connection) => Node | undefined;
    /**
     * @param manager The manager of this connection
     * @param options The options to pass in connection creation
     * @param options.guildId GuildId in which voice channel to connect to is located
     * @param options.shardId ShardId in which the guild exists
     * @param options.channelId ChannelId of voice channel to connect to
     * @param options.deaf Optional boolean value to specify whether to deafen the current bot user
     * @param options.mute Optional boolean value to specify whether to mute the current bot user
     * @param options.getNode Optional move function for moving players around
     */
    constructor(manager: Shoukaku, options: VoiceChannelOptions);
    /**
     * Set the deafen status for the current bot user
     * @param deaf Boolean value to indicate whether to deafen or undeafen
     * @defaultValue false
     */
    setDeaf(deaf?: boolean): void;
    /**
     * Set the mute status for the current bot user
     * @param mute Boolean value to indicate whether to mute or unmute
     * @defaultValue false
     */
    setMute(mute?: boolean): void;
    /**
     * Disconnect the current bot user from the connected voice channel
     * @internal
     */
    disconnect(): void;
    /**
     * Connect the current bot user to a voice channel
     * @internal
     */
    connect(): Promise<void>;
    /**
     * Update Session ID, Channel ID, Deafen status and Mute status of this instance
     *
     * @param options.session_id ID of this session
     * @param options.channel_id ID of currently connected voice channel
     * @param options.self_deaf Boolean that indicates if the current bot user is deafened or not
     * @param options.self_mute Boolean that indicates if the current bot user is muted or not
     * @internal
     */
    setStateUpdate(options: StateUpdatePartial): void;
    /**
     * Sets the server update data for this connection
     * @internal
     */
    setServerUpdate(data: ServerUpdate): void;
    /**
     * Send voice data to discord
     * @internal
     */
    private sendVoiceUpdate;
    /**
     * Send data to Discord
     * @param data The data to send
     * @internal
     */
    private send;
    /**
     * Emits a debug log
     * @internal
     */
    private debug;
}

type TrackEndReason = 'finished' | 'loadFailed' | 'stopped' | 'replaced' | 'cleanup';
type PlayerEventType = 'TrackStartEvent' | 'TrackEndEvent' | 'TrackExceptionEvent' | 'TrackStuckEvent' | 'WebSocketClosedEvent';
/**
 * Options when playing a new track
 */
interface PlayOptions {
    track: string;
    options?: {
        noReplace?: boolean;
        pause?: boolean;
        startTime?: number;
        endTime?: number;
        volume?: number;
    };
    info: TrackInfo;
}
interface ResumeOptions {
    noReplace?: boolean;
    pause?: boolean;
    startTime?: number;
    endTime?: number;
}
interface Band {
    band: number;
    gain: number;
}
interface KaraokeSettings {
    level?: number;
    monoLevel?: number;
    filterBand?: number;
    filterWidth?: number;
}
interface TimescaleSettings {
    speed?: number;
    pitch?: number;
    rate?: number;
}
interface FreqSettings {
    frequency?: number;
    depth?: number;
}
interface RotationSettings {
    rotationHz?: number;
}
interface DistortionSettings {
    sinOffset?: number;
    sinScale?: number;
    cosOffset?: number;
    cosScale?: number;
    tanOffset?: number;
    tanScale?: number;
    offset?: number;
    scale?: number;
}
interface ChannelMixSettings {
    leftToLeft?: number;
    leftToRight?: number;
    rightToLeft?: number;
    rightToRight?: number;
}
interface LowPassSettings {
    smoothing?: number;
}
interface PlayerEvent {
    op: OpCodes.EVENT;
    type: PlayerEventType;
    guildId: string;
}
interface TrackStartEvent extends PlayerEvent {
    type: 'TrackStartEvent';
    track: Track;
}
interface TrackEndEvent extends PlayerEvent {
    type: 'TrackEndEvent';
    track: Track;
    reason: TrackEndReason;
}
interface TrackExceptionEvent extends PlayerEvent {
    type: 'TrackExceptionEvent';
    exception: Exception;
}
interface TrackStuckEvent extends PlayerEvent {
    type: 'TrackStuckEvent';
    track: Track;
    thresholdMs: number;
}
interface TrackStuckEvent extends PlayerEvent {
    type: 'TrackStuckEvent';
    thresholdMs: number;
}
interface WebSocketClosedEvent extends PlayerEvent {
    type: 'WebSocketClosedEvent';
    code: number;
    byRemote: boolean;
    reason: string;
}
interface PlayerUpdate {
    op: OpCodes.PLAYER_UPDATE;
    state: {
        connected: boolean;
        position?: number;
        time: number;
    };
    guildId: string;
}
interface PlayerRestore {
    op: OpCodes.PLAYER_RESTORE;
    state: {
        restored: boolean;
        node: string;
    };
    guildId: string;
}
interface FilterOptions {
    volume?: number;
    equalizer?: Band[];
    karaoke?: KaraokeSettings | null;
    timescale?: TimescaleSettings | null;
    tremolo?: FreqSettings | null;
    vibrato?: FreqSettings | null;
    rotation?: RotationSettings | null;
    distortion?: DistortionSettings | null;
    channelMix?: ChannelMixSettings | null;
    lowPass?: LowPassSettings | null;
}
declare interface Player {
    /**
     * Emitted when the current playing track ends
     * @eventProperty
     */
    on(event: 'end', listener: (reason: TrackEndEvent) => void): this;
    /**
     * Emitted when the current playing track gets stuck due to an error
     * @eventProperty
     */
    on(event: 'stuck', listener: (data: TrackStuckEvent) => void): this;
    /**
     * Emitted when the current websocket connection is closed
     * @eventProperty
     */
    on(event: 'closed', listener: (reason: WebSocketClosedEvent) => void): this;
    /**
     * Emitted when a new track starts
     * @eventProperty
     */
    on(event: 'start', listener: (data: TrackStartEvent) => void): this;
    /**
     * Emitted when there is an error caused by the current playing track
     * @eventProperty
     */
    on(event: 'exception', listener: (reason: TrackExceptionEvent) => void): this;
    /**
     * Emitted when the library manages to resume the player
     * @eventProperty
     */
    on(event: 'resumed', listener: (player: Player) => void): this;
    /**
     * Emitted when a playerUpdate event is received from Lavalink
     * @eventProperty
     */
    on(event: 'update', listener: (data: PlayerUpdate) => void): this;
    /**
     * Emitted when a playerRestore event received from Shoukaku
     * @eventProperty
     */
    on(event: 'restore', listener: (data: PlayerRestore) => void): this;
    once(event: 'end', listener: (reason: TrackEndEvent) => void): this;
    once(event: 'stuck', listener: (data: TrackStuckEvent) => void): this;
    once(event: 'closed', listener: (reason: WebSocketClosedEvent) => void): this;
    once(event: 'start', listener: (data: TrackStartEvent) => void): this;
    once(event: 'exception', listener: (reason: TrackExceptionEvent) => void): this;
    once(event: 'resumed', listener: (player: Player) => void): this;
    once(event: 'update', listener: (data: PlayerUpdate) => void): this;
    once(event: 'restore', listener: (data: PlayerRestore) => void): this;
    off(event: 'end', listener: (reason: TrackEndEvent) => void): this;
    off(event: 'stuck', listener: (data: TrackStuckEvent) => void): this;
    off(event: 'closed', listener: (reason: WebSocketClosedEvent) => void): this;
    off(event: 'start', listener: (data: TrackStartEvent) => void): this;
    off(event: 'exception', listener: (reason: TrackExceptionEvent) => void): this;
    off(event: 'resumed', listener: (player: Player) => void): this;
    off(event: 'update', listener: (data: PlayerUpdate) => void): this;
    off(event: 'restore', listener: (data: PlayerRestore) => void): this;
}
/**
 * Wrapper object around Lavalink
 */
declare class Player extends EventEmitter {
    /**
     * GuildId of this player
     */
    readonly guildId: string;
    /**
     * Connection class that this player is bound on
     */
    readonly connection: Connection;
    /**
     * Lavalink node this player is connected to
     */
    node: Node;
    /**
     * ID of current track
     */
    track: string | null;
    /**
     * Player info from Lavalink
     */
    info: any | null;
    /**
     * Global volume of the player
     */
    volume: number;
    /**
     * Pause status in current player
     */
    paused: boolean;
    /**
     * Ping represents the number of milliseconds between heartbeat and ack. Could be `-1` if not connected
     */
    ping: number;
    /**
     * Position in ms of current track
     */
    position: number;
    /**
     * Filters on current track
     */
    filters: FilterOptions;
    /**
     * @param node An instance of Node (Lavalink API wrapper)
     * @param connection An instance of connection class
     */
    constructor(node: Node, connection: Connection);
    get playerData(): UpdatePlayerInfo;
    /**
     * Move player to another node. Auto disconnects when the node specified is not found
     * @param name
     */
    move(name?: string): Promise<void>;
    /**
     * Destroys the player in remote lavalink side
     */
    destroyPlayer(clean?: boolean): Promise<void>;
    /**
     * Play a new track
     * @param playable Options for playing this track
     */
    playTrack(playable: PlayOptions): Promise<void>;
    /**
     * Stop the currently playing track
     */
    stopTrack(): Promise<void>;
    /**
     * Pause or unpause the currently playing track
     * @param paused Boolean value to specify whether to pause or unpause the current bot user
     */
    setPaused(paused?: boolean): Promise<void>;
    /**
     * Seek to a specific time in the currently playing track
     * @param position Position to seek to in milliseconds
     */
    seekTo(position: number): Promise<void>;
    /**
     * Sets the global volume of the player
     * @param volume Target volume 0-1000
     */
    setGlobalVolume(volume: number): Promise<void>;
    /**
     * Sets the filter volume of the player
     * @param volume Target volume 0.0-5.0
     */
    setFilterVolume(volume: number): Promise<void>;
    /**
     * Change the equalizer settings applied to the currently playing track
     * @param equalizer An array of objects that conforms to the Bands type that define volumes at different frequencies
     */
    setEqualizer(equalizer: Band[]): Promise<void>;
    /**
     * Change the karaoke settings applied to the currently playing track
     * @param karaoke An object that conforms to the KaraokeSettings type that defines a range of frequencies to mute
     */
    setKaraoke(karaoke?: KaraokeSettings): Promise<void>;
    /**
     * Change the timescale settings applied to the currently playing track
     * @param timescale An object that conforms to the TimescaleSettings type that defines the time signature to play the audio at
     */
    setTimescale(timescale?: TimescaleSettings): Promise<void>;
    /**
     * Change the tremolo settings applied to the currently playing track
     * @param tremolo An object that conforms to the FreqSettings type that defines an oscillation in volume
     */
    setTremolo(tremolo?: FreqSettings): Promise<void>;
    /**
     * Change the vibrato settings applied to the currently playing track
     * @param vibrato An object that conforms to the FreqSettings type that defines an oscillation in pitch
     */
    setVibrato(vibrato?: FreqSettings): Promise<void>;
    /**
     * Change the rotation settings applied to the currently playing track
     * @param rotation An object that conforms to the RotationSettings type that defines the frequency of audio rotating round the listener
     */
    setRotation(rotation?: RotationSettings): Promise<void>;
    /**
     * Change the distortion settings applied to the currently playing track
     * @param distortion An object that conforms to DistortionSettings that defines distortions in the audio
     * @returns The current player instance
     */
    setDistortion(distortion: DistortionSettings): Promise<void>;
    /**
     * Change the channel mix settings applied to the currently playing track
     * @param channelMix An object that conforms to ChannelMixSettings that defines how much the left and right channels affect each other (setting all factors to 0.5 causes both channels to get the same audio)
     */
    setChannelMix(channelMix: ChannelMixSettings): Promise<void>;
    /**
     * Change the low pass settings applied to the currently playing track
     * @param lowPass An object that conforms to LowPassSettings that defines the amount of suppression on higher frequencies
     */
    setLowPass(lowPass: LowPassSettings): Promise<void>;
    /**
     * Change the all filter settings applied to the currently playing track
     * @param filters An object that conforms to FilterOptions that defines all filters to apply/modify
     */
    setFilters(filters: FilterOptions): Promise<void>;
    /**
     * Clear all filters applied to the currently playing track
     */
    clearFilters(): Promise<void>;
    /**
     * Resumes the current track
     * @param options An object that conforms to ResumeOptions that specify behavior on resuming
     */
    resume(options?: ResumeOptions): Promise<void>;
    /**
     * If you want to update the whole player yourself, sends raw update player info to lavalink
     */
    update(updatePlayer: UpdatePlayerInfo): Promise<void>;
    /**
     * Remove all event listeners on this instance
     * @internal
     */
    clean(): void;
    /**
     * Reset the track, position and filters on this instance to defaults
     * @internal
     */
    reset(): void;
    /**
     * Sends server update to lavalink
     * @internal
     */
    sendServerUpdate(): Promise<void>;
    /**
     * Handle player update data
     */
    onPlayerUpdate(json: {
        state: {
            position: number;
            ping: number;
        };
    }): void;
    /**
     * Handle player events received from Lavalink
     * @param json JSON data from Lavalink
     * @internal
     */
    onPlayerEvent(json: {
        type: string;
        track: Track;
    }): void;
}

type Severity = 'common' | 'suspicious' | 'fault';
declare enum LoadType {
    TRACK = "track",
    PLAYLIST = "playlist",
    SEARCH = "search",
    EMPTY = "empty",
    ERROR = "error"
}
interface Track {
    encoded: string;
    info: TrackInfo;
    pluginInfo: unknown;
}
interface TrackInfo {
    identifier: string;
    isSeekable: boolean;
    author: string;
    length: number;
    isStream: boolean;
    position: number;
    title: string;
    uri?: string;
    sourceName?: string;
    artworkUrl?: string;
    isTrackUnavailable?: string;
    isrc?: string;
}
interface Playlist {
    encoded: string;
    info: {
        name: string;
        selectedTrack: number;
    };
    pluginInfo: unknown;
    tracks: Track[];
}
interface Exception {
    message: string;
    severity: Severity;
    cause: string;
}
interface TrackResult {
    loadType: LoadType.TRACK;
    data: Track;
}
interface PlaylistResult {
    loadType: LoadType.PLAYLIST;
    data: Playlist;
}
interface SearchResult {
    loadType: LoadType.SEARCH;
    data: Track[];
}
interface EmptyResult {
    loadType: LoadType.EMPTY;
    data: {};
}
interface ErrorResult {
    loadType: LoadType.ERROR;
    data: Exception;
}
type LavalinkResponse = TrackResult | PlaylistResult | SearchResult | EmptyResult | ErrorResult;
interface Address {
    address: string;
    failingTimestamp: number;
    failingTime: string;
}
interface RoutePlanner {
    class: null | 'RotatingIpRoutePlanner' | 'NanoIpRoutePlanner' | 'RotatingNanoIpRoutePlanner' | 'BalancingIpRoutePlanner';
    details: null | {
        ipBlock: {
            type: string;
            size: string;
        };
        failingAddresses: Address[];
        rotateIndex: string;
        ipIndex: string;
        currentAddress: string;
        blockIndex: string;
        currentAddressIndex: string;
    };
}
interface LavalinkPlayerVoice {
    token: string;
    endpoint: string;
    sessionId: string;
    connected?: boolean;
    ping?: number;
}
interface LavalinkPlayerVoiceOptions extends Omit<LavalinkPlayerVoice, 'connected' | 'ping'> {
}
interface LavalinkPlayer {
    guildId: string;
    track?: Track;
    volume: number;
    paused: boolean;
    voice: LavalinkPlayerVoice;
    filters: FilterOptions;
}
interface UpdatePlayerOptions {
    encodedTrack?: string | null;
    identifier?: string;
    position?: number;
    endTime?: number;
    volume?: number;
    info?: TrackInfo | null;
    paused?: boolean;
    filters?: FilterOptions;
    voice?: LavalinkPlayerVoiceOptions;
}
interface UpdatePlayerInfo {
    guildId: string;
    playerOptions: UpdatePlayerOptions;
    noReplace?: boolean;
}
interface SessionInfo {
    resumingKey?: string;
    timeout: number;
}
interface FetchOptions {
    endpoint: string;
    options: {
        headers?: Record<string, string>;
        params?: Record<string, string>;
        method?: string;
        body?: Record<string, unknown>;
        [key: string]: unknown;
    };
}
/**
 * Wrapper around Lavalink REST API
 */
declare class Rest {
    /**
     * Node that initialized this instance
     */
    protected readonly node: Node;
    /**
     * URL of Lavalink
     */
    protected readonly url: string;
    /**
     * Credentials to access Lavalink
     */
    protected readonly auth: string;
    /**
     * Rest version to use
     */
    protected readonly version: string;
    /**
     * @param node An instance of Node
     * @param options The options to initialize this rest class
     * @param options.name Name of this node
     * @param options.url URL of Lavalink
     * @param options.auth Credentials to access Lavalnk
     * @param options.secure Weather to use secure protocols or not
     * @param options.group Group of this node
     */
    constructor(node: Node, options: NodeOption);
    protected get sessionId(): string;
    /**
     * Resolve a track
     * @param identifier Track ID
     * @returns A promise that resolves to a Lavalink response
     */
    resolve(identifier: string): Promise<LavalinkResponse | undefined>;
    /**
     * Decode a track
     * @param track Encoded track
     * @returns Promise that resolves to a track
     */
    decode(track: string): Promise<Track | undefined>;
    /**
     * Gets all the player with the specified sessionId
     * @returns Promise that resolves to an array of Lavalink players
     */
    getPlayers(): Promise<LavalinkPlayer[]>;
    /**
     * Gets all the player with the specified sessionId
     * @returns Promise that resolves to an array of Lavalink players
     */
    getPlayer(guildId: string): Promise<LavalinkPlayer | undefined>;
    /**
     * Updates a Lavalink player
     * @param data SessionId from Discord
     * @returns Promise that resolves to a Lavalink player
     */
    updatePlayer(data: UpdatePlayerInfo): Promise<LavalinkPlayer | undefined>;
    /**
     * Deletes a Lavalink player
     * @param guildId guildId where this player is
     */
    destroyPlayer(guildId: string): Promise<void>;
    /**
     * Updates the session with a resume boolean and timeout
     * @param resuming Whether resuming is enabled for this session or not
     * @param timeout Timeout to wait for resuming
     * @returns Promise that resolves to a Lavalink player
     */
    updateSession(resuming?: boolean, timeout?: number): Promise<SessionInfo | undefined>;
    /**
     * Gets the status of this node
     * @returns Promise that resolves to a node stats response
     */
    stats(): Promise<NodeStats | undefined>;
    /**
     * Get routeplanner status from Lavalink
     * @returns Promise that resolves to a routeplanner response
     */
    getRoutePlannerStatus(): Promise<RoutePlanner | undefined>;
    /**
     * Release blacklisted IP address into pool of IPs
     * @param address IP address
     */
    unmarkFailedAddress(address: string): Promise<void>;
    /**
     * Get Lavalink info
     */
    getLavalinkInfo(): Promise<NodeInfo | undefined>;
    /**
     * Make a request to Lavalink
     * @param fetchOptions.endpoint Lavalink endpoint
     * @param fetchOptions.options Options passed to fetch
     * @internal
     */
    protected fetch<T = unknown>(fetchOptions: FetchOptions): Promise<T | undefined>;
}

interface NodeStats {
    players: number;
    playingPlayers: number;
    memory: {
        reservable: number;
        used: number;
        free: number;
        allocated: number;
    };
    frameStats: {
        sent: number;
        deficit: number;
        nulled: number;
    };
    cpu: {
        cores: number;
        systemLoad: number;
        lavalinkLoad: number;
    };
    uptime: number;
}
type NodeInfoVersion = {
    semver: string;
    major: number;
    minor: number;
    patch: number;
    preRelease?: string;
    build?: string;
};
type NodeInfoGit = {
    branch: string;
    commit: string;
    commitTime: number;
};
type NodeInfoPlugin = {
    name: string;
    version: string;
};
type NodeInfo = {
    version: NodeInfoVersion;
    buildTime: number;
    git: NodeInfoGit;
    jvm: string;
    lavaplayer: string;
    sourceManagers: string[];
    filters: string[];
    plugins: NodeInfoPlugin[];
};
interface ResumableHeaders {
    [key: string]: string;
    'Client-Name': string;
    'User-Agent': string;
    'Authorization': string;
    'User-Id': string;
    'Session-Id': string;
}
interface NonResumableHeaders extends Omit<ResumableHeaders, 'Session-Id'> {
}
/**
 * Represents a Lavalink node
 */
declare class Node extends EventEmitter {
    /**
     * Shoukaku class
     */
    readonly manager: Shoukaku;
    /**
     * A map of guild ID to players
     */
    readonly players: Map<string, Player>;
    /**
     * Lavalink rest API
     */
    readonly rest: Rest;
    /**
     * Name of this node
     */
    readonly name: string;
    /**
     * Group in which this node is contained
     */
    readonly group?: string;
    /**
     * Websocket version this node will use
     */
    readonly version: string;
    /**
     * URL of Lavalink
     */
    private readonly url;
    /**
     * Credentials to access Lavalink
     */
    private readonly auth;
    /**
     * The number of reconnects to Lavalink
     */
    reconnects: number;
    /**
     * The state of this connection
     */
    state: State;
    /**
     * Statistics from Lavalink
     */
    stats: NodeStats | null;
    /**
     * Information about lavalink node
    */
    info: NodeInfo | null;
    /**
     * Websocket instance
     */
    ws: Websocket | null;
    /**
     * SessionId of this Lavalink connection (not to be confused with Discord SessionId)
     */
    sessionId: string | undefined;
    /**
     * Boolean that represents if the node has initialized once
     */
    protected initialized: boolean;
    /**
     * Boolean that represents if this connection is destroyed
     */
    protected destroyed: boolean;
    /**
     * @param manager Shoukaku instance
     * @param options Options on creating this node
     * @param options.name Name of this node
     * @param options.url URL of Lavalink
     * @param options.auth Credentials to access Lavalnk
     * @param options.secure Whether to use secure protocols or not
     * @param options.group Group of this node
     */
    constructor(manager: Shoukaku, options: NodeOption);
    /**
     * Penalties for load balancing
     * @returns Penalty score
     * @internal @readonly
     */
    get penalties(): number;
    /**
     * If we should clean this node
     * @internal @readonly
     */
    private get shouldClean();
    /**
     * Connect to Lavalink
     */
    connect(): void;
    /**
     * Disconnect from lavalink
     * @param code Status code
     * @param reason Reason for disconnect
     */
    disconnect(code: number, reason?: string): void;
    /**
     * Handle connection open event from Lavalink
     * @param response Response from Lavalink
     * @internal
     */
    private open;
    /**
     * Handle message from Lavalink
     * @param message JSON message
     * @internal
     */
    private message;
    /**
     * Handle closed event from lavalink
     * @param code Status close
     * @param reason Reason for connection close
     */
    private close;
    /**
     * To emit error events easily
     * @param error error message
     */
    error(error: Error | unknown): void;
    /**
     * Destroys the websocket connection
     * @internal
     */
    private destroy;
    /**
     * Cleans and moves players to other nodes if possible
     * @internal
     */
    private clean;
    /**
     * Reconnect to Lavalink
     * @internal
     */
    private reconnect;
    /**
     * Tries to move the players to another node
     * @internal
     */
    private movePlayers;
}

type Constructor<T> = new (...args: any[]) => T;
/**
 * Merge the default options to user input
 * @param def Default options
 * @param given User input
 * @returns Merged options
 */
declare function mergeDefault<T extends {
    [key: string]: any;
}>(def: T, given: T): Required<T>;
/**
 * Wait for a specific amount of time (timeout)
 * @param ms Time to wait in milliseconds
 * @returns A promise that resolves in x seconds
 */
declare function wait(ms: number): Promise<void>;

type Utils_Constructor<T> = Constructor<T>;
declare const Utils_mergeDefault: typeof mergeDefault;
declare const Utils_wait: typeof wait;
declare namespace Utils {
  export {
    Utils_Constructor as Constructor,
    Utils_mergeDefault as mergeDefault,
    Utils_wait as wait,
  };
}

interface Structures {
    /**
     * A custom structure that extends the Rest class
     */
    rest?: Constructor<Rest>;
    /**
     * A custom structure that extends the Player class
     */
    player?: Constructor<Player>;
}
interface NodeOption {
    /**
     * Name of this node
     */
    name: string;
    /**
     * URL of Lavalink
     */
    url: string;
    /**
     * Credentials to access Lavalink
     */
    auth: string;
    /**
     * Whether to use secure protocols or not
     */
    secure?: boolean;
    /**
     * Group of this node
     */
    group?: string;
}
interface ShoukakuOptions {
    /**
     * Whether to resume a connection on disconnect to Lavalink (Server Side) (Note: DOES NOT RESUME WHEN THE LAVALINK SERVER DIES)
     */
    resume?: boolean;
    /**
     * Time to wait before lavalink starts to destroy the players of the disconnected client
     */
    resumeTimeout?: number;
    /**
     * Number of times to try and reconnect to Lavalink before giving up
     */
    reconnectTries?: number;
    /**
     * Timeout before trying to reconnect
     */
    reconnectInterval?: number;
    /**
     * Time to wait for a response from the Lavalink REST API before giving up
     */
    restTimeout?: number;
    /**
     * Whether to move players to a different Lavalink node when a node disconnects
     */
    moveOnDisconnect?: boolean;
    /**
     * User Agent to use when making requests to Lavalink
     */
    userAgent?: string;
    /**
     * Custom structures for shoukaku to use
     */
    structures?: Structures;
    /**
     * Timeout before abort connection
     */
    voiceConnectionTimeout?: number;
}
interface VoiceChannelOptions {
    guildId: string;
    shardId: number;
    channelId: string;
    deaf?: boolean;
    mute?: boolean;
    getNode?: (node: Map<string, Node>, connection: Connection) => Node | undefined;
}
interface MergedShoukakuOptions {
    resume: boolean;
    resumeTimeout: number;
    reconnectTries: number;
    reconnectInterval: number;
    restTimeout: number;
    moveOnDisconnect: boolean;
    userAgent: string;
    structures: Structures;
    voiceConnectionTimeout: number;
}
interface PlayerDump {
    node: {
        name: string;
        group?: string;
        sessionId: string;
    };
    options: {
        guildId: string;
        shardId: number;
        channelId: string;
        deaf?: boolean;
        mute?: boolean;
    };
    player: UpdatePlayerOptions;
    state?: {
        restored: boolean;
        node: string;
    };
    timestamp: number;
}
declare interface Shoukaku {
    /**
     * Emitted when reconnect tries are occurring and how many tries are left
     * @eventProperty
     */
    on(event: 'reconnecting', listener: (name: string, reconnectsLeft: number, reconnectInterval: number) => void): this;
    /**
     * Emitted when data useful for debugging is produced
     * @eventProperty
     */
    on(event: 'debug', listener: (name: string, info: string) => void): this;
    /**
     * Emitted when an error occurs
     * @eventProperty
     */
    on(event: 'error', listener: (name: string, error: Error) => void): this;
    /**
     * Emitted when Shoukaku is ready to receive operations
     * @eventProperty
     */
    on(event: 'ready', listener: (name: string, reconnected: number) => void): this;
    /**
     * Emitted when a websocket connection to Lavalink closes
     * @eventProperty
     */
    on(event: 'close', listener: (name: string, code: number, reason: string) => void): this;
    /**
     * Emitted when a websocket connection to Lavalink disconnects
     * @eventProperty
     */
    on(event: 'disconnect', listener: (name: string, moved: boolean, count: number) => void): this;
    /**
     * Emitted when a raw message is received from Lavalink
     * @eventProperty
     */
    on(event: 'raw', listener: (name: string, json: unknown) => void): this;
    /**
     * Emitted after all players have been restored
     * @eventProperty
     */
    on(event: 'restored', listener: (dump: PlayerDump[]) => void): this;
    once(event: 'restored', listener: (dump: PlayerDump[]) => void): this;
    once(event: 'reconnecting', listener: (name: string, reconnectsLeft: number, reconnectInterval: number) => void): this;
    once(event: 'debug', listener: (name: string, info: string) => void): this;
    once(event: 'error', listener: (name: string, error: Error) => void): this;
    once(event: 'ready', listener: (name: string, reconnected: number) => void): this;
    once(event: 'close', listener: (name: string, code: number, reason: string) => void): this;
    once(event: 'disconnect', listener: (name: string, moved: boolean, count: number) => void): this;
    once(event: 'raw', listener: (name: string, json: unknown) => void): this;
    off(event: 'restored', listener: (dump: PlayerDump[]) => void): this;
    off(event: 'reconnecting', listener: (name: string, reconnectsLeft: number, reconnectInterval: number) => void): this;
    off(event: 'debug', listener: (name: string, info: string) => void): this;
    off(event: 'error', listener: (name: string, error: Error) => void): this;
    off(event: 'ready', listener: (name: string, reconnected: number) => void): this;
    off(event: 'close', listener: (name: string, code: number, reason: string) => void): this;
    off(event: 'disconnect', listener: (name: string, moved: boolean, count: number) => void): this;
    off(event: 'raw', listener: (name: string, json: unknown) => void): this;
}
/**
 * Main Shoukaku class
 */
declare class Shoukaku extends EventEmitter {
    /**
     * Discord library connector
     */
    readonly connector: Connector;
    /**
     * Shoukaku options
     */
    readonly options: MergedShoukakuOptions;
    /**
     * Connected Lavalink nodes
     */
    readonly nodes: Map<string, Node>;
    /**
     * Voice connections being handled
     */
    readonly connections: Map<string, Connection>;
    /**
     * Player dumps from previous session, waiting for reconnect
     */
    reconnectingPlayers: Map<String, PlayerDump>;
    /**
     * Array of nodes waiting for connection
     */
    connectingNodes: NodeOption[];
    /**
     * Shoukaku instance identifier
     */
    id: string | null;
    /**
     * @param connector A Discord library connector
     * @param nodes An array that conforms to the NodeOption type that specifies nodes to connect to
     * @param options Options to pass to create this Shoukaku instance
     * @param dumps
     * @param options.resume Whether to resume a connection on disconnect to Lavalink (Server Side) (Note: DOES NOT RESUME WHEN THE LAVALINK SERVER DIES)
     * @param options.resumeTimeout Time to wait before lavalink starts to destroy the players of the disconnected client
     * @param options.reconnectTries Number of times to try and reconnect to Lavalink before giving up
     * @param options.reconnectInterval Timeout before trying to reconnect
     * @param options.restTimeout Time to wait for a response from the Lavalink REST API before giving up
     * @param options.moveOnDisconnect Whether to move players to a different Lavalink node when a node disconnects
     * @param options.userAgent User Agent to use when making requests to Lavalink
     * @param options.structures Custom structures for shoukaku to use
     */
    constructor(connector: Connector, nodes: NodeOption[], options?: ShoukakuOptions, dumps?: [String, PlayerDump][]);
    /**
     * Get a list of players
     * @returns A map of guild IDs and players
     * @readonly
     */
    get players(): Map<string, Player>;
    /**
     * Get dumped players data that you will need in case of a restart
     * @returns A map of guild IDs and PlayerDump
     * @readonly
     */
    get playersDump(): Map<string, PlayerDump>;
    /**
     * Restore players from previous session
     * @throws {Error} Will throw catched error if something went wrong
     * @param node
     */
    restorePlayers(node: Node): Promise<void>;
    /**
     * Add a Lavalink node to the pool of available nodes
     * @param options.name Name of this node
     * @param options.url URL of Lavalink
     * @param options.auth Credentials to access Lavalnk
     * @param options.secure Whether to use secure protocols or not
     * @param options.group Group of this node
     */
    addNode(options: NodeOption): void;
    /**
     * Remove a Lavalink node from the pool of available nodes
     * @param name Name of the node
     * @param reason Reason of removing the node
     */
    removeNode(name: string, reason?: string): void;
    /**
     * Joins a voice channel
     * @param options.guildId GuildId in which the ChannelId of the voice channel is located
     * @param options.shardId ShardId to track where this should send on sharded websockets, put 0 if you are unsharded
     * @param options.channelId ChannelId of the voice channel you want to connect to
     * @param options.deaf Optional boolean value to specify whether to deafen or undeafen the current bot user
     * @param options.mute Optional boolean value to specify whether to mute or unmute the current bot user
     * @param options.getNode Optional getter function if you have custom node resolving
     * @returns The created player
     * @internal
     */
    joinVoiceChannel(options: VoiceChannelOptions): Promise<Player>;
    /**
     * Leaves a voice channel
     * @param guildId The id of the guild you want to delete
     * @returns The destroyed / disconnected player or undefined if none
     * @internal
     */
    leaveVoiceChannel(guildId: string): Promise<Player | undefined>;
    /**
     * Gets the Lavalink node the least penalty score
     * @returns A Lavalink node or undefined if there are no nodes ready
     */
    getIdealNode(): Node | undefined;
    /**
     * Cleans the disconnected lavalink node
     * @param node The node to clean
     * @param args Additional arguments for Shoukaku to emit
     * @returns A Lavalink node or undefined
     * @internal
     */
    private clean;
}

interface ConnectorMethods {
    sendPacket: any;
    getId: any;
}
declare const AllowedPackets: string[];
declare abstract class Connector {
    protected readonly client: any;
    protected manager: Shoukaku | null;
    constructor(client: any);
    set(manager: Shoukaku): Connector;
    protected ready(nodes: NodeOption[]): void;
    protected raw(packet: any): void;
    abstract getId(): string;
    abstract sendPacket(shardId: number, payload: any, important: boolean): void;
    abstract listen(nodes: NodeOption[]): void;
}

declare class Eris extends Connector {
    sendPacket(shardId: number, payload: any, important: boolean): void;
    getId(): string;
    listen(nodes: NodeOption[]): void;
}

declare class DiscordJS extends Connector {
    sendPacket(shardId: number, payload: any, important: boolean): void;
    getId(): string;
    listen(nodes: NodeOption[]): void;
}

declare class OceanicJS extends Connector {
    sendPacket(shardId: number, payload: any, important: boolean): void;
    getId(): string;
    listen(nodes: NodeOption[]): void;
}

type index_DiscordJS = DiscordJS;
declare const index_DiscordJS: typeof DiscordJS;
type index_Eris = Eris;
declare const index_Eris: typeof Eris;
type index_OceanicJS = OceanicJS;
declare const index_OceanicJS: typeof OceanicJS;
declare namespace index {
  export {
    index_DiscordJS as DiscordJS,
    index_Eris as Eris,
    index_OceanicJS as OceanicJS,
  };
}

export { Address, AllowedPackets, Band, ChannelMixSettings, Connection, Connector, ConnectorMethods, index as Connectors, Constants, DistortionSettings, EmptyResult, ErrorResult, Exception, FilterOptions, FreqSettings, KaraokeSettings, LavalinkPlayer, LavalinkPlayerVoice, LavalinkPlayerVoiceOptions, LavalinkResponse, LoadType, LowPassSettings, MergedShoukakuOptions, Node, NodeInfo, NodeOption, NodeStats, NonResumableHeaders, PlayOptions, Player, PlayerDump, PlayerEvent, PlayerEventType, PlayerRestore, PlayerUpdate, Playlist, PlaylistResult, Rest, ResumableHeaders, ResumeOptions, RotationSettings, RoutePlanner, SearchResult, ServerUpdate, SessionInfo, Severity, Shoukaku, ShoukakuOptions, StateUpdatePartial, Structures, TimescaleSettings, Track, TrackEndEvent, TrackEndReason, TrackExceptionEvent, TrackInfo, TrackResult, TrackStartEvent, TrackStuckEvent, UpdatePlayerInfo, UpdatePlayerOptions, Utils, VoiceChannelOptions, WebSocketClosedEvent };
