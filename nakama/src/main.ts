// Nakama server runtime entry point for Liar's Dice.
// Phase 1: initialization only. Match handler, RPCs, and economy hooks are added in Phase 2+.

const InitModule: nkruntime.InitModule = function (
  _ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  _nk: nkruntime.Nakama,
  _initializer: nkruntime.Initializer,
): void {
  logger.info("Liar's Dice server module initialized");
};
