import { createHmac } from "node:crypto";
import { Role } from "../enums/roleEnums";
import { env } from "../config/env";
import { UnauthorizedError } from "@/shared/errors/unauthorizedError";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
  iat: number;
  exp: number;
}

export interface JwtUserContext {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export class JwtService {
  sign(user: JwtUserContext): string {
    const header = { alg: "HS256", typ: "JWT" };
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + env.jwtExpiresInSeconds;

    const payload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
      iat,
      exp,
    };

    const headerPart = Buffer.from(JSON.stringify(header)).toString("base64url");
    const payloaPart = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const signature = createHmac("sha256", env.jwtSecret)
      .update(`${headerPart}.${payloaPart}`)
      .digest("base64url");

    return `${headerPart}.${payloaPart}.${signature}`;
  }

  verify(token: string): JwtPayload {
    const [headerPart, payloadPart, signaturePart] = token.split(".");

    if (!headerPart || !payloadPart || !signaturePart) {
      throw new UnauthorizedError("Token JWT invalid!");
    }

    const expectedSignature = createHmac("sha256", env.jwtSecret)
      .update(`${headerPart}.${payloadPart}`)
      .digest("base64url");

    if (expectedSignature !== signaturePart) {
      throw new UnauthorizedError("Signature token invalid");
    }

    const payload = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf-8"),
    ) as JwtPayload;

    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      throw new UnauthorizedError("Token expired");
    }

    return payload;
  }
}
