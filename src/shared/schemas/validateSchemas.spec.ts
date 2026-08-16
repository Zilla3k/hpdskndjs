import { z } from "zod";
import { AppError } from "@/shared/errors/appError";
import { validateSchema } from "./validateSchemas";

describe("validateSchema", () => {
  const schema = z.object({
    name: z.string(),
    age: z.number().int(),
  });

  it("should return parsed data when payload is valid", () => {
    const result = validateSchema(schema, {
      name: "John",
      age: 30,
    });

    expect(result).toEqual({
      name: "John",
      age: 30,
    });
  });

  it("should throw AppError when payload is invalid", () => {
    expect(() =>
      validateSchema(schema, {
        name: "John",
        age: "30",
      }),
    ).toThrow(AppError);

    expect(() =>
      validateSchema(schema, {
        name: "John",
        age: "30",
      }),
    ).toThrow("Invalid input: expected number, received string");
  });
});
