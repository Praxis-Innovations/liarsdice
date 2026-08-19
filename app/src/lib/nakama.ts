import { Client } from "@heroiclabs/nakama-js";
import { clientPublicEnv } from "../config/env";

export const nakamaClient = new Client(
  clientPublicEnv.nakamaServerKey,
  clientPublicEnv.nakamaHost,
  clientPublicEnv.nakamaPort,
  clientPublicEnv.nakamaUseSSL,
  7000,
  true,
);
