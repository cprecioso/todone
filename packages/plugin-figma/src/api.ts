import * as HttpApi from "@effect/platform/HttpApi";
import * as HttpApiClient from "@effect/platform/HttpApiClient";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as pkg from "../package.json" with { type: "json" };

const FigmaApi = HttpApi.make("FigmaApi").add(
  HttpApiGroup.make("Files").add(
    HttpApiEndpoint.get(
      "GetComments",
    )`/file/${HttpApiSchema.param("fileID", Schema.String)}/comments`.addSuccess(
      Schema.Struct({
        comments: Schema.optional(
          Schema.Array(
            Schema.Struct({
              id: Schema.String,
              resolved_at: Schema.optional(Schema.DateFromString),
              user: Schema.Struct({
                handle: Schema.String,
              }),
            }),
          ),
        ),
      }),
    ),
  ),
);

export class Figma extends Effect.Service<Figma>()(`${pkg.name}/Figma`, {
  effect: Effect.andThen(
    Config.redacted(Config.string("FIGMA_TOKEN")),
    (token) =>
      HttpApiClient.make(FigmaApi, {
        baseUrl: "https://api.figma.com/v1",
        transformClient: HttpClient.mapRequest(
          HttpClientRequest.setHeader("X-FIGMA-TOKEN", Redacted.value(token)),
        ),
      }),
  ),
}) {}
