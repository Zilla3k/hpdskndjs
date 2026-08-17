import { RoleEnum } from "@/shared/enums/roleEnums";
import { UnauthorizedError } from "@/shared/errors/unauthorizedError";
import { AuthService } from "./authService";
import type { User } from "@/generated/prisma/client";

const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockPasswordHasher = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

jest.mock("../../users/services/userService", () => ({
  UserService: jest.fn().mockImplementation(() => mockUserService),
}));

jest.mock("@/shared/security/password-hasher", () => ({
  PasswordHasher: jest.fn().mockImplementation(() => mockPasswordHasher),
}));

jest.mock("@/shared/security/jwt", () => ({
  JwtService: jest.fn().mockImplementation(() => mockJwtService),
}));

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@email.com",
    passwordHash: "hashed-password",
    role: RoleEnum.USER,
    createdAt: new Date("2026-08-17T09:00:00.000Z"),
    updatedAt: new Date("2026-08-17T09:00:00.000Z"),
    ...overrides,
  };
}

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
  });

  describe("register", () => {
    it("should register a new user and return an access token", async () => {
      const input = {
        name: "John Doe",
        email: "john.doe@email.com",
        password: "12345678",
      };
      const user = createUser();

      mockUserService.findByEmail.mockResolvedValue(null);
      mockPasswordHasher.hash.mockReturnValue("hashed-password");
      mockUserService.create.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue("jwt-token");

      const result = await service.register(input);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(input.email);
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(input.password);
      expect(mockUserService.create).toHaveBeenCalledWith(input, "hashed-password");
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });
      expect(result).toEqual({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken: "jwt-token",
      });
    });

    it("should throw when the user already exists", async () => {
      mockUserService.findByEmail.mockResolvedValue(createUser());

      await expect(
        service.register({
          name: "John Doe",
          email: "john.doe@email.com",
          password: "12345678",
        }),
      ).rejects.toThrow("User already exists!");
    });
  });

  describe("login", () => {
    it("should login a user and return an access token", async () => {
      const input = {
        email: "john.doe@email.com",
        password: "12345678",
      };
      const user = createUser();

      mockUserService.findByEmail.mockResolvedValue(user);
      mockPasswordHasher.compare.mockReturnValue(true);
      mockJwtService.sign.mockReturnValue("jwt-token");

      const result = await service.login(input);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(input.email);
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(input.password, user.passwordHash);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });
      expect(result).toEqual({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken: "jwt-token",
      });
    });

    it("should throw UnauthorizedError when the user does not exist", async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: "missing@email.com",
          password: "12345678",
        }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("should throw UnauthorizedError when the password does not match", async () => {
      mockUserService.findByEmail.mockResolvedValue(createUser());
      mockPasswordHasher.compare.mockReturnValue(false);

      await expect(
        service.login({
          email: "john.doe@email.com",
          password: "wrong-password",
        }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });
});
