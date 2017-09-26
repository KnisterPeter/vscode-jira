import { bind } from 'decko';
import * as vscode from 'vscode';

import { Issue } from '../api';
import { Command } from '../command';
import state, { ActiveIssue } from '../state';

export class ActivateIssueCommand implements Command {

  public id = 'vscode-jira.activateIssues';

  @bind
  public async run(): Promise<void> {
    const issue = await vscode.commands.executeCommand<Issue | undefined | null>('vscode-jira.listMyIssues', true);
    if (issue !== undefined && state.workspaceState) {
      const activeIssue: ActiveIssue = {
        key: issue ? issue.key : undefined
      };
      state.workspaceState.update('vscode-jira:active-issue', activeIssue);
      state.update();
    }
  }

}
