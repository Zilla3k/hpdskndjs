jest.mock("@/shared/config/env", () => ({
  env: {
    databaseUrl: "postgresql://user:password@localhost:5432/helpdesk",
    jwtSecret: "test-secret",
    jwtExpiresInSeconds: 3600,
  },
}));

import { RoleEnum } from "@/shared/enums/roleEnums";
import { UnauthorizedError } from "@/shared/errors/unauthorizedError";
import { JwtService } from "@/shared/security/jwt";
import { authenticateToken } from "./authMiddleware";

describe("authenticateToken", () => {
  it("should attach the decoded user to the request", () => {
    const token = new JwtService().sign({
      userId: "user-1",
      email: "john@example.com",
      role: RoleEnum.ADMIN,
      name: "John Doe",
    });

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = {};
    const next = jest.fn();

    authenticateToken(req as never, res as never, next);

    expect((req as { user?: unknown }).user).toEqual(
      expect.objectContaining({
        sub: "user-1",
        email: "john@example.com",
        role: RoleEnum.ADMIN,
        name: "John Doe",
      }),
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("should reject requests without authorization header", () => {
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();

    authenticateToken(req as never, res as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it("should reject requests with invalid bearer format", () => {
    const req = {
      headers: {
        authorization: "Token invalid-token",
      },
    };
    const res = {};
    const next = jest.fn();

    authenticateToken(req as never, res as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
