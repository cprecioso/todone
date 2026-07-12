import { Octokit, RequestError } from "octokit";
import { CheckerResult } from "todone/plugin";

const maybeDate = (date: string | null): Date | undefined =>
  (date && new Date(date)) || undefined;

const isNotFound = (error: unknown): boolean =>
  error instanceof RequestError && error.status === 404;

export const makeResourceFetchers = (githubToken?: string) => {
  const client = new Octokit(githubToken ? { auth: githubToken } : {});

  return {
    issues: async (repo, issue_number: number) => {
      const { data } = await client.rest.issues.get({ ...repo, issue_number });

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at),
      };
    },

    pull: async (repo, pull_number: number) => {
      const { data } = await client.rest.pulls.get({ ...repo, pull_number });

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at),
      };
    },

    milestone: async (repo, milestone_number: number) => {
      const { data } = await client.rest.issues.getMilestone({
        ...repo,
        milestone_number,
      });

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at) || maybeDate(data.due_on),
      };
    },

    release: async (repo, tag: string) => {
      try {
        const { data } = await client.rest.repos.getReleaseByTag({
          ...repo,
          tag,
        });

        return {
          title: data.name || data.tag_name,
          isExpired: true,
          expirationDate:
            maybeDate(data.published_at) || maybeDate(data.created_at),
        };
      } catch (error) {
        if (!isNotFound(error)) throw error;
      }

      // A tag can exist without a release object (a plain git tag), but its
      // web URL is still `/releases/tag/:tag`.
      try {
        await client.rest.git.getRef({ ...repo, ref: `tags/${tag}` });
        return { title: tag, isExpired: true };
      } catch (error) {
        if (!isNotFound(error)) throw error;
      }

      // Neither exists yet: the TODO is waiting for a future release/tag.
      return { title: tag, isExpired: false };
    },
  } as const satisfies Record<
    string,
    (
      repo: { owner: string; repo: string },
      key: never,
    ) => Promise<CheckerResult>
  >;
};
