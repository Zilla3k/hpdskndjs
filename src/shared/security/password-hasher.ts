import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const ITERATIONS = 210_000;
const KEY_LENGTH = 32;
const DIGEST = "sha512";

function toBase64Url(value: Buffer) {
  return value.toString("base64").replaceAll("=", "").replaceAll("+", "-").replaceAll("/", "_");
}

function fromBase64Url(value: string): Buffer {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = 4 - (base64.length % 4 || 4);
  return Buffer.from(base64 + "=".repeat(padding % 4), "base64");
}

export class PasswordHasher {
  hash(password: string): string {
    const salt = randomBytes(16);
    const derivedKey = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);

    return [ITERATIONS, toBase64Url(salt), toBase64Url(derivedKey)].join("$");
  }

  compare(password: string, hashedPassword: string): boolean {
    const [iterationRaw, saltRaw, derivedKeyRaw] = hashedPassword.split("$");

    if (!iterationRaw || !saltRaw || !derivedKeyRaw) {
      return false;
    }

    const iterations = Number(iterationRaw);

    if (!Number.isInteger(iterations) || iterations <= 0) {
      return false;
    }

    const salt = fromBase64Url(saltRaw);
    const expectedKey = fromBase64Url(derivedKeyRaw);
    const actualKey = pbkdf2Sync(password, salt, iterations, expectedKey.length, DIGEST);

    if (actualKey.length !== expectedKey.length) {
      return false;
    }

    return timingSafeEqual(actualKey, expectedKey);
  }
}
