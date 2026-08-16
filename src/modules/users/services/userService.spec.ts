import { DEFAULT_ROLE, RoleEnum } from "@/shared/enums/roleEnums";
import { prisma as prismaClient } from "@/shared/prisma/prisma";
import { UserService } from "./userService";
import type { User } from "@/generated/prisma/client";

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prismaClient as unknown as {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@email.com",
    passwordHash: "hashed-password",
    role: RoleEnum.USER,
    createdAt: new Date("2026-08-16T00:00:00.000Z"),
    updatedAt: new Date("2026-08-16T00:00:00.000Z"),
    ...overrides,
  };
}

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  describe("findByEmail", () => {
    it("should find a user by email", async () => {
      const user = createUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail(user.email);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
      });
      expect(result).toEqual(user);
    });

    it("should return null when the user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail("missing@email.com");

      expect(result).toBeNull();
    });

    it("should propagate an error when finding by email fails", async () => {
      const expectedError = new Error("Database error on findByEmail");
      mockPrisma.user.findUnique.mockRejectedValue(expectedError);

      await expect(service.findByEmail("john.doe@email.com")).rejects.toThrow(
        "Database error on findByEmail",
      );
    });
  });

  describe("findById", () => {
    it("should find a user by id", async () => {
      const user = createUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findById(user.id);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(result).toEqual(user);
    });

    it("should return null when the id does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findById("missing-id");

      expect(result).toBeNull();
    });

    it("should propagate an error when finding by id fails", async () => {
      const expectedError = new Error("Database error on findById");
      mockPrisma.user.findUnique.mockRejectedValue(expectedError);

      await expect(service.findById("user-1")).rejects.toThrow(
        "Database error on findById",
      );
    });
  });

  describe("create", () => {
    it("should create a user with the default role when role is not provided", async () => {
      const input = {
        name: "John Doe",
        email: "john.doe@email.com",
        password: "123456",
      };
      const createdUser = createUser();

      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await service.create(input, "hashed-password");

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: "hashed-password",
          role: DEFAULT_ROLE,
        },
      });
      expect(result).toEqual(createdUser);
    });

    it("should create a user with the provided role", async () => {
      const input = {
        name: "John Doe",
        email: "john.doe@email.com",
        password: "123456",
        role: RoleEnum.AGENT,
      };
      const createdUser = createUser({ role: RoleEnum.AGENT });

      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await service.create(input, "hashed-password");

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: "hashed-password",
          role: RoleEnum.AGENT,
        },
      });
      expect(result).toEqual(createdUser);
    });

    it("should propagate an error when creation fails", async () => {
      const input = {
        name: "John Doe",
        email: "john.doe@email.com",
        password: "123456",
      };
      const expectedError = new Error("Database error on create");

      mockPrisma.user.create.mockRejectedValue(expectedError);

      await expect(service.create(input, "hashed-password")).rejects.toThrow(
        "Database error on create",
      );
    });
  });
});
