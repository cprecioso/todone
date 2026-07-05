import * as z from "zod";

const GetCommentsResponse = z.object({
  comments: z
    .array(
      z.object({
        id: z.string(),
        resolved_at: z.coerce.date().optional(),
        user: z.object({ handle: z.string() }),
      }),
    )
    .optional(),
});

const BASE_URL = "https://api.figma.com/v1";

export const createFigmaApi = (figmaToken: string) => ({
  Files: {
    GetComments: async ({ path }: { path: { fileID: string } }) => {
      const response = await fetch(
        `${BASE_URL}/file/${encodeURIComponent(path.fileID)}/comments`,
        { headers: { "X-FIGMA-TOKEN": figmaToken } },
      );

      if (!response.ok) {
        throw new Error(
          `Figma API request failed: ${response.status} ${response.statusText}`,
        );
      }

      return GetCommentsResponse.parse(await response.json());
    },
  },
});
