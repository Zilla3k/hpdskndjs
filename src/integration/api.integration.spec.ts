jest.mock("@/shared/config/env", () => ({
  env: {
    databaseUrl: "postgresql://user:password@localhost:5432/helpdesk",
    jwtSecret: "test-secret",
    jwtExpiresInSeconds: 3600,
  },
}));

jest.mock("@/shared/prisma/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    priority: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    ticket: {
      create: jest.fn(),
    },
    ticketHistory: {
      create: jest.fn(),
    },
  },
}));

import request from "supertest";
import createApp from "@/app";
import { RoleEnum } from "@/shared/enums/roleEnums";
import { PasswordHasher } from "@/shared/security/password-hasher";
import { prisma as prismaClient } from "@/shared/prisma/prisma";

type MockUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: (typeof RoleEnum)[keyof typeof RoleEnum];
  createdAt: Date;
  updatedAt: Date;
};

type MockCategory = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type MockPriority = {
  id: string;
  name: string;
  level: number;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type MockTicket = {
  id: string;
  title: string;
  description: string;
  status: "OPEN";
  categoryId: string;
  priorityId: string;
  createdById: string;
  assignedToId: null;
  createdAt: Date;
  updatedAt: Date;
};

const mockPrisma = prismaClient as unknown as {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  category: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  priority: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  ticket: {
    create: jest.Mock;
  };
  ticketHistory: {
    create: jest.Mock;
  };
};

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "33333333-3333-4333-8333-333333333333";
const CATEGORY_ID = "44444444-4444-4444-8444-444444444444";
const PRIORITY_ID = "55555555-5555-4555-8555-555555555555";
const TICKET_ID = "66666666-6666-4666-8666-666666666666";
const FIXED_DATE = new Date("2026-08-17T09:00:00.000Z");

describe("API integration", () => {
  const app = createApp();
  const passwordHasher = new PasswordHasher();

  let registeredUser: MockUser | null;
  let createdCategory: MockCategory | null;
  let createdPriority: MockPriority | null;
  let createdTicket: MockTicket | null;

  beforeEach(() => {
    jest.clearAllMocks();
    registeredUser = null;
    createdCategory = null;
    createdPriority = null;
    createdTicket = null;

    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    mockPrisma.user.findUnique.mockImplementation(
      async ({ where }: { where: { email?: string; id?: string } }) => {
        if (where.email) {
          return registeredUser && registeredUser.email === where.email ? registeredUser : null;
        }

        if (where.id) {
          return registeredUser && registeredUser.id === where.id ? registeredUser : null;
        }

        return null;
      },
    );

    mockPrisma.user.create.mockImplementation(
      async ({
        data,
      }: {
        data: { name: string; email: string; passwordHash: string; role: MockUser["role"] };
      }) => {
        registeredUser = {
          id: ADMIN_ID,
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
          createdAt: FIXED_DATE,
          updatedAt: FIXED_DATE,
        };

        return registeredUser;
      },
    );

    mockPrisma.category.findUnique.mockImplementation(
      async ({ where }: { where: { id?: string; name?: string } }) => {
        if (where.name) {
          return createdCategory && createdCategory.name === where.name ? createdCategory : null;
        }

        if (where.id) {
          return createdCategory && createdCategory.id === where.id ? createdCategory : null;
        }

        return null;
      },
    );

    mockPrisma.category.create.mockImplementation(
      async ({ data }: { data: { name: string; description?: string } }) => {
        createdCategory = {
          id: CATEGORY_ID,
          name: data.name,
          description: data.description,
          createdAt: FIXED_DATE,
          updatedAt: FIXED_DATE,
        };

        return createdCategory;
      },
    );

    mockPrisma.priority.findUnique.mockImplementation(
      async ({ where }: { where: { id?: string; name?: string; level?: number } }) => {
        if (where.name) {
          return createdPriority && createdPriority.name === where.name ? createdPriority : null;
        }

        if (typeof where.level === "number") {
          return createdPriority && createdPriority.level === where.level ? createdPriority : null;
        }

        if (where.id) {
          return createdPriority && createdPriority.id === where.id ? createdPriority : null;
        }

        return null;
      },
    );

    mockPrisma.priority.create.mockImplementation(
      async ({ data }: { data: { name: string; level: number; description?: string } }) => {
        createdPriority = {
          id: PRIORITY_ID,
          name: data.name,
          level: data.level,
          description: data.description,
          createdAt: FIXED_DATE,
          updatedAt: FIXED_DATE,
        };

        return createdPriority;
      },
    );

    mockPrisma.ticket.create.mockImplementation(
      async ({
        data,
      }: {
        data: {
          title: string;
          description: string;
          categoryId: string;
          priorityId: string;
          createdById: string;
        };
      }) => {
        createdTicket = {
          id: TICKET_ID,
          title: data.title,
          description: data.description,
          status: "OPEN",
          categoryId: data.categoryId,
          priorityId: data.priorityId,
          createdById: data.createdById,
          assignedToId: null,
          createdAt: FIXED_DATE,
          updatedAt: FIXED_DATE,
        };

        return createdTicket;
      },
    );

    mockPrisma.ticketHistory.create.mockResolvedValue({
      id: "history-1",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should complete the authentication flow and allow protected ticket creation", async () => {
    const registerResponse = await request(app).post("/api/v1/auth/register").send({
      name: "Henrique Pelanda",
      email: "henrique@email.com",
      password: "12345678",
      role: RoleEnum.ADMIN,
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user).toEqual({
      id: ADMIN_ID,
      name: "Henrique Pelanda",
      email: "henrique@email.com",
      role: RoleEnum.ADMIN,
      createdAt: FIXED_DATE.toISOString(),
      updatedAt: FIXED_DATE.toISOString(),
    });
    expect(registerResponse.body.accessToken).toEqual(expect.any(String));

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "henrique@email.com",
      password: "12345678",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toEqual(expect.any(String));

    const token = loginResponse.body.accessToken as string;

    const categoryResponse = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Support",
        description: "Support related issues",
      });

    expect(categoryResponse.status).toBe(201);
    expect(categoryResponse.body).toEqual({
      id: CATEGORY_ID,
      name: "Support",
      description: "Support related issues",
      createdAt: FIXED_DATE.toISOString(),
      updatedAt: FIXED_DATE.toISOString(),
    });

    const priorityResponse = await request(app)
      .post("/api/v1/priorities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "High",
        level: 1,
        description: "Requires immediate attention",
      });

    expect(priorityResponse.status).toBe(201);
    expect(priorityResponse.body).toEqual({
      id: PRIORITY_ID,
      name: "High",
      level: 1,
      description: "Requires immediate attention",
      createdAt: FIXED_DATE.toISOString(),
      updatedAt: FIXED_DATE.toISOString(),
    });

    const ticketResponse = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Cannot access system",
        description: "The user cannot access the app.",
        categoryId: CATEGORY_ID,
        priorityId: PRIORITY_ID,
        createdById: ADMIN_ID,
      });

    expect(ticketResponse.status).toBe(201);
    expect(ticketResponse.body).toEqual({
      id: TICKET_ID,
      title: "Cannot access system",
      description: "The user cannot access the app.",
      status: "OPEN",
      categoryId: CATEGORY_ID,
      priorityId: PRIORITY_ID,
      createdById: ADMIN_ID,
      assignedToId: null,
      createdAt: FIXED_DATE.toISOString(),
      updatedAt: FIXED_DATE.toISOString(),
    });
  });

  it("should return a validation error for an invalid ticket payload", async () => {
    await request(app).post("/api/v1/auth/register").send({
      name: "Henrique Pelanda",
      email: "henrique@email.com",
      password: "12345678",
      role: RoleEnum.ADMIN,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "henrique@email.com",
      password: "12345678",
    });

    const response = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
      .send({
        title: "Cannot access system",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        category: "validation",
        code: "VALIDATION_ERROR",
        message: "Invalid input: expected string, received undefined",
      },
    });
  });

  it("should reject protected routes without a token", async () => {
    const response = await request(app).get("/api/v1/tickets");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        category: "auth",
        code: "UNAUTHORIZED",
        message: "Authorization header is required",
      },
    });
  });

  it("should reject category creation for non-admin users", async () => {
    const passwordHash = passwordHasher.hash("12345678");
    registeredUser = {
      id: USER_ID,
      name: "Henrique Pelanda",
      email: "henrique@email.com",
      passwordHash,
      role: RoleEnum.USER,
      createdAt: FIXED_DATE,
      updatedAt: FIXED_DATE,
    };

    const token = (
      await request(app).post("/api/v1/auth/login").send({
        email: "henrique@email.com",
        password: "12345678",
      })
    ).body.accessToken as string;

    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Infrastructure",
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        category: "auth",
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource",
      },
    });
  });
});
