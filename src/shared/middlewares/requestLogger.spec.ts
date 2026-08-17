import { requestLogger } from "./requestLogger";
import type { Response } from "express";

describe("requestLogger", () => {
  it("should register a finish handler and log the request", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    let finishHandler: (() => void) | undefined;

    const req = {
      method: "POST",
      baseUrl: "/api/v1",
      path: "/auth/login",
      ip: "127.0.0.1",
      query: {
        email: "john@example.com",
        password: "secret",
      },
    };

    const res: Pick<Response, "on" | "statusCode"> = {
      statusCode: 200,
      on: jest.fn((event: string, handler: () => void) => {
        if (event === "finish") {
          finishHandler = handler;
        }
        return res as Response;
      }),
    };

    const next = jest.fn();

    requestLogger(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));

    finishHandler?.();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    const rawMessage = consoleLogSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(rawMessage) as {
      message: string;
      method: string;
      path: string;
      statusCode: number;
      ip: string;
      query: { email: string; password: string };
    };

    expect(parsed.message).toBe("HTTP request completed");
    expect(parsed.method).toBe("POST");
    expect(parsed.path).toBe("/api/v1/auth/login");
    expect(parsed.statusCode).toBe(200);
    expect(parsed.ip).toBe("127.0.0.1");
    expect(parsed.query).toEqual({
      email: "john@example.com",
      password: "[REDACTED]",
    });

    consoleLogSpy.mockRestore();
  });
});
