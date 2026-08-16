import { prisma } from "@/shared/prisma/prisma";
import type { User } from "@/generated/prisma/client";
import { RegisterUserRequest } from "../dto/registerUserRequest";
import { DEFAULT_ROLE } from "@/shared/enums/roleEnums";

export class UserService {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(input: RegisterUserRequest, passwordHash: string): Promise<User> {
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role ?? DEFAULT_ROLE,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
