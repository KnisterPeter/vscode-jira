import { bind } from 'decko';
import * as vscode from 'vscode';

import { createClient } from '../api';
import { Command } from '../command';
import state from '../state';

export class BrowseMyIssuesCommand implements Command {

  public id = 'vscode-jira.browseMyIssues';

  private baseUrl: string | undefined;

  private projectNames: string[] | undefined;

  constructor(baseUrl: string | undefined, projectNames: string[] | undefined) {
    this.baseUrl = baseUrl;
    this.projectNames = projectNames;
  }

  @bind
  public async run(): Promise<void> {
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
    const selected = await vscode.window.showQuickPick(picks, {
      matchOnDescription: true,
      matchOnDetail: true
    });
    if (selected) {
      const url = `${this.baseUrl}/browse/${selected.issue.key}`;
      await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }
  }

}
