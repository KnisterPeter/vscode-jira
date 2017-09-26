import * as vscode from 'vscode';

import state, { ActiveIssue } from './state';

export class StatusBarManager {

  private item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    this.item.text = '$(issue-opened)';
    state.subscriber.push(() => {
      this.updateStatus();
    });
  }

  public updateStatus(): void {
    this.item.show();
    const activeIssue = this.getActiveIssue();
    if (activeIssue && activeIssue.key) {
      this.item.text = `$(issue-opened) ${activeIssue.key} ${activeIssue.status}`;
      this.item.tooltip = 'Click to transition issue...';
      this.item.command = 'vscode-jira.transitionIssues';
    } else {
      this.item.text = '$(issue-opened)';
      this.item.tooltip = 'Click to activate issue...';
      this.item.command = 'vscode-jira.activateIssues';
    }
  }

  private getActiveIssue(): ActiveIssue | undefined {
    if (state.workspaceState) {
      return state.workspaceState.get('vscode-jira:active-issue');
    }
  }

  public dispose(): void {
    this.item.dispose();
  }
}
