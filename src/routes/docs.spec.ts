import { buildSwaggerHtml } from "./docs";
import { openApiSpec } from "@/docs/openapi";

describe("docs", () => {
  it("should build swagger html with the OpenAPI url", () => {
    const html = buildSwaggerHtml("/api/v1/docs/openapi.json");

    expect(html).toContain("SwaggerUIBundle");
    expect(html).toContain("/api/v1/docs/openapi.json");
    expect(html).toContain("Help Desk API Docs");
  });

  it("should expose the OpenAPI specification with the expected paths", () => {
    expect(openApiSpec.openapi).toBe("3.0.3");
    expect(openApiSpec.info.title).toBe("Help Desk API");
    expect(openApiSpec.components?.securitySchemes?.bearerAuth).toEqual({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    });
    expect(Object.keys(openApiSpec.paths)).toEqual(
      expect.arrayContaining([
        "/auth/register",
        "/auth/login",
        "/users",
        "/tickets",
        "/dashboard",
      ]),
    );
  });
});
