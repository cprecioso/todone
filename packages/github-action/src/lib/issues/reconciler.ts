import * as t from "@todone/types";
import { IssueData } from "./issue-data";

export enum IssueAction {
  Create = "create",
  Update = "update",
  CloseCompleted = "close-completed",
  CloseInvalid = "close-invalid",
}

type CurrentIssue = { number: number };
type ReconcilerInitialItem = { issue: CurrentIssue; issueData: IssueData };

export class Reconciler {
  #reconciledUrls = new Set<string>();
  #currentIssues;

  constructor(currentIssues: Iterable<ReconcilerInitialItem>) {
    this.#currentIssues = new Map<string, ReconcilerInitialItem>(
      Iterator.from(currentIssues).map((item) => [
        item.issueData.todoUrl,
        item,
      ]),
    );
  }

  reconcileResult(result: t.Result<t.File>) {
    const urlString = result.url.toString();
    this.#reconciledUrls.add(urlString);

    const currentIssue = this.#currentIssues.get(urlString);
    if (currentIssue) {
      return {
        action: IssueAction.Update,
        number: currentIssue.issue.number,
      } as const;
    } else {
      return {
        action: IssueAction.Create,
      } as const;
    }
  }

  getOrphanedIssues() {
    const notSeenIssues = this.#currentIssues
      .entries()
      .filter(([url]) => !this.#reconciledUrls.has(url));

    return notSeenIssues.map(([url, { issue }]) => ({
      number: issue.number,
      url,
    }));
  }
}
