var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/connectors/libs/index.ts
var libs_exports = {};
__export(libs_exports, {
  DiscordJS: () => DiscordJS,
  Eris: () => Eris,
  OceanicJS: () => OceanicJS
});

// src/Utils.ts
var Utils_exports = {};
__export(Utils_exports, {
  mergeDefault: () => mergeDefault,
  wait: () => wait
});
function mergeDefault(def, given) {
  if (!given)
    return def;
  const defaultKeys = Object.keys(def);
  for (const key in given) {
    if (defaultKeys.includes(key))
      continue;
    delete given[key];
  }
  for (const key of defaultKeys) {
    if (def[key] === null || typeof def[key] === "string" && def[key].length === 0) {
      if (!given[key])
        throw new Error(`${String(key)} was not found from the given options.`);
    }
    if (given[key] === null || given[key] === void 0)
      given[key] = def[key];
  }
  return given;
}
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// src/Constants.ts
var Constants_exports = {};
__export(Constants_exports, {
  NodeDefaults: () => NodeDefaults,
  OpCodes: () => OpCodes,
  ShoukakuDefaults: () => ShoukakuDefaults,
  State: () => State,
  Versions: () => Versions,
  VoiceState: () => VoiceState
});

// package.json
var package_default = {
  name: "@twokei/shoukaku",
  version: "1.0.4",
  description: "Forked Shoukaku module with session dump & recovery",
  main: "dist/index.js",
  module: "dist/index.mjs",
  types: "dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.mjs",
      require: "./dist/index.js"
    }
  },
  scripts: {
    build: "npm run build:ts && npm run build:docs",
    "build:ts": "tsup --config tsup-config.json",
    "build:docs": "typedoc --theme default --readme README.md --out docs/ --entryPointStrategy expand src/.",
    lint: "eslint --fix --ext .ts",
    prepare: "npm run build:ts"
  },
  keywords: [
    "bot",
    "music",
    "lavalink",
    "api",
    "discord",
    "lavalink.js",
    "discord.js",
    "lavalink-api"
  ],
  engines: {
    node: ">=18.0.0",
    npm: ">=7.0.0"
  },
  author: "Saya",
  contributors: [
    {
      name: "doiska",
      email: "me@doiska.dev"
    },
    {
      email: "blagochevk@mail.ru",
      name: "Kirill Blagochev"
    }
  ],
  license: "MIT",
  repository: {
    type: "git",
    url: "https://github.com/doiska/twokei-shoukaku"
  },
  dependencies: {
    ws: "^8.13.0"
  },
  devDependencies: {
    "@augu/eslint-config": "^4.0.1",
    "@types/node": "^20.3.1",
    "@types/node-fetch": "^2.6.4",
    "@types/ws": "^8.5.5",
    "@typescript-eslint/eslint-plugin": "^5.59.11",
    "@typescript-eslint/parser": "^5.59.11",
    eslint: "^8.42.0",
    tsup: "^6.7.0",
    typedoc: "^0.24.8",
    typescript: "^5.1.3"
  },
  publishConfig: {
    access: "public"
  }
};

// src/Constants.ts
var State = /* @__PURE__ */ ((State2) => {
  State2["CONNECTING"] = "CONNECTING";
  State2["NEARLY"] = "NEARLY";
  State2["CONNECTED"] = "CONNECTED";
  State2["RECONNECTING"] = "RECONNECTING";
  State2["DISCONNECTING"] = "DISCONNECTING";
  State2["DISCONNECTED"] = "DISCONNECTED";
  return State2;
})(State || {});
var VoiceState = /* @__PURE__ */ ((VoiceState2) => {
  VoiceState2[VoiceState2["SESSION_READY"] = 0] = "SESSION_READY";
  VoiceState2[VoiceState2["SESSION_ID_MISSING"] = 1] = "SESSION_ID_MISSING";
  VoiceState2[VoiceState2["SESSION_ENDPOINT_MISSING"] = 2] = "SESSION_ENDPOINT_MISSING";
  VoiceState2[VoiceState2["SESSION_FAILED_UPDATE"] = 3] = "SESSION_FAILED_UPDATE";
  return VoiceState2;
})(VoiceState || {});
var OpCodes = /* @__PURE__ */ ((OpCodes3) => {
  OpCodes3["PLAYER_UPDATE"] = "playerUpdate";
  OpCodes3["PLAYER_RESTORE"] = "playerRestore";
  OpCodes3["STATS"] = "stats";
  OpCodes3["EVENT"] = "event";
  OpCodes3["READY"] = "ready";
  return OpCodes3;
})(OpCodes || {});
var Versions = /* @__PURE__ */ ((Versions2) => {
  Versions2[Versions2["REST_VERSION"] = 4] = "REST_VERSION";
  Versions2[Versions2["WEBSOCKET_VERSION"] = 4] = "WEBSOCKET_VERSION";
  return Versions2;
})(Versions || {});
var ShoukakuDefaults = {
  resume: false,
  resumeTimeout: 30,
  reconnectTries: 3,
  reconnectInterval: 5,
  restTimeout: 60,
  moveOnDisconnect: false,
  userAgent: `${package_default.name}bot/${package_default.version} (${package_default.repository.url})`,
  structures: {},
  voiceConnectionTimeout: 15
};
var NodeDefaults = {
  name: "Default",
  url: "",
  auth: "",
  secure: false,
  group: void 0
};

// src/connectors/Connector.ts
var AllowedPackets = ["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"];
var Connector = class {
  constructor(client) {
    this.client = client;
    this.manager = null;
  }
  set(manager) {
    this.manager = manager;
    return this;
  }
  ready(nodes) {
    this.manager.id = this.getId();
    for (const node of nodes)
      this.manager.addNode(mergeDefault(NodeDefaults, node));
  }
  raw(packet) {
    if (!AllowedPackets.includes(packet.t))
      return;
    const guildId = packet.d.guild_id;
    const connection = this.manager.connections.get(guildId);
    if (!connection)
      return;
    if (packet.t === "VOICE_SERVER_UPDATE") {
      connection.setServerUpdate(packet.d);
      if (!connection.established)
        return;
      const player = this.manager.players.get(guildId);
      if (!player)
        return;
      player.sendServerUpdate().catch((error) => this.manager.on("error", error));
      return;
    }
    const userId = packet.d.user_id;
    if (userId !== this.manager.id)
      return;
    connection.setStateUpdate(packet.d);
  }
};

// src/connectors/libs/Eris.ts
var Eris = class extends Connector {
  // sendPacket is where your library send packets to Discord Gateway
  sendPacket(shardId, payload, important) {
    return this.client.shards.get(shardId)?.sendWS(payload.op, payload.d, important);
  }
  // getId is a getter where the lib stores the client user (the one logged in as a bot) id
  getId() {
    return this.client.user.id;
  }
  // Listen attaches the event listener to the library you are using
  listen(nodes) {
    this.client.once("ready", () => this.ready(nodes));
    this.client.on("rawWS", (packet) => this.raw(packet));
  }
};

// src/connectors/libs/DiscordJS.ts
var DiscordJS = class extends Connector {
  // sendPacket is where your library send packets to Discord Gateway
  sendPacket(shardId, payload, important) {
    return this.client.ws.shards.get(shardId)?.send(payload, important);
  }
  // getId is a getter where the lib stores the client user (the one logged in as a bot) id
  getId() {
    return this.client.user.id;
  }
  // Listen attaches the event listener to the library you are using
  listen(nodes) {
    this.client.once("ready", () => this.ready(nodes));
    this.client.on("raw", (packet) => this.raw(packet));
  }
};

// src/connectors/libs/OceanicJS.ts
var OceanicJS = class extends Connector {
  // sendPacket is where your library send packets to Discord Gateway
  sendPacket(shardId, payload, important) {
    return this.client.shards.get(shardId)?.send(payload.op, payload.d, important);
  }
  // getId is a getter where the lib stores the client user (the one logged in as a bot) id
  getId() {
    return this.client.user.id;
  }
  // Listen attaches the event listener to the library you are using
  listen(nodes) {
    this.client.once("ready", () => this.ready(nodes));
    this.client.on("packet", (packet) => this.raw(packet));
  }
};

// src/guild/Connection.ts
import { EventEmitter, once } from "events";
var Connection = class extends EventEmitter {
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
  constructor(manager, options) {
    super();
    this.manager = manager;
    this.guildId = options.guildId;
    this.channelId = options.channelId;
    this.shardId = options.shardId;
    this.muted = options.mute ?? false;
    this.deafened = options.deaf ?? false;
    this.sessionId = null;
    this.region = null;
    this.state = "DISCONNECTED" /* DISCONNECTED */;
    this.moved = false;
    this.reconnecting = false;
    this.established = false;
    this.serverUpdate = null;
    this.getNode = options.getNode;
  }
  /**
   * Set the deafen status for the current bot user
   * @param deaf Boolean value to indicate whether to deafen or undeafen
   * @defaultValue false
   */
  setDeaf(deaf = false) {
    this.deafened = deaf;
    this.sendVoiceUpdate();
  }
  /**
   * Set the mute status for the current bot user
   * @param mute Boolean value to indicate whether to mute or unmute
   * @defaultValue false
   */
  setMute(mute = false) {
    this.muted = mute;
    this.sendVoiceUpdate();
  }
  /**
   * Disconnect the current bot user from the connected voice channel
   * @internal
   */
  disconnect() {
    this.channelId = null;
    this.deafened = false;
    this.muted = false;
    this.removeAllListeners();
    this.sendVoiceUpdate();
    this.manager.connections.delete(this.guildId);
    this.state = "DISCONNECTED" /* DISCONNECTED */;
    this.debug(`[Voice] -> [Node] & [Discord] : Connection Destroyed | Guild: ${this.guildId}`);
  }
  /**
   * Connect the current bot user to a voice channel
   * @internal
   */
  async connect() {
    this.state = "CONNECTING" /* CONNECTING */;
    this.sendVoiceUpdate();
    this.debug(`[Voice] -> [Discord] : Requesting Connection | Guild: ${this.guildId}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.manager.options.voiceConnectionTimeout * 1e3);
    try {
      const [status] = await once(this, "connectionUpdate", { signal: controller.signal });
      if (status !== 0 /* SESSION_READY */) {
        switch (status) {
          case 1 /* SESSION_ID_MISSING */:
            throw new Error("The voice connection is not established due to missing session id");
          case 2 /* SESSION_ENDPOINT_MISSING */:
            throw new Error("The voice connection is not established due to missing connection endpoint");
        }
      }
      this.state = "CONNECTED" /* CONNECTED */;
    } catch (error) {
      this.debug(`[Voice] </- [Discord] : Request Connection Failed | Guild: ${this.guildId}`);
      if (error.name === "AbortError")
        throw new Error(`The voice connection is not established in ${this.manager.options.voiceConnectionTimeout} seconds`);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  /**
   * Update Session ID, Channel ID, Deafen status and Mute status of this instance
   *
   * @param options.session_id ID of this session
   * @param options.channel_id ID of currently connected voice channel
   * @param options.self_deaf Boolean that indicates if the current bot user is deafened or not
   * @param options.self_mute Boolean that indicates if the current bot user is muted or not
   * @internal
   */
  setStateUpdate(options) {
    const { session_id, channel_id, self_deaf, self_mute } = options;
    if (this.channelId && (channel_id && this.channelId !== channel_id)) {
      this.moved = true;
      this.debug(`[Voice] <- [Discord] : Channel Moved | Old Channel: ${this.channelId} Guild: ${this.guildId}`);
    }
    this.channelId = channel_id || this.channelId;
    if (!channel_id) {
      this.state = "DISCONNECTED" /* DISCONNECTED */;
      this.debug(`[Voice] <- [Discord] : Channel Disconnected | Guild: ${this.guildId}`);
    }
    this.deafened = self_deaf;
    this.muted = self_mute;
    this.sessionId = session_id || null;
    this.debug(`[Voice] <- [Discord] : State Update Received | Channel: ${this.channelId} Session ID: ${session_id} Guild: ${this.guildId}`);
  }
  /**
   * Sets the server update data for this connection
   * @internal
   */
  setServerUpdate(data) {
    if (!data.endpoint) {
      this.emit("connectionUpdate", 2 /* SESSION_ENDPOINT_MISSING */);
      return;
    }
    if (!this.sessionId) {
      this.emit("connectionUpdate", 1 /* SESSION_ID_MISSING */);
      return;
    }
    if (this.region && !data.endpoint.startsWith(this.region)) {
      this.moved = true;
      this.debug(`[Voice] <- [Discord] : Voice Region Moved | Old Region: ${this.region} Guild: ${this.guildId}`);
    }
    this.region = data.endpoint.split(".").shift()?.replace(/[0-9]/g, "") || null;
    this.serverUpdate = data;
    this.emit("connectionUpdate", 0 /* SESSION_READY */);
    this.debug(`[Voice] <- [Discord] : Server Update Received | Server: ${this.region} Guild: ${this.guildId}`);
  }
  /**
   * Send voice data to discord
   * @internal
   */
  sendVoiceUpdate() {
    this.send({ guild_id: this.guildId, channel_id: this.channelId, self_deaf: this.deafened, self_mute: this.muted });
  }
  /**
   * Send data to Discord
   * @param data The data to send
   * @internal
   */
  send(data) {
    this.manager.connector.sendPacket(this.shardId, { op: 4, d: data }, false);
  }
  /**
   * Emits a debug log
   * @internal
   */
  debug(message) {
    this.manager.emit("debug", this.constructor.name, message);
  }
};

// src/guild/Player.ts
import { EventEmitter as EventEmitter2 } from "events";
var Player = class extends EventEmitter2 {
  /**
   * @param node An instance of Node (Lavalink API wrapper)
   * @param connection An instance of connection class
   */
  constructor(node, connection) {
    super();
    this.guildId = connection.guildId;
    this.connection = connection;
    this.node = node;
    this.track = null;
    this.volume = 100;
    this.info = null;
    this.paused = false;
    this.position = 0;
    this.ping = 0;
    this.filters = {};
  }
  get playerData() {
    return {
      guildId: this.guildId,
      playerOptions: {
        encodedTrack: this.track,
        position: this.position,
        paused: this.paused,
        filters: this.filters,
        info: this.info,
        voice: {
          token: this.connection.serverUpdate.token,
          endpoint: this.connection.serverUpdate.endpoint,
          sessionId: this.connection.sessionId
        },
        volume: this.volume
      }
    };
  }
  /**
   * Move player to another node. Auto disconnects when the node specified is not found
   * @param name
   */
  async move(name) {
    try {
      const node = this.node.manager.nodes.get(name) || this.connection.getNode(this.connection.manager.nodes, this.connection);
      if (!node)
        throw new Error("No node available to move to");
      if (node.state !== "CONNECTED" /* CONNECTED */)
        throw new Error("Tried to move to a node that is not connected");
      if (node.name === this.node.name)
        throw new Error("Tried to move to the same node where the current player is connected on");
      await this.destroyPlayer();
      this.node = node;
      this.node.players.set(this.guildId, this);
      await this.resume();
    } catch (error) {
      this.connection.disconnect();
      await this.destroyPlayer(true);
      throw error;
    }
  }
  /**
   * Destroys the player in remote lavalink side
   */
  async destroyPlayer(clean = false) {
    this.node.players.delete(this.guildId);
    if (clean)
      this.clean();
    await this.node.rest.destroyPlayer(this.guildId);
  }
  /**
   * Play a new track
   * @param playable Options for playing this track
   */
  async playTrack(playable) {
    const playerOptions = {
      encodedTrack: playable.track,
      info: playable.info
    };
    if (playable.options) {
      const { pause, startTime, endTime, volume } = playable.options;
      if (pause)
        playerOptions.paused = pause;
      if (startTime)
        playerOptions.position = startTime;
      if (endTime)
        playerOptions.endTime = endTime;
      if (volume)
        playerOptions.volume = volume;
    }
    this.track = playable.track;
    this.info = playable.info;
    if (playerOptions.paused)
      this.paused = playerOptions.paused;
    if (playerOptions.position)
      this.position = playerOptions.position;
    if (playerOptions.volume)
      this.volume = playerOptions.volume;
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      noReplace: playable.options?.noReplace ?? false,
      playerOptions
    });
  }
  /**
   * Stop the currently playing track
   */
  async stopTrack() {
    this.position = 0;
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: { encodedTrack: null, info: null }
    });
  }
  /**
   * Pause or unpause the currently playing track
   * @param paused Boolean value to specify whether to pause or unpause the current bot user
   */
  async setPaused(paused = true) {
    this.paused = paused;
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: { paused }
    });
  }
  /**
   * Seek to a specific time in the currently playing track
   * @param position Position to seek to in milliseconds
   */
  async seekTo(position) {
    this.position = position;
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: { position }
    });
  }
  /**
   * Sets the global volume of the player
   * @param volume Target volume 0-1000
   */
  async setGlobalVolume(volume) {
    this.volume = volume;
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: { volume: this.volume }
    });
  }
  /**
   * Sets the filter volume of the player
   * @param volume Target volume 0.0-5.0
   */
  async setFilterVolume(volume) {
    this.filters.volume = volume;
    await this.setFilters(this.filters);
  }
  /**
   * Change the equalizer settings applied to the currently playing track
   * @param equalizer An array of objects that conforms to the Bands type that define volumes at different frequencies
   */
  async setEqualizer(equalizer) {
    this.filters.equalizer = equalizer;
    await this.setFilters(this.filters);
  }
  /**
   * Change the karaoke settings applied to the currently playing track
   * @param karaoke An object that conforms to the KaraokeSettings type that defines a range of frequencies to mute
   */
  async setKaraoke(karaoke) {
    this.filters.karaoke = karaoke || null;
    await this.setFilters(this.filters);
  }
  /**
   * Change the timescale settings applied to the currently playing track
   * @param timescale An object that conforms to the TimescaleSettings type that defines the time signature to play the audio at
   */
  async setTimescale(timescale) {
    this.filters.timescale = timescale || null;
    await this.setFilters(this.filters);
  }
  /**
   * Change the tremolo settings applied to the currently playing track
   * @param tremolo An object that conforms to the FreqSettings type that defines an oscillation in volume
   */
  async setTremolo(tremolo) {
    this.filters.tremolo = tremolo || null;
    await this.setFilters(this.filters);
  }
  /**
   * Change the vibrato settings applied to the currently playing track
   * @param vibrato An object that conforms to the FreqSettings type that defines an oscillation in pitch
   */
  async setVibrato(vibrato) {
    this.filters.vibrato = vibrato || null;
    await this.setFilters(this.filters);
  }
  /**
   * Change the rotation settings applied to the currently playing track
   * @param rotation An object that conforms to the RotationSettings type that defines the frequency of audio rotating round the listener
   */
  async setRotation(rotation) {
    this.filters.rotation = rotation || null;
    await this.setFilters(this.filters);
  }
  /**
   * Change the distortion settings applied to the currently playing track
   * @param distortion An object that conforms to DistortionSettings that defines distortions in the audio
   * @returns The current player instance
   */
  async setDistortion(distortion) {
    this.filters.distortion = distortion || null;
    await this.setFilters(this.filters);
  }
  /**
   * Change the channel mix settings applied to the currently playing track
   * @param channelMix An object that conforms to ChannelMixSettings that defines how much the left and right channels affect each other (setting all factors to 0.5 causes both channels to get the same audio)
   */
  async setChannelMix(channelMix) {
    this.filters.channelMix = channelMix || null;
    await this.setFilters(this.filters);
  }
  /**
   * Change the low pass settings applied to the currently playing track
   * @param lowPass An object that conforms to LowPassSettings that defines the amount of suppression on higher frequencies
   */
  async setLowPass(lowPass) {
    this.filters.lowPass = lowPass || null;
    await this.setFilters(this.filters);
  }
  /**
   * Change the all filter settings applied to the currently playing track
   * @param filters An object that conforms to FilterOptions that defines all filters to apply/modify
   */
  async setFilters(filters) {
    this.filters = filters;
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: { filters, info: this.info }
    });
  }
  /**
   * Clear all filters applied to the currently playing track
   */
  clearFilters() {
    return this.setFilters({
      volume: 1,
      equalizer: [],
      karaoke: null,
      timescale: null,
      tremolo: null,
      vibrato: null,
      rotation: null,
      distortion: null,
      channelMix: null,
      lowPass: null
    });
  }
  /**
   * Resumes the current track
   * @param options An object that conforms to ResumeOptions that specify behavior on resuming
   */
  async resume(options = {}) {
    const data = this.playerData;
    if (options.noReplace)
      data.noReplace = options.noReplace;
    if (options.startTime)
      data.playerOptions.position = options.startTime;
    if (options.endTime)
      data.playerOptions.position;
    if (options.pause)
      data.playerOptions.paused = options.pause;
    await this.update(data);
    this.emit("resumed", this);
  }
  /**
   * If you want to update the whole player yourself, sends raw update player info to lavalink
   */
  async update(updatePlayer) {
    const data = { ...updatePlayer, ...{ guildId: this.guildId, sessionId: this.node.sessionId } };
    await this.node.rest.updatePlayer(data);
    if (updatePlayer.playerOptions) {
      const options = updatePlayer.playerOptions;
      if (options.encodedTrack)
        this.track = options.encodedTrack;
      if (options.position)
        this.position = options.position;
      if (options.paused)
        this.paused = options.paused;
      if (options.filters)
        this.filters = options.filters;
      if (options.volume)
        this.volume = options.volume;
      if (options.info)
        this.info = options.info;
    }
  }
  /**
   * Remove all event listeners on this instance
   * @internal
   */
  clean() {
    this.removeAllListeners();
    this.reset();
  }
  /**
   * Reset the track, position and filters on this instance to defaults
   * @internal
   */
  reset() {
    this.track = null;
    this.volume = 100;
    this.position = 0;
    this.filters = {};
  }
  /**
   * Sends server update to lavalink
   * @internal
   */
  async sendServerUpdate() {
    try {
      const playerUpdate = {
        guildId: this.guildId,
        playerOptions: {
          info: this.info,
          voice: {
            token: this.connection.serverUpdate.token,
            endpoint: this.connection.serverUpdate.endpoint,
            sessionId: this.connection.sessionId
          }
        }
      };
      await this.node.rest.updatePlayer(playerUpdate);
    } catch (error) {
      if (!this.connection.established)
        throw error;
      this.connection.disconnect();
      await Promise.allSettled([this.destroyPlayer(true)]);
    }
  }
  /**
   * Handle player update data
   */
  onPlayerUpdate(json) {
    const { position, ping } = json.state;
    this.position = position;
    this.ping = ping;
    this.emit("update", json);
  }
  /**
   * Handle player events received from Lavalink
   * @param json JSON data from Lavalink
   * @internal
   */
  onPlayerEvent(json) {
    switch (json.type) {
      case "TrackStartEvent":
        if (this.track)
          this.track = json.track.encoded;
        this.emit("start", json);
        break;
      case "TrackEndEvent":
        this.emit("end", json);
        break;
      case "TrackStuckEvent":
        this.emit("stuck", json);
        break;
      case "TrackExceptionEvent":
        this.emit("exception", json);
        break;
      case "WebSocketClosedEvent":
        if (!this.connection.reconnecting) {
          if (!this.connection.moved)
            this.emit("closed", json);
          else
            this.connection.moved = false;
        }
        break;
      default:
        this.node.emit("debug", this.node.name, `[Player] -> [Node] : Unknown Player Event Type ${json.type} | Guild: ${this.guildId}`);
    }
  }
};

// src/node/Node.ts
import Websocket from "ws";

// src/node/Rest.ts
var LoadType = /* @__PURE__ */ ((LoadType2) => {
  LoadType2["TRACK"] = "track";
  LoadType2["PLAYLIST"] = "playlist";
  LoadType2["SEARCH"] = "search";
  LoadType2["EMPTY"] = "empty";
  LoadType2["ERROR"] = "error";
  return LoadType2;
})(LoadType || {});
var Rest = class {
  /**
   * @param node An instance of Node
   * @param options The options to initialize this rest class
   * @param options.name Name of this node
   * @param options.url URL of Lavalink
   * @param options.auth Credentials to access Lavalnk
   * @param options.secure Weather to use secure protocols or not
   * @param options.group Group of this node
   */
  constructor(node, options) {
    this.node = node;
    this.url = `${options.secure ? "https" : "http"}://${options.url}`;
    this.version = `/v${4 /* REST_VERSION */}`;
    this.auth = options.auth;
  }
  get sessionId() {
    return this.node.sessionId;
  }
  /**
   * Resolve a track
   * @param identifier Track ID
   * @returns A promise that resolves to a Lavalink response
   */
  resolve(identifier) {
    const options = {
      endpoint: "/loadtracks",
      options: { params: { identifier } }
    };
    return this.fetch(options);
  }
  /**
   * Decode a track
   * @param track Encoded track
   * @returns Promise that resolves to a track
   */
  decode(track) {
    const options = {
      endpoint: "/decodetrack",
      options: { params: { track } }
    };
    return this.fetch(options);
  }
  /**
   * Gets all the player with the specified sessionId
   * @returns Promise that resolves to an array of Lavalink players
   */
  async getPlayers() {
    const options = {
      endpoint: `/sessions/${this.sessionId}/players`,
      options: {}
    };
    return await this.fetch(options) ?? [];
  }
  /**
   * Gets all the player with the specified sessionId
   * @returns Promise that resolves to an array of Lavalink players
   */
  getPlayer(guildId) {
    const options = {
      endpoint: `/sessions/${this.sessionId}/players/${guildId}`,
      options: {}
    };
    return this.fetch(options);
  }
  /**
   * Updates a Lavalink player
   * @param data SessionId from Discord
   * @returns Promise that resolves to a Lavalink player
   */
  updatePlayer(data) {
    const options = {
      endpoint: `/sessions/${this.sessionId}/players/${data.guildId}`,
      options: {
        method: "PATCH",
        params: { noReplace: data.noReplace?.toString() || "false" },
        headers: { "Content-Type": "application/json" },
        body: data.playerOptions
      }
    };
    return this.fetch(options);
  }
  /**
   * Deletes a Lavalink player
   * @param guildId guildId where this player is
   */
  async destroyPlayer(guildId) {
    const options = {
      endpoint: `/sessions/${this.sessionId}/players/${guildId}`,
      options: { method: "DELETE" }
    };
    await this.fetch(options);
  }
  /**
   * Updates the session with a resume boolean and timeout
   * @param resuming Whether resuming is enabled for this session or not
   * @param timeout Timeout to wait for resuming
   * @returns Promise that resolves to a Lavalink player
   */
  updateSession(resuming, timeout) {
    const options = {
      endpoint: `/sessions/${this.sessionId}`,
      options: {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { resuming, timeout }
      }
    };
    return this.fetch(options);
  }
  /**
   * Gets the status of this node
   * @returns Promise that resolves to a node stats response
   */
  stats() {
    const options = {
      endpoint: "/stats",
      options: {}
    };
    return this.fetch(options);
  }
  /**
   * Get routeplanner status from Lavalink
   * @returns Promise that resolves to a routeplanner response
   */
  getRoutePlannerStatus() {
    const options = {
      endpoint: "/routeplanner/status",
      options: {}
    };
    return this.fetch(options);
  }
  /**
   * Release blacklisted IP address into pool of IPs
   * @param address IP address
   */
  async unmarkFailedAddress(address) {
    const options = {
      endpoint: "/routeplanner/free/address",
      options: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { address }
      }
    };
    await this.fetch(options);
  }
  /**
   * Get Lavalink info
   */
  getLavalinkInfo() {
    const options = {
      endpoint: "/info",
      options: {
        headers: { "Content-Type": "application/json" }
      }
    };
    return this.fetch(options);
  }
  /**
   * Make a request to Lavalink
   * @param fetchOptions.endpoint Lavalink endpoint
   * @param fetchOptions.options Options passed to fetch
   * @internal
   */
  async fetch(fetchOptions) {
    const { endpoint, options } = fetchOptions;
    let headers = {
      "Authorization": this.auth,
      "User-Agent": this.node.manager.options.userAgent
    };
    if (options.headers)
      headers = { ...headers, ...options.headers };
    const url = new URL(`${this.url}${this.version}${endpoint}`);
    if (options.params)
      url.search = new URLSearchParams(options.params).toString();
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), this.node.manager.options.restTimeout * 1e3);
    const method = options.method?.toUpperCase() || "GET";
    const finalFetchOptions = {
      method,
      headers,
      signal: abortController.signal
    };
    if (!["GET", "HEAD"].includes(method) && options.body)
      finalFetchOptions.body = JSON.stringify(options.body);
    const request = await fetch(url.toString(), finalFetchOptions).finally(() => clearTimeout(timeout));
    if (!request.ok) {
      const response = await request.json().catch(() => null);
      if (!response?.message)
        throw new Error(`Rest request failed with response code: ${request.status}`);
      else
        throw new Error(`Rest request failed with response code: ${request.status} | message: ${response.message}`);
    }
    try {
      return await request.json();
    } catch {
    }
  }
};

// src/node/Node.ts
import { EventEmitter as EventEmitter3 } from "events";
var Node = class extends EventEmitter3 {
  /**
   * @param manager Shoukaku instance
   * @param options Options on creating this node
   * @param options.name Name of this node
   * @param options.url URL of Lavalink
   * @param options.auth Credentials to access Lavalnk
   * @param options.secure Whether to use secure protocols or not
   * @param options.group Group of this node
   */
  constructor(manager, options) {
    super();
    this.manager = manager;
    this.players = /* @__PURE__ */ new Map();
    this.rest = new (this.manager.options.structures.rest || Rest)(this, options);
    this.name = options.name;
    this.group = options.group;
    this.version = `/v${4 /* WEBSOCKET_VERSION */}`;
    this.url = `${options.secure ? "wss" : "ws"}://${options.url}`;
    this.auth = options.auth;
    this.reconnects = 0;
    this.state = "DISCONNECTED" /* DISCONNECTED */;
    this.stats = null;
    this.info = null;
    this.ws = null;
    this.initialized = false;
    this.destroyed = false;
  }
  /**
   * Penalties for load balancing
   * @returns Penalty score
   * @internal @readonly
   */
  get penalties() {
    let penalties = 0;
    if (!this.stats)
      return penalties;
    penalties += this.stats.players;
    penalties += Math.round(Math.pow(1.05, 100 * this.stats.cpu.systemLoad) * 10 - 10);
    if (this.stats.frameStats) {
      penalties += this.stats.frameStats.deficit;
      penalties += this.stats.frameStats.nulled * 2;
    }
    return penalties;
  }
  /**
   * If we should clean this node
   * @internal @readonly
   */
  get shouldClean() {
    return this.destroyed || this.reconnects + 1 >= this.manager.options.reconnectTries;
  }
  /**
   * Connect to Lavalink
   */
  connect() {
    if (!this.manager.id)
      throw new Error("Don't connect a node when the library is not yet ready");
    if (this.destroyed)
      throw new Error("You can't re-use the same instance of a node once disconnected, please re-add the node again");
    this.state = "CONNECTING" /* CONNECTING */;
    const headers = {
      "Client-Name": this.manager.options.userAgent,
      "User-Agent": this.manager.options.userAgent,
      "Authorization": this.auth,
      "User-Id": this.manager.id
    };
    const sessionId = [...this.manager.reconnectingPlayers.values()].find((player) => player.node.name === this.name)?.node.sessionId;
    if (sessionId)
      headers["Session-Id"] = sessionId;
    this.emit("debug", `[Socket] -> [${this.name}] : Connecting ${this.url}, Version: ${this.version}, Trying to resume? ${!!sessionId}`);
    if (!this.initialized)
      this.initialized = true;
    const url = new URL(`${this.url}${this.version}/websocket`);
    this.ws = new Websocket(url.toString(), { headers });
    this.ws.once("upgrade", (response) => this.open(response));
    this.ws.once("close", (...args) => this.close(...args));
    this.ws.on("error", (error) => this.error(error));
    this.ws.on("message", (data) => this.message(data).catch((error) => this.error(error)));
  }
  /**
   * Disconnect from lavalink
   * @param code Status code
   * @param reason Reason for disconnect
   */
  disconnect(code, reason) {
    if (this.destroyed)
      return;
    this.destroyed = true;
    this.state = "DISCONNECTING" /* DISCONNECTING */;
    if (this.ws)
      this.ws.close(code, reason);
    else
      this.clean();
  }
  /**
   * Handle connection open event from Lavalink
   * @param response Response from Lavalink
   * @internal
   */
  open(response) {
    const resumed = response.headers["session-resumed"] === "true";
    this.emit("debug", `[Socket] <-> [${this.name}] : Connection Handshake Done! ${this.url} | Upgrade Headers Resumed: ${resumed}`);
    this.reconnects = 0;
    this.state = "NEARLY" /* NEARLY */;
  }
  /**
   * Handle message from Lavalink
   * @param message JSON message
   * @internal
   */
  async message(message) {
    if (this.destroyed)
      return;
    const json = JSON.parse(message);
    if (!json)
      return;
    this.emit("raw", json);
    switch (json.op) {
      case "stats" /* STATS */:
        this.emit("debug", `[Socket] <- [${this.name}] : Node Status Update | Server Load: ${this.penalties}`);
        this.stats = json;
        break;
      case "ready" /* READY */:
        this.sessionId = json.sessionId;
        this.state = "CONNECTED" /* CONNECTED */;
        this.emit("debug", `[Socket] -> [${this.name}] : Lavalink is ready! | Lavalink resume: ${json.resumed}`);
        if (this.manager.options.resume) {
          await this.rest.updateSession(this.manager.options.resume, this.manager.options.resumeTimeout);
          this.emit("debug", `[Socket] -> [${this.name}] : Resuming configured!`);
          if (this.manager.reconnectingPlayers) {
            this.emit("debug", `[${this.name}] -> [Player] : Trying to re-create players from the last session`);
            await this.manager.restorePlayers(this);
            this.emit("debug", `[${this.name}] <-> [Player]: Session restore completed`);
          }
        }
        this.manager.connectingNodes.splice(this.manager.connectingNodes.indexOf(this.manager.connectingNodes.find((e) => e.name === this.name)), 1);
        this.emit("ready", [...this.manager.reconnectingPlayers.values()].filter((player2) => player2.state?.node === this.name && player2.state.restored)?.length ?? 0);
        [...this.manager.reconnectingPlayers.values()]?.filter((player2) => player2.state?.node === this.name).forEach((dump) => this.manager.reconnectingPlayers.delete(dump.options.guildId));
        break;
      case "event" /* EVENT */:
      case "playerUpdate" /* PLAYER_UPDATE */:
        const player = this.players.get(json.guildId);
        if (!player)
          return;
        if (json.op === "event" /* EVENT */)
          player.onPlayerEvent(json);
        else
          player.onPlayerUpdate(json);
        break;
      default:
        this.emit("debug", `[Player] -> [Node] : Unknown Message OP ${json.op}`);
    }
  }
  /**
   * Handle closed event from lavalink
   * @param code Status close
   * @param reason Reason for connection close
   */
  close(code, reason) {
    this.emit("debug", `[Socket] <-/-> [${this.name}] : Connection Closed, Code: ${code || "Unknown Code"}`);
    this.emit("close", code, reason);
    if (this.shouldClean) {
      this.manager.restorePlayers(this);
      this.clean();
    } else
      this.reconnect();
  }
  /**
   * To emit error events easily
   * @param error error message
   */
  error(error) {
    this.emit("error", error);
  }
  /**
   * Destroys the websocket connection
   * @internal
   */
  destroy(move, count = 0) {
    this.ws?.removeAllListeners();
    this.ws?.close();
    this.ws = null;
    this.state = "DISCONNECTED" /* DISCONNECTED */;
    if (!this.shouldClean)
      return;
    this.destroyed = true;
    this.emit("disconnect", move, count);
  }
  /**
   * Cleans and moves players to other nodes if possible
   * @internal
   */
  async clean() {
    this.manager.connectingNodes.splice(this.manager.connectingNodes.indexOf(this.manager.connectingNodes.find((e) => e.name === this.name)), 1);
    let move = this.manager.options.moveOnDisconnect;
    if (!move)
      return this.destroy(false);
    let count;
    try {
      count = await this.movePlayers();
      move = count > 0;
    } catch (error) {
      this.error(error);
    } finally {
      this.destroy(move, count);
    }
  }
  /**
   * Reconnect to Lavalink
   * @internal
   */
  async reconnect() {
    if (this.state === "RECONNECTING" /* RECONNECTING */)
      return;
    if (this.state !== "DISCONNECTED" /* DISCONNECTED */)
      this.destroy(false);
    this.state = "RECONNECTING" /* RECONNECTING */;
    this.reconnects++;
    this.emit("reconnecting", this.manager.options.reconnectTries - this.reconnects, this.manager.options.reconnectInterval);
    this.emit("debug", `[Socket] -> [${this.name}] : Reconnecting in ${this.manager.options.reconnectInterval} seconds. ${this.manager.options.reconnectTries - this.reconnects} tries left`);
    await wait(this.manager.options.reconnectInterval * 1e3);
    this.connect();
  }
  /**
   * Tries to move the players to another node
   * @internal
   */
  async movePlayers() {
    const players = [...this.players.values()];
    const data = await Promise.allSettled(players.map((player) => player.move()));
    return data.filter((results) => results.status === "fulfilled").length;
  }
};

// src/Shoukaku.ts
import { EventEmitter as EventEmitter4 } from "events";
var Shoukaku = class extends EventEmitter4 {
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
  constructor(connector, nodes, options = {}, dumps = []) {
    super();
    this.connector = connector.set(this);
    this.options = mergeDefault(ShoukakuDefaults, options);
    this.nodes = /* @__PURE__ */ new Map();
    this.connections = /* @__PURE__ */ new Map();
    this.id = null;
    this.connector.listen(nodes);
    this.reconnectingPlayers = new Map(dumps);
    this.connectingNodes = [];
  }
  /**
   * Get a list of players
   * @returns A map of guild IDs and players
   * @readonly
   */
  get players() {
    const players = /* @__PURE__ */ new Map();
    for (const node of this.nodes.values()) {
      for (const [id, player] of node.players)
        players.set(id, player);
    }
    return players;
  }
  /**
   * Get dumped players data that you will need in case of a restart
   * @returns A map of guild IDs and PlayerDump
   * @readonly
   */
  get playersDump() {
    try {
      const players = /* @__PURE__ */ new Map();
      for (const node of this.nodes.values()) {
        for (const [id, player] of node.players) {
          if (!player.connection.serverUpdate?.token || !player.connection.serverUpdate?.endpoint)
            continue;
          players.set(id, {
            node: {
              name: player.node.name,
              group: player.node.group,
              sessionId: player.node.sessionId
            },
            options: {
              guildId: player.connection.guildId,
              shardId: player.connection.shardId,
              channelId: player.connection.channelId,
              deaf: player.connection.deafened,
              mute: player.connection.muted
            },
            player: player.playerData.playerOptions,
            timestamp: Date.now()
          });
        }
      }
      return players;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Restore players from previous session
   * @throws {Error} Will throw catched error if something went wrong
   * @param node
   */
  async restorePlayers(node) {
    try {
      const playerDumps = [...this.reconnectingPlayers.values()].filter((player) => player.node.name === node.name || player.node.group === node.group);
      if (!playerDumps || playerDumps.length === 0) {
        node.emit("debug", `[${node.name}] <- [Player] : Restore canceled due to missing data`);
        return;
      }
      for (const dump of playerDumps) {
        const isNodeAvailable = this.connectingNodes.filter((n) => n?.group === node?.group).length > 0;
        node.emit("debug", `[${node.name}] <- [Player/${dump.options.guildId}] : Restoring session`);
        node.emit("debug", `[${node.name}] <- [Player/${dump.options.guildId}] : The node ${node.name} is ${isNodeAvailable ? "available" : "not available"}.`);
        if (!isNodeAvailable) {
          node.emit("debug", `[${node.name}] <- [Player/${dump.options.guildId}] : Couldn't restore player because there are no suitable nodes available`);
          continue;
        }
        const isSessionExpired = dump.timestamp + this.options.reconnectInterval * 1e3 < Date.now();
        if (isSessionExpired) {
          node.emit("debug", `[${node.name}] <- [Player/${dump.options.guildId}] : Couldn't restore player because session is expired`);
          node.emit("raw", { op: "playerRestore" /* PLAYER_RESTORE */, state: { restored: false }, guildId: dump.options.guildId });
          node.emit("restore", { op: "playerRestore" /* PLAYER_RESTORE */, state: { restored: false }, guildId: dump.options.guildId });
          continue;
        }
        if (node.state !== "CONNECTED" /* CONNECTED */) {
          node.emit("debug", `[${node.name}] <- [Player/${dump.options.guildId}] : Couldn't restore player because node is not connected`);
          node.emit("raw", { op: "playerRestore" /* PLAYER_RESTORE */, state: { restored: false }, guildId: dump.options.guildId });
          node.emit("restore", { op: "playerRestore" /* PLAYER_RESTORE */, state: { restored: false }, guildId: dump.options.guildId });
          continue;
        }
        const player = await this.joinVoiceChannel({
          guildId: dump.options.guildId,
          shardId: dump.options.shardId,
          channelId: dump.options.channelId,
          deaf: dump.options.deaf ?? false,
          mute: dump.options.mute ?? false,
          getNode: () => {
            return node;
          }
        });
        dump.player.voice = {
          token: player.connection.serverUpdate.token,
          endpoint: player.connection.serverUpdate.endpoint,
          sessionId: player.connection.sessionId
        };
        player.connection.setStateUpdate({
          channel_id: dump.options.channelId,
          session_id: dump.player.voice?.sessionId,
          self_deaf: dump.options.deaf ?? false,
          self_mute: dump.options.mute ?? false
        });
        player.connection.setServerUpdate({
          token: dump.player.voice.token,
          endpoint: dump.player.voice.endpoint,
          guild_id: dump.options.guildId
        });
        await player.update({ guildId: dump.options.guildId, playerOptions: dump.player });
        node.emit("debug", `[${node.name}] <- [Player] : Restored session "${dump.options.guildId}"`);
        dump.state = { restored: true, node: node.name };
        node.emit("raw", { op: "playerRestore" /* PLAYER_RESTORE */, state: dump.state, guildId: dump.options.guildId });
        node.emit("restore", { op: "playerRestore" /* PLAYER_RESTORE */, state: dump.state, guildId: dump.options.guildId });
      }
      this.emit("restored", playerDumps);
    } catch (error) {
      throw error;
    }
  }
  /**
   * Add a Lavalink node to the pool of available nodes
   * @param options.name Name of this node
   * @param options.url URL of Lavalink
   * @param options.auth Credentials to access Lavalnk
   * @param options.secure Whether to use secure protocols or not
   * @param options.group Group of this node
   */
  addNode(options) {
    const node = new Node(this, options);
    node.on("debug", (...args) => this.emit("debug", node.name, ...args));
    node.on("reconnecting", (...args) => this.emit("reconnecting", node.name, ...args));
    node.on("error", (...args) => this.emit("error", node.name, ...args));
    node.on("close", (...args) => this.emit("close", node.name, ...args));
    node.on("ready", (...args) => this.emit("ready", node.name, ...args));
    node.on("raw", (...args) => this.emit("raw", node.name, ...args));
    node.once("disconnect", (...args) => this.clean(node, ...args));
    node.connect();
    this.nodes.set(node.name, node);
    this.connectingNodes.push(options);
  }
  /**
   * Remove a Lavalink node from the pool of available nodes
   * @param name Name of the node
   * @param reason Reason of removing the node
   */
  removeNode(name, reason = "Remove node executed") {
    const node = this.nodes.get(name);
    if (!node)
      throw new Error("The node name you specified doesn't exist");
    node.disconnect(1e3, reason);
  }
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
  async joinVoiceChannel(options) {
    if (this.connections.has(options.guildId))
      throw new Error("This guild already have an existing connection");
    if (!options.getNode)
      options.getNode = this.getIdealNode.bind(this);
    const connection = new Connection(this, options);
    this.connections.set(connection.guildId, connection);
    try {
      await connection.connect();
    } catch (error) {
      this.connections.delete(options.guildId);
      throw error;
    }
    try {
      const node = options.getNode(this.nodes, connection);
      if (!node)
        throw new Error("Can't find any nodes to connect on");
      const player = this.options.structures.player ? new this.options.structures.player(node, connection) : new Player(node, connection);
      node.players.set(player.guildId, player);
      try {
        await player.sendServerUpdate();
      } catch (error) {
        node.players.delete(options.guildId);
        throw error;
      }
      connection.established = true;
      return player;
    } catch (error) {
      connection.disconnect();
      throw error;
    }
  }
  /**
   * Leaves a voice channel
   * @param guildId The id of the guild you want to delete
   * @returns The destroyed / disconnected player or undefined if none
   * @internal
   */
  async leaveVoiceChannel(guildId) {
    const connection = this.connections.get(guildId);
    if (connection)
      connection.disconnect();
    const player = this.players.get(guildId);
    if (player)
      await player.destroyPlayer(true);
    return player;
  }
  /**
   * Gets the Lavalink node the least penalty score
   * @returns A Lavalink node or undefined if there are no nodes ready
   */
  getIdealNode() {
    return [...this.nodes.values()].filter((node) => node.state === "CONNECTED" /* CONNECTED */).sort((a, b) => a.penalties - b.penalties).shift();
  }
  /**
   * Cleans the disconnected lavalink node
   * @param node The node to clean
   * @param args Additional arguments for Shoukaku to emit
   * @returns A Lavalink node or undefined
   * @internal
   */
  clean(node, ...args) {
    node.removeAllListeners();
    this.nodes.delete(node.name);
    this.emit("disconnect", node.name, ...args);
  }
};
export {
  AllowedPackets,
  Connection,
  Connector,
  libs_exports as Connectors,
  Constants_exports as Constants,
  LoadType,
  Node,
  Player,
  Rest,
  Shoukaku,
  Utils_exports as Utils
};
//# sourceMappingURL=index.mjs.map