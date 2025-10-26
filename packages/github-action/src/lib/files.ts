import * as glob from "@actions/glob";
import * as Command from "@effect/platform/Command";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as t from "@todone/types";
import * as Effect from "effect/Effect";
import { pipe, satisfies } from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import { sha } from "../input";

const cwd = process.cwd();

export interface GitHubFile
  extends Effect.Effect.Success<ReturnType<typeof makeGitHubFile>> {}

export declare namespace GitHubFile {
  type E = Stream.Stream.Error<GitHubFile["getContent"]>;
  type R = Stream.Stream.Context<GitHubFile["getContent"]>;
}

const makeGitHubFile = (localPath: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const location = localPath.startsWith(cwd)
      ? path.relative(cwd, localPath)
      : localPath;

    return satisfies<t.File<unknown, unknown>>()({
      location,
      getUrl(line?: number) {
        const basename = path.basename(localPath);
        const dirname = path.dirname(localPath);

        const commitArg = sha ? [`--commit=${sha}`] : [];
        const lineSuffix = line ? `:${line}` : "";

        return pipe(
          Command.make(
            "gh",
            "browse",
            basename + lineSuffix,
            "--no-browser",
            ...commitArg,
          ),
          Command.workingDirectory(dirname),
          Command.streamLines,
          Stream.runHead,
          Effect.map(Option.andThen(Schema.decodeOption(Schema.URL))),
        );
      },
      getContent: pipe(
        FileSystem.FileSystem,
        Stream.flatMap((fs) => fs.stream(localPath), { switch: true }),
      ),
    });
  });

export const makeFileStream = (globs: string) =>
  pipe(
    Effect.tryPromise(async () =>
      (await glob.create(globs, { matchDirectories: false })).globGenerator(),
    ),
    Stream.fromEffect,
    Stream.flatMap(
      (globber) =>
        Stream.fromAsyncIterable(
          globber,
          (error) => new Error("Globber failed", { cause: error }),
        ),
      { switch: true },
    ),
    Stream.mapEffect(makeGitHubFile),
  );
