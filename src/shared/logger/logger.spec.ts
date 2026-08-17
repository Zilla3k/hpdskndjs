import { logger } from "./logger";

describe("logger", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should redact sensitive values recursively", () => {
    const payload = logger.sanitizeValue({
      password: "secret",
      token: "abc",
      profile: {
        accessToken: "xyz",
        nested: {
          authorization: "Bearer test",
        },
      },
      list: [{ refreshToken: "refresh-value" }],
    });

    expect(payload).toEqual({
      password: "[REDACTED]",
      token: "[REDACTED]",
      profile: {
        accessToken: "[REDACTED]",
        nested: {
          authorization: "[REDACTED]",
        },
      },
      list: [{ refreshToken: "[REDACTED]" }],
    });
  });

  it("should log info messages as structured json", () => {
    logger.info("Server started", {
      port: 3333,
    });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    const rawMessage = consoleLogSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(rawMessage) as {
      level: string;
      message: string;
      port: number;
    };

    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("Server started");
    expect(parsed.port).toBe(3333);
  });

  it("should log error messages with console.error", () => {
    logger.error("Something failed", {
      code: "TEST_ERROR",
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });
});
