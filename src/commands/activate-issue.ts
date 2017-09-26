import { bind } from 'decko';
import * as vscode from 'vscode';

import { Issue } from '../api';
import { Command } from '../command';
import state, { ActiveIssue } from '../state';

export class ActivateIssueCommand implements Command {

  public id = 'vscode-jira.activateIssues';

  @bind
  public async run(preselected: Issue | null): Promise<void> {
    const issue = await this.selectIssue(preselected);
    if (issue !== undefined && state.workspaceState) {
      const activeIssue: ActiveIssue = {
        key: issue ? issue.key : undefined,
        status: issue ? issue.fields.status.name : undefined
      };
      state.workspaceState.update('vscode-jira:active-issue', activeIssue);
      state.update();
    }
  }

  private async selectIssue(preselected: Issue | null): Promise<Issue | null | undefined> {
    if (preselected || preselected === null) {
      return preselected;
    }
    const activateIssue = this.getActiveIssue();
    const name = activateIssue && activateIssue.key
      ? `Deactivate ${activateIssue.key}`
      : undefined;
    return await vscode.commands.executeCommand<Issue | undefined | null>('vscode-jira.listMyIssues', name);
  }

  private getActiveIssue(): ActiveIssue | undefined {
    if (state.workspaceState) {
      return state.workspaceState.get('vscode-jira:active-issue');
    }
  }
}
