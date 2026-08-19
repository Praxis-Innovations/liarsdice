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
  _nk: nkruntime.Nakama,
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

  logger.info("Liar's Dice server module initialized");
};

// Required by Nakama's esbuild bundle — must be in the global scope.
// @ts-expect-error — global assignment required by Nakama runtime loader.
globalThis.InitModule = InitModule;
