import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import figmaPlugin from "../src/index";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const context = () => ({ warn: vi.fn(), info: vi.fn(), debug: vi.fn() });

const check = (url: string) =>
  figmaPlugin({ token: "test-token" }).checkMatch!.call(context(), {
    url: new URL(url),
  });

const commentsUrl = "https://api.figma.com/v1/file/:fileID/comments";

describe("figmaPlugin against the Figma API", () => {
  it("sends the token and treats a resolved comment as expired", async () => {
    let token: string | null = null;
    server.use(
      http.get(commentsUrl, ({ request, params }) => {
        token = request.headers.get("x-figma-token");
        expect(params["fileID"]).toBe("abc123");
        return HttpResponse.json({
          comments: [
            {
              id: "42",
              resolved_at: "2020-05-06T07:08:09Z",
              user: { handle: "designer" },
            },
          ],
        });
      }),
    );

    await expect(check("https://figma.com/file/abc123#42")).resolves.toEqual({
      title: "Figma comment from designer",
      isExpired: true,
      expirationDate: new Date("2020-05-06T07:08:09Z"),
    });
    expect(token).toBe("test-token");
  });

  it("treats an unresolved comment as not expired", async () => {
    server.use(
      http.get(commentsUrl, () =>
        HttpResponse.json({
          comments: [{ id: "42", user: { handle: "designer" } }],
        }),
      ),
    );

    await expect(check("https://figma.com/file/abc123#42")).resolves.toEqual({
      title: "Figma comment from designer",
      isExpired: false,
      expirationDate: undefined,
    });
  });

  it("fails when the comment does not exist", async () => {
    server.use(
      http.get(commentsUrl, () =>
        HttpResponse.json({
          comments: [{ id: "1", user: { handle: "designer" } }],
        }),
      ),
    );

    await expect(check("https://figma.com/file/abc123#42")).rejects.toThrow(
      "Comment not found: 42",
    );
  });

  it("fails when the file has no comments payload", async () => {
    server.use(http.get(commentsUrl, () => HttpResponse.json({})));

    await expect(check("https://figma.com/file/abc123#42")).rejects.toThrow(
      "File not found: abc123",
    );
  });

  it("surfaces HTTP errors from the API", async () => {
    server.use(
      http.get(
        commentsUrl,
        () => new HttpResponse(null, { status: 403, statusText: "Forbidden" }),
      ),
    );

    await expect(check("https://figma.com/file/abc123#42")).rejects.toThrow(
      "Figma API request failed: 403 Forbidden",
    );
  });
});
