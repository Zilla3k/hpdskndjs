import { ForbiddenError } from "@/shared/errors/forbiddenError";
import { RoleEnum } from "@/shared/enums/roleEnums";
import { authorizeRoles } from "./authorizeRoles";

describe("authorizeRoles", () => {
  it("should allow users with an allowed role", () => {
    const middleware = authorizeRoles(RoleEnum.ADMIN, RoleEnum.AGENT);
    const req = {
      user: {
        role: RoleEnum.ADMIN,
      },
    };
    const res = {};
    const next = jest.fn();

    middleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should reject users without a role", () => {
    const middleware = authorizeRoles(RoleEnum.ADMIN);
    const req = {};
    const res = {};
    const next = jest.fn();

    middleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it("should reject users with a forbidden role", () => {
    const middleware = authorizeRoles(RoleEnum.ADMIN);
    const req = {
      user: {
        role: RoleEnum.USER,
      },
    };
    const res = {};
    const next = jest.fn();

    middleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});
