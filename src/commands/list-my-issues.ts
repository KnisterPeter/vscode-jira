import { bind } from 'decko';
import * as vscode from 'vscode';

import { Issue } from '../api';
import { Command } from '../command';
import state from '../state';

export class ListMyIssuesCommand implements Command<Issue | undefined | null> {

  public id = 'vscode-jira.listMyIssues';

  private baseUrl: string | undefined;

  private projectNames: string[] | undefined;

  constructor(baseUrl: string | undefined, projectNames: string[] | undefined) {
    this.baseUrl = baseUrl;
    this.projectNames = projectNames;
  }

  @bind
  public async run(withEmpty: string): Promise<Issue | undefined | null> {
    if (!state.jira || !this.baseUrl || !this.projectNames) {
      vscode.window.showInformationMessage(
        'No JIRA client configured. Setup baseUrl, projectNames, username and password');
      return;
    }
    const issues = await state.jira.search({
      jql: `project in (${this.projectNames.join(',')}) `
        + 'AND resolution = Unresolved AND assignee in (currentUser()) ORDER BY updated DESC'
    });
    const picks = issues.issues.map(issue => {
      return {
        issue,
        label: issue.key,
        description: issue.fields.summary,
        detail: issue.fields.description
      };
    });
    if (withEmpty) {
      picks.unshift({
        issue: null as any,
        label: withEmpty,
        description: '',
        detail: undefined
      });
    }
    const selected = await vscode.window.showQuickPick(picks, {
      matchOnDescription: true,
      matchOnDetail: true,
      placeHolder: 'Select an issue'
    });
    if (selected) {
      return selected.issue;
    }
  }

}
