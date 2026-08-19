// Minimal nkruntime type declarations for Nakama TypeScript server runtime.
// Based on Nakama v3.x runtime API.

declare namespace nkruntime {
  type Context = {
    env: Record<string, string>;
    executionMode: string;
    headers: Record<string, string[]>;
    queryParams: Record<string, string[]>;
    userId: string;
    username: string;
    vars: Record<string, string>;
    userSessionExp: number;
    clientIp: string;
    clientPort: string;
    matchId: string;
    matchNode: string;
    matchLabel: string;
    matchTickRate: number;
  };

  type Logger = {
    info(format: string, ...args: unknown[]): void;
    warn(format: string, ...args: unknown[]): void;
    error(format: string, ...args: unknown[]): void;
    debug(format: string, ...args: unknown[]): void;
  };

  type Presence = {
    userId: string;
    sessionId: string;
    username: string;
    node: string;
    status: string;
  };

  type Match = {
    matchId: string;
    authoritative: boolean;
    label: string;
    size: number;
    tickRate: number;
    handlerName: string;
  };

  type MatchMessage = {
    sender: Presence;
    persistence: boolean;
    status: string;
    opCode: number;
    data: string;
    reliable: boolean;
    receiveTimeMs: number;
  };

  type MatchDispatcher = {
    broadcastMessage(
      opCode: number,
      data: string | null,
      presences: Presence[] | null,
      sender: Presence | null,
      reliable?: boolean,
    ): void;
    broadcastMessageDeferred(
      opCode: number,
      data: string | null,
      presences: Presence[] | null,
      sender: Presence | null,
      reliable?: boolean,
    ): void;
    matchKick(presences: Presence[]): void;
    matchLabelUpdate(label: string): void;
  };

  type MatchInitFunction<T = unknown> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    params: Record<string, string>,
  ) => { state: T; tickRate: number; label: string };

  type MatchJoinAttemptFunction<T = unknown> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    presence: Presence,
    metadata: Record<string, string>,
  ) => { state: T; accept: boolean; rejectMessage?: string } | null;

  type MatchJoinFunction<T = unknown> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    presences: Presence[],
  ) => { state: T } | null;

  type MatchLeaveFunction<T = unknown> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    presences: Presence[],
  ) => { state: T } | null;

  type MatchLoopFunction<T = unknown> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    messages: MatchMessage[],
  ) => { state: T } | null;

  type MatchSignalFunction<T = unknown> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    data: string,
  ) => { state: T; data: string } | null;

  type MatchTerminateFunction<T = unknown> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    graceSeconds: number,
  ) => { state: T } | null;

  type MatchHandler<T = unknown> = {
    matchInit: MatchInitFunction<T>;
    matchJoinAttempt?: MatchJoinAttemptFunction<T>;
    matchJoin?: MatchJoinFunction<T>;
    matchLeave?: MatchLeaveFunction<T>;
    matchLoop: MatchLoopFunction<T>;
    matchSignal?: MatchSignalFunction<T>;
    matchTerminate?: MatchTerminateFunction<T>;
  };

  type RpcFunction = (ctx: Context, logger: Logger, nk: Nakama, payload: string) => string;

  type Initializer = {
    registerRpc(id: string, func: RpcFunction): void;
    registerMatch<T>(id: string, handler: MatchHandler<T>): void;
    registerBeforeRt(id: string, func: unknown): void;
    registerAfterRt(id: string, func: unknown): void;
    registerBeforeGetAccount(func: unknown): void;
    registerAfterGetAccount(func: unknown): void;
    registerMatchmakerMatched(func: unknown): void;
    registerLeaderboardReset(func: unknown): void;
    registerTournamentReset(func: unknown): void;
  };

  type Nakama = {
    // Match
    matchCreate(module: string, params?: Record<string, string>): string;
    matchList(
      limit: number,
      authoritative: boolean,
      label: string | null,
      minSize: number,
      maxSize: number,
      query: string,
    ): Match[];
    matchSignal(matchId: string, data: string): string;

    // Account / Users
    accountGetId(userId: string): Account;
    accountsGetId(userIds: string[]): Account[];
    accountUpdateId(
      userId: string,
      username?: string | null,
      metadata?: Record<string, unknown> | null,
      displayName?: string | null,
      timezone?: string | null,
      location?: string | null,
      langTag?: string | null,
      avatarUrl?: string | null,
    ): void;

    // Friends
    friendsList(userId: string, limit: number, state?: number, cursor?: string): FriendList;
    friendsAdd(userId: string, ids: string[], usernames?: string[]): void;
    friendsDelete(userId: string, ids: string[], usernames?: string[]): void;

    // Storage
    storageRead(reads: StorageReadRequest[]): StorageObject[];
    storageWrite(writes: StorageWriteRequest[]): StorageWriteAck[];
    storageDelete(deletes: StorageDeleteRequest[]): void;

    // Wallet
    walletUpdate(userId: string, changeset: Record<string, number>, metadata?: Record<string, unknown>, updateLedger?: boolean): { updated: Record<string, number>; previous: Record<string, number> };
    walletsUpdate(updates: WalletUpdate[], updateLedger?: boolean): WalletUpdateResult[];
    walletLedgerList(userId: string, limit: number, cursor?: string): WalletLedgerList;

    // Leaderboard
    leaderboardCreate(id: string, authoritative: boolean, sortOrder?: string, operator?: string, resetSchedule?: string | null, metadata?: Record<string, unknown>): void;
    leaderboardDelete(id: string): void;
    leaderboardRecordWrite(id: string, owner: string, username?: string, score?: number, subscore?: number, metadata?: Record<string, unknown>): LeaderboardRecord;
    leaderboardRecordDelete(id: string, owner: string): void;
    leaderboardRecordsList(id: string, ownerIds?: string[], limit?: number, cursor?: string, expiry?: number): LeaderboardRecordList;

    // Notifications
    notificationSend(userId: string, subject: string, content: Record<string, unknown>, code: number, senderId?: string, persistent?: boolean): void;
    notificationsSend(notifications: NotificationSend[]): void;

    // Crypto / Util
    uuidV4(): string;
    httpRequest(url: string, method: string, headers?: Record<string, string>, body?: string): HttpResponse;

    // Session
    sessionLogout(userId: string, token: string, refreshToken: string): void;
  };

  type Account = {
    user: User;
    wallet: string;
    email: string;
    devices: AccountDevice[];
    customId: string;
    verifyTime: string;
    disableTime: string;
  };

  type User = {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    langTag: string;
    location: string;
    timezone: string;
    metadata: Record<string, unknown>;
    facebookId: string;
    googleId: string;
    gamecenterId: string;
    steamId: string;
    online: boolean;
    edgeCount: number;
    createTime: string;
    updateTime: string;
  };

  type AccountDevice = {
    id: string;
  };

  type FriendList = {
    friends: Friend[];
    cursor: string;
  };

  type Friend = {
    user: User;
    state: number;
    updateTime: string;
  };

  type StorageReadRequest = {
    collection: string;
    key: string;
    userId: string;
  };

  type StorageObject = {
    collection: string;
    key: string;
    userId: string;
    value: Record<string, unknown>;
    version: string;
    permissionRead: number;
    permissionWrite: number;
    createTime: string;
    updateTime: string;
  };

  type StorageWriteRequest = {
    collection: string;
    key: string;
    userId: string;
    value: Record<string, unknown>;
    version?: string;
    permissionRead?: number;
    permissionWrite?: number;
  };

  type StorageWriteAck = {
    collection: string;
    key: string;
    userId: string;
    version: string;
  };

  type StorageDeleteRequest = {
    collection: string;
    key: string;
    userId: string;
  };

  type WalletUpdate = {
    userId: string;
    changeset: Record<string, number>;
    metadata?: Record<string, unknown>;
  };

  type WalletUpdateResult = {
    updated: Record<string, number>;
    previous: Record<string, number>;
    userId: string;
  };

  type WalletLedgerList = {
    items: WalletLedgerItem[];
    cursor: string;
  };

  type WalletLedgerItem = {
    id: string;
    userId: string;
    changeset: Record<string, number>;
    metadata: Record<string, unknown>;
    createTime: string;
    updateTime: string;
  };

  type LeaderboardRecord = {
    leaderboardId: string;
    ownerId: string;
    username: string;
    score: number;
    subscore: number;
    numScore: number;
    metadata: Record<string, unknown>;
    createTime: string;
    updateTime: string;
    expiryTime: string;
    rank: number;
    maxNumScore: number;
  };

  type LeaderboardRecordList = {
    records: LeaderboardRecord[];
    ownerRecords: LeaderboardRecord[];
    nextCursor: string;
    prevCursor: string;
  };

  type NotificationSend = {
    userId: string;
    subject: string;
    content: Record<string, unknown>;
    code: number;
    senderId?: string;
    persistent?: boolean;
  };

  type HttpResponse = {
    code: number;
    headers: Record<string, string[]>;
    body: string;
  };

  type InitModule = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    initializer: Initializer,
  ) => void;
}
