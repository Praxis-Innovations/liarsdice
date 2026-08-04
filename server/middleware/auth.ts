/**
 * Express middleware: require a valid Supabase JWT and attach req.userId.
 */
import type { Response, NextFunction } from "express";
import { verifyTokenWithFallback } from "../auth";
import type { AuthenticatedRequest } from "../types";

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token =
    req.headers.authorization ||
    (req.body && req.body.access_token) ||
    (req.query && (req.query.access_token as string));

  verifyTokenWithFallback(token)
    .then((result) => {
      if (!result) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      req.userId = result.userId;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: "Unauthorized" });
    });
}
