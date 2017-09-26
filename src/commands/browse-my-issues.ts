import { bind } from 'decko';
import * as vscode from 'vscode';

import { Issue } from '../api';
import { Command } from '../command';

export class BrowseMyIssuesCommand implements Command {

  public id = 'vscode-jira.browseMyIssues';

  private baseUrl: string | undefined;

  constructor(baseUrl: string | undefined) {
    this.baseUrl = baseUrl;
  }

  @bind
  public async run(): Promise<void> {
    const issue = await vscode.commands.executeCommand<Issue | undefined>('vscode-jira.listMyIssues', false);
    if (issue) {
      const url = `${this.baseUrl}/browse/${issue.key}`;
      await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }
  }

}
