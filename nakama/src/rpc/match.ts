// RPCs for creating and joining Liar's Dice matches.

export const rpcCreateMatch: nkruntime.RpcFunction = (
  _ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string,
): string => {
  let name = "";
  let maxPlayers = 2;

  if (payload) {
    try {
      const p = JSON.parse(payload) as { name?: string; maxPlayers?: number };
      name = p.name ?? "";
      maxPlayers = Math.min(Math.max(p.maxPlayers ?? 2, 2), 6);
    } catch {
      logger.warn("rpcCreateMatch: invalid payload");
    }
  }

  const params: Record<string, string> = {
    maxPlayers: String(maxPlayers),
  };
  if (name) params["name"] = name;

  const matchId = nk.matchCreate("liarsdice", params);
  logger.info("Created match %s (max players: %d)", matchId, maxPlayers);
  return JSON.stringify({ matchId });
};

export const rpcJoinMatch: nkruntime.RpcFunction = (
  _ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  _nk: nkruntime.Nakama,
  payload: string,
): string => {
  if (!payload) {
    throw new Error("matchId is required");
  }
  let matchId = "";
  try {
    const p = JSON.parse(payload) as { matchId: string };
    matchId = p.matchId;
  } catch {
    throw new Error("Invalid payload — expected { matchId: string }");
  }
  logger.info("rpcJoinMatch: returning match ID %s to client", matchId);
  // The client joins via the socket joinMatch call; this RPC just validates/returns the ID.
  return JSON.stringify({ matchId });
};

export const rpcFindMatch: nkruntime.RpcFunction = (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string,
): string => {
  let maxPlayers = 2;
  if (payload) {
    try {
      const p = JSON.parse(payload) as { maxPlayers?: number };
      maxPlayers = Math.min(Math.max(p.maxPlayers ?? 2, 2), 6);
    } catch {
      // Use defaults.
    }
  }

  // Search for an open match with a compatible slot count.
  const query = `+label.open:true +label.maxPlayers:${maxPlayers}`;
  const matches = nk.matchList(10, true, null, 1, maxPlayers - 1, query);

  if (matches.length > 0) {
    const matchId = matches[0].matchId;
    logger.info("rpcFindMatch: joining existing match %s", matchId);
    return JSON.stringify({ matchId });
  }

  // No open match — create one.
  const params: Record<string, string> = { maxPlayers: String(maxPlayers) };
  const matchId = nk.matchCreate("liarsdice", params);
  logger.info("rpcFindMatch: created new match %s for user %s", matchId, ctx.userId);
  return JSON.stringify({ matchId });
};
