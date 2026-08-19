import {
  matchInit,
  matchJoinAttempt,
  matchJoin,
  matchLeave,
  matchLoop,
  matchSignal,
  matchTerminate,
} from "./match_handler";
import { rpcCreateMatch, rpcFindMatch, rpcJoinMatch } from "./rpc/match";

const InitModule: nkruntime.InitModule = function (
  _ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer,
): void {
  initializer.registerMatch("liarsdice", {
    matchInit,
    matchJoinAttempt,
    matchJoin,
    matchLeave,
    matchLoop,
    matchSignal,
    matchTerminate,
  });

  initializer.registerRpc("create_match", rpcCreateMatch);
  initializer.registerRpc("join_match", rpcJoinMatch);
  initializer.registerRpc("find_match", rpcFindMatch);

  // Create the win-count leaderboard if it doesn't already exist.
  try {
    nk.leaderboardCreate("liarsdice_wins", false, "desc", "incr", null, {});
    logger.info("Leaderboard 'liarsdice_wins' ready");
  } catch {
    // Already exists — safe to ignore.
  }

  logger.info("Liar's Dice server module initialized");
};

// Required by Nakama's esbuild bundle — must be in the global scope.
// @ts-expect-error — global assignment required by Nakama runtime loader.
globalThis.InitModule = InitModule;
