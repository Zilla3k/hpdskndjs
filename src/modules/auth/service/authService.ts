import { PasswordHasher } from "@/shared/security/password-hasher";
import { UserService } from "../../users/services/userService";
import { RegisterUserRequest } from "../../users/dto/registerUserRequest";
import { UserResponse } from "../../users/dto/userResponse";
import { LoginRequest } from "../../users/dto/loginRequest";
import { JwtService } from "@/shared/security/jwt";
import { UnauthorizedError } from "@/shared/errors/unauthorizedError";

export class AuthService {
  constructor(
    private readonly userService = new UserService(),
    private readonly passwordHasher = new PasswordHasher(),
    private readonly jwtService = new JwtService(),
  ) {}

  async register(
    request: RegisterUserRequest,
  ): Promise<{ user: UserResponse; accessToken: string }> {
    const existingUser = await this.userService.findByEmail(request.email);

    if (existingUser) {
      throw new Error("User already exists!");
    }

    const passwordHash = this.passwordHasher.hash(request.password);
    const user = await this.userService.create(request, passwordHash);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken: this.jwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }),
    };
  }

  async login(request: LoginRequest): Promise<{ user: UserResponse; accessToken: string }> {
    const user = await this.userService.findByEmail(request.email);

    if (!user) {
      throw new UnauthorizedError();
    }

    const passwordMatches = this.passwordHasher.compare(request.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedError();
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken: this.jwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }),
    };
  }
}
