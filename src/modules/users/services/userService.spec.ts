import { DEFAULT_ROLE, RoleEnum } from "@/shared/enums/roleEnums";
import { prisma as prismaClient } from "@/shared/prisma/prisma";
import { UserService } from "./userService";
import type { User } from "@/generated/prisma/client";

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prismaClient as unknown as {
  $transaction: jest.Mock;
  user: {
    findMany: jest.Mock;
    count: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
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

  describe("list", () => {
    it("should return users ordered by creation date with pagination", async () => {
      const users = [createUser({ id: "user-1" }), createUser({ id: "user-2" })];
      mockPrisma.user.findMany.mockResolvedValue(users);
      mockPrisma.user.count.mockResolvedValue(2);
      mockPrisma.$transaction.mockResolvedValue([users, 2]);

      const result = await service.list();

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrisma.$transaction.mock.calls[0][0]).toHaveLength(2);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        skip: 0,
        take: 20,
      });
      expect(mockPrisma.user.count).toHaveBeenCalledWith();
      expect(result).toEqual({
        data: users,
        pagination: {
          page: 1,
          limit: 20,
          skip: 0,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it("should propagate an error when listing users fails", async () => {
      const expectedError = new Error("Database error on list");
      mockPrisma.$transaction.mockRejectedValue(expectedError);

      await expect(service.list()).rejects.toThrow("Database error on list");
    });
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

      await expect(service.findById("user-1")).rejects.toThrow("Database error on findById");
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

  describe("update", () => {
    it("should update a user", async () => {
      const user = createUser();
      const updatedUser = createUser({
        name: "Jane Doe",
        email: "jane.doe@email.com",
        role: RoleEnum.AGENT,
      });

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(user.id, {
        name: "Jane Doe",
        email: "jane.doe@email.com",
        role: RoleEnum.AGENT,
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          name: "Jane Doe",
          email: "jane.doe@email.com",
          role: RoleEnum.AGENT,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it("should throw when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update("missing-id", {
          name: "Jane Doe",
        }),
      ).rejects.toThrow("User not found");
    });

    it("should throw when email already exists", async () => {
      const user = createUser();
      const existingUser = createUser({
        id: "user-2",
        email: "jane.doe@email.com",
      });

      mockPrisma.user.findUnique.mockResolvedValueOnce(user).mockResolvedValueOnce(existingUser);

      await expect(
        service.update(user.id, {
          email: "jane.doe@email.com",
        }),
      ).rejects.toThrow("User already exists");
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      const user = createUser();

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.delete.mockResolvedValue(user);

      await service.delete(user.id);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it("should throw when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.delete("missing-id")).rejects.toThrow("User not found");
    });

    it("should propagate a dependency error when delete fails", async () => {
      const user = createUser();
      const error = Object.assign(new Error("Foreign key error"), {
        code: "P2003",
      });

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.delete.mockRejectedValue(error);

      await expect(service.delete(user.id)).rejects.toThrow(
        "User has related records and cannot be deleted",
      );
    });
  });
});
