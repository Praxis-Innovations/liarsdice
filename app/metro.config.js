const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// framer-motion (moti peer dep) imports tslib/modules/index.js whose ESM
// default-import breaks under Metro's CJS interop. Redirect any request that
// resolves to that file back to the CJS tslib.js that Metro handles fine.
const origResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = origResolve
    ? (ctx, name, plat) => origResolve(ctx, name, plat)
    : (ctx, name, plat) => ctx.resolveRequest(ctx, name, plat);

  const result = resolve(context, moduleName, platform);

  if (
    result &&
    result.type === "sourceFile" &&
    result.filePath &&
    result.filePath.includes("tslib") &&
    result.filePath.endsWith(path.join("modules", "index.js"))
  ) {
    return {
      ...result,
      filePath: result.filePath.replace(
        path.join("modules", "index.js"),
        "tslib.js"
      ),
    };
  }

  return result;
};

module.exports = withNativeWind(config, { input: "./global.css" });
