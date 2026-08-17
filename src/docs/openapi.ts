const uuidExample = "11111111-1111-1111-1111-111111111111";

const errorResponseSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: {
      type: "object",
      required: ["category", "code", "message"],
      properties: {
        category: {
          type: "string",
          enum: ["validation", "auth", "business", "internal"],
        },
        code: { type: "string" },
        message: { type: "string" },
      },
    },
  },
};

const paginationMetaSchema = {
  type: "object",
  required: ["page", "limit", "skip", "total", "totalPages"],
  properties: {
    page: { type: "integer", example: 1 },
    limit: { type: "integer", example: 20 },
    skip: { type: "integer", example: 0 },
    total: { type: "integer", example: 3 },
    totalPages: { type: "integer", example: 1 },
  },
};

const userSchema = {
  type: "object",
  required: ["id", "name", "email", "role", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", format: "uuid", example: uuidExample },
    name: { type: "string", example: "Henrique Pelanda" },
    email: { type: "string", format: "email", example: "henrique@email.com" },
    role: {
      type: "string",
      enum: ["ADMIN", "AGENT", "USER"],
      example: "ADMIN",
    },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const authResponseSchema = {
  type: "object",
  required: ["user", "accessToken"],
  properties: {
    user: userSchema,
    accessToken: {
      type: "string",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
  },
};

const paginationListSchema = {
  type: "object",
  required: ["data", "pagination"],
  properties: {
    data: {
      type: "array",
      items: userSchema,
    },
    pagination: paginationMetaSchema,
  },
};

const categorySchema = {
  type: "object",
  required: ["id", "name", "description", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", format: "uuid", example: uuidExample },
    name: { type: "string", example: "Support" },
    description: { type: "string", nullable: true, example: "Support related issues" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const prioritySchema = {
  type: "object",
  required: ["id", "name", "level", "description", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", format: "uuid", example: uuidExample },
    name: { type: "string", example: "High" },
    level: { type: "integer", example: 1 },
    description: { type: "string", nullable: true, example: "Requires immediate attention" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const ticketStatusEnum = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"];

const ticketSchema = {
  type: "object",
  required: [
    "id",
    "title",
    "description",
    "status",
    "categoryId",
    "priorityId",
    "createdById",
    "assignedToId",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string", format: "uuid", example: uuidExample },
    title: { type: "string", example: "Cannot access system" },
    description: { type: "string", example: "The user cannot access the app." },
    status: { type: "string", enum: ticketStatusEnum, example: "OPEN" },
    categoryId: { type: "string", format: "uuid", example: uuidExample },
    priorityId: { type: "string", format: "uuid", example: uuidExample },
    createdById: { type: "string", format: "uuid", example: uuidExample },
    assignedToId: { type: "string", format: "uuid", nullable: true, example: null },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const ticketListSchema = {
  type: "object",
  required: ["data", "pagination"],
  properties: {
    data: {
      type: "array",
      items: ticketSchema,
    },
    pagination: paginationMetaSchema,
  },
};

const dashboardOverviewSchema = {
  type: "object",
  required: ["totalTickets"],
  properties: {
    totalTickets: { type: "integer", example: 12 },
  },
};

const dashboardStatusSchema = {
  type: "object",
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: {
        type: "object",
        required: ["status", "count"],
        properties: {
          status: { type: "string", enum: ticketStatusEnum },
          count: { type: "integer" },
        },
      },
    },
  },
};

const dashboardPrioritySchema = {
  type: "object",
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name", "level", "count"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          level: { type: "integer" },
          count: { type: "integer" },
        },
      },
    },
  },
};

const dashboardPeriodSchema = {
  type: "object",
  required: ["range", "totalTickets", "data"],
  properties: {
    range: {
      type: "object",
      required: ["startDate", "endDate"],
      properties: {
        startDate: { type: "string", format: "date", example: "2026-08-01" },
        endDate: { type: "string", format: "date", example: "2026-08-17" },
      },
    },
    totalTickets: { type: "integer", example: 10 },
    data: {
      type: "array",
      items: {
        type: "object",
        required: ["date", "count"],
        properties: {
          date: { type: "string", format: "date" },
          count: { type: "integer" },
        },
      },
    },
  },
};

function jsonResponse(schema: object, example: unknown) {
  return {
    description: "Successful response",
    content: {
      "application/json": {
        schema,
        example,
      },
    },
  };
}

function errorResponse(status: number, example: unknown) {
  return {
    description: `HTTP ${status}`,
    content: {
      "application/json": {
        schema: errorResponseSchema,
        example,
      },
    },
  };
}

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Help Desk API",
    version: "1.0.0",
    description: "Backend API for help desk and ticket management.",
  },
  servers: [
    {
      url: "/api/v1",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Categories" },
    { name: "Priorities" },
    { name: "Tickets" },
    { name: "Dashboard" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: errorResponseSchema,
      PaginationMeta: paginationMetaSchema,
      User: userSchema,
      UserList: paginationListSchema,
      AuthResponse: authResponseSchema,
      Category: categorySchema,
      Priority: prioritySchema,
      Ticket: ticketSchema,
      TicketList: ticketListSchema,
      DashboardOverview: dashboardOverviewSchema,
      DashboardStatus: dashboardStatusSchema,
      DashboardPriority: dashboardPrioritySchema,
      DashboardPeriod: dashboardPeriodSchema,
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "API root",
        responses: {
          200: jsonResponse(
            {
              type: "object",
              required: ["message"],
              properties: {
                message: { type: "string", example: "Help Desk API is running" },
              },
            },
            {
              message: "Help Desk API is running",
            },
          ),
        },
      },
    },
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: jsonResponse(
            {
              type: "object",
              required: ["status", "timestamp"],
              properties: {
                status: { type: "string", example: "ok" },
                timestamp: { type: "string", format: "date-time" },
              },
            },
            {
              status: "ok",
              timestamp: "2026-08-17T09:00:00.000Z",
            },
          ),
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Henrique Pelanda" },
                  email: { type: "string", format: "email", example: "henrique@email.com" },
                  password: { type: "string", example: "12345678" },
                  role: { type: "string", enum: ["ADMIN", "AGENT", "USER"], example: "ADMIN" },
                },
              },
              example: {
                name: "Henrique Pelanda",
                email: "henrique@email.com",
                password: "12345678",
                role: "ADMIN",
              },
            },
          },
        },
        responses: {
          201: jsonResponse(authResponseSchema, {
            user: {
              id: uuidExample,
              name: "Henrique Pelanda",
              email: "henrique@email.com",
              role: "ADMIN",
              createdAt: "2026-08-17T09:00:00.000Z",
              updatedAt: "2026-08-17T09:00:00.000Z",
            },
            accessToken: "jwt-token",
          }),
          409: errorResponse(409, {
            error: {
              category: "business",
              code: "USER_ALREADY_EXISTS",
              message: "User already exists!",
            },
          }),
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive a JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "henrique@email.com" },
                  password: { type: "string", example: "12345678" },
                },
              },
              example: {
                email: "henrique@email.com",
                password: "12345678",
              },
            },
          },
        },
        responses: {
          200: jsonResponse(authResponseSchema, {
            user: {
              id: uuidExample,
              name: "Henrique Pelanda",
              email: "henrique@email.com",
              role: "ADMIN",
              createdAt: "2026-08-17T09:00:00.000Z",
              updatedAt: "2026-08-17T09:00:00.000Z",
            },
            accessToken: "jwt-token",
          }),
          401: errorResponse(401, {
            error: {
              category: "auth",
              code: "UNAUTHORIZED",
              message: "Credentials Invalid",
            },
          }),
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          200: jsonResponse(paginationListSchema, {
            data: [
              {
                id: uuidExample,
                name: "Henrique Pelanda",
                email: "henrique@email.com",
                role: "ADMIN",
                createdAt: "2026-08-17T09:00:00.000Z",
                updatedAt: "2026-08-17T09:00:00.000Z",
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              skip: 0,
              total: 1,
              totalPages: 1,
            },
          }),
        },
      },
    },
    "/users/{userId}": {
      get: {
        tags: ["Users"],
        summary: "Get user by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: jsonResponse(userSchema, {
            id: uuidExample,
            name: "Henrique Pelanda",
            email: "henrique@email.com",
            role: "ADMIN",
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:00:00.000Z",
          }),
          404: errorResponse(404, {
            error: {
              category: "business",
              code: "USER_NOT_FOUND",
              message: "User not found",
            },
          }),
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update a user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  name: { type: "string", minLength: 3 },
                  email: { type: "string", format: "email" },
                  role: { type: "string", enum: ["ADMIN", "AGENT", "USER"] },
                },
              },
              example: {
                name: "Henrique P",
                role: "AGENT",
              },
            },
          },
        },
        responses: {
          200: jsonResponse(userSchema, {
            id: uuidExample,
            name: "Henrique P",
            email: "henrique@email.com",
            role: "AGENT",
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:10:00.000Z",
          }),
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete a user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          204: {
            description: "No content",
          },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse(
            {
              type: "array",
              items: categorySchema,
            },
            [
              {
                id: uuidExample,
                name: "Support",
                description: "Support related issues",
                createdAt: "2026-08-17T09:00:00.000Z",
                updatedAt: "2026-08-17T09:00:00.000Z",
              },
            ],
          ),
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create category",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Support" },
                  description: { type: "string", example: "Support related issues" },
                },
              },
            },
          },
        },
        responses: {
          201: jsonResponse(categorySchema, {
            id: uuidExample,
            name: "Support",
            description: "Support related issues",
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:00:00.000Z",
          }),
        },
      },
    },
    "/categories/{categoryId}": {
      get: {
        tags: ["Categories"],
        summary: "Get category by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "categoryId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: jsonResponse(categorySchema, {
            id: uuidExample,
            name: "Support",
            description: "Support related issues",
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:00:00.000Z",
          }),
        },
      },
      patch: {
        tags: ["Categories"],
        summary: "Update category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "categoryId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  name: { type: "string", example: "Infrastructure" },
                  description: { type: "string", example: "Infrastructure incidents" },
                },
              },
            },
          },
        },
        responses: {
          200: jsonResponse(categorySchema, {
            id: uuidExample,
            name: "Infrastructure",
            description: "Infrastructure incidents",
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:10:00.000Z",
          }),
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "categoryId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          204: { description: "No content" },
        },
      },
    },
    "/priorities": {
      get: {
        tags: ["Priorities"],
        summary: "List priorities",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse(
            {
              type: "array",
              items: prioritySchema,
            },
            [
              {
                id: uuidExample,
                name: "High",
                level: 1,
                description: "Requires immediate attention",
                createdAt: "2026-08-17T09:00:00.000Z",
                updatedAt: "2026-08-17T09:00:00.000Z",
              },
            ],
          ),
        },
      },
      post: {
        tags: ["Priorities"],
        summary: "Create priority",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "level"],
                properties: {
                  name: { type: "string", example: "High" },
                  level: { type: "integer", example: 1 },
                  description: { type: "string", example: "Requires immediate attention" },
                },
              },
            },
          },
        },
        responses: {
          201: jsonResponse(prioritySchema, {
            id: uuidExample,
            name: "High",
            level: 1,
            description: "Requires immediate attention",
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:00:00.000Z",
          }),
        },
      },
    },
    "/priorities/{priorityId}": {
      get: {
        tags: ["Priorities"],
        summary: "Get priority by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "priorityId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: jsonResponse(prioritySchema, {
            id: uuidExample,
            name: "High",
            level: 1,
            description: "Requires immediate attention",
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:00:00.000Z",
          }),
        },
      },
      patch: {
        tags: ["Priorities"],
        summary: "Update priority",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "priorityId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  name: { type: "string", example: "Critical" },
                  level: { type: "integer", example: 1 },
                  description: { type: "string", example: "Critical incidents" },
                },
              },
            },
          },
        },
        responses: {
          200: jsonResponse(prioritySchema, {
            id: uuidExample,
            name: "Critical",
            level: 1,
            description: "Critical incidents",
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:10:00.000Z",
          }),
        },
      },
      delete: {
        tags: ["Priorities"],
        summary: "Delete priority",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "priorityId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          204: { description: "No content" },
        },
      },
    },
    "/tickets": {
      get: {
        tags: ["Tickets"],
        summary: "List tickets with filters",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "status", in: "query", schema: { type: "string", enum: ticketStatusEnum } },
          { name: "categoryId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "priorityId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "createdById", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "assignedToId", in: "query", schema: { type: "string", format: "uuid" } },
          {
            name: "sortBy",
            in: "query",
            schema: { type: "string", enum: ["createdAt", "status", "priority"] },
          },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          200: jsonResponse(ticketListSchema, {
            data: [
              {
                id: uuidExample,
                title: "Cannot access system",
                description: "The user cannot access the app.",
                status: "OPEN",
                categoryId: uuidExample,
                priorityId: uuidExample,
                createdById: uuidExample,
                assignedToId: null,
                createdAt: "2026-08-17T09:00:00.000Z",
                updatedAt: "2026-08-17T09:00:00.000Z",
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              skip: 0,
              total: 1,
              totalPages: 1,
            },
          }),
        },
      },
      post: {
        tags: ["Tickets"],
        summary: "Create ticket",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "categoryId", "priorityId", "createdById"],
                properties: {
                  title: { type: "string", example: "Cannot access system" },
                  description: { type: "string", example: "The user cannot access the app." },
                  categoryId: { type: "string", format: "uuid" },
                  priorityId: { type: "string", format: "uuid" },
                  createdById: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          201: jsonResponse(ticketSchema, {
            id: uuidExample,
            title: "Cannot access system",
            description: "The user cannot access the app.",
            status: "OPEN",
            categoryId: uuidExample,
            priorityId: uuidExample,
            createdById: uuidExample,
            assignedToId: null,
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:00:00.000Z",
          }),
        },
      },
    },
    "/tickets/{ticketId}/assign": {
      patch: {
        tags: ["Tickets"],
        summary: "Assign ticket",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["assignedToId", "assignedById"],
                properties: {
                  assignedToId: { type: "string", format: "uuid" },
                  assignedById: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          200: jsonResponse(ticketSchema, {
            id: uuidExample,
            title: "Cannot access system",
            description: "The user cannot access the app.",
            status: "OPEN",
            categoryId: uuidExample,
            priorityId: uuidExample,
            createdById: uuidExample,
            assignedToId: uuidExample,
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:00:00.000Z",
          }),
        },
      },
    },
    "/tickets/{ticketId}/unassign": {
      patch: {
        tags: ["Tickets"],
        summary: "Unassign ticket",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["unassignedById"],
                properties: {
                  unassignedById: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          200: jsonResponse(ticketSchema, {
            id: uuidExample,
            title: "Cannot access system",
            description: "The user cannot access the app.",
            status: "OPEN",
            categoryId: uuidExample,
            priorityId: uuidExample,
            createdById: uuidExample,
            assignedToId: null,
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:00:00.000Z",
          }),
        },
      },
    },
    "/tickets/{ticketId}/status": {
      patch: {
        tags: ["Tickets"],
        summary: "Update ticket status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["changedById", "status"],
                properties: {
                  changedById: { type: "string", format: "uuid" },
                  status: { type: "string", enum: ticketStatusEnum },
                },
              },
            },
          },
        },
        responses: {
          200: jsonResponse(ticketSchema, {
            id: uuidExample,
            title: "Cannot access system",
            description: "The user cannot access the app.",
            status: "IN_PROGRESS",
            categoryId: uuidExample,
            priorityId: uuidExample,
            createdById: uuidExample,
            assignedToId: null,
            createdAt: "2026-08-17T09:00:00.000Z",
            updatedAt: "2026-08-17T09:10:00.000Z",
          }),
        },
      },
    },
    "/tickets/{ticketId}/comments": {
      post: {
        tags: ["Tickets"],
        summary: "Comment on ticket",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "content"],
                properties: {
                  userId: { type: "string", format: "uuid" },
                  content: { type: "string", example: "Please help me with this issue." },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Comment created",
          },
        },
      },
    },
    "/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get ticket totals",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse(dashboardOverviewSchema, {
            totalTickets: 12,
          }),
        },
      },
    },
    "/dashboard/status": {
      get: {
        tags: ["Dashboard"],
        summary: "Get tickets by status",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse(dashboardStatusSchema, {
            data: ticketStatusEnum.map((status) => ({
              status,
              count: 0,
            })),
          }),
        },
      },
    },
    "/dashboard/priorities": {
      get: {
        tags: ["Dashboard"],
        summary: "Get tickets by priority",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse(dashboardPrioritySchema, {
            data: [
              {
                id: uuidExample,
                name: "High",
                level: 1,
                count: 0,
              },
            ],
          }),
        },
      },
    },
    "/dashboard/period": {
      get: {
        tags: ["Dashboard"],
        summary: "Get tickets by period",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "startDate",
            in: "query",
            required: true,
            schema: { type: "string", format: "date" },
          },
          {
            name: "endDate",
            in: "query",
            required: true,
            schema: { type: "string", format: "date" },
          },
        ],
        responses: {
          200: jsonResponse(dashboardPeriodSchema, {
            range: {
              startDate: "2026-08-01",
              endDate: "2026-08-17",
            },
            totalTickets: 10,
            data: [
              {
                date: "2026-08-01",
                count: 2,
              },
            ],
          }),
        },
      },
    },
  },
} as const;

export type OpenApiSpec = typeof openApiSpec;
