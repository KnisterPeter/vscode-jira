import { bind } from 'decko';
import * as vscode from 'vscode';

import { Issue, Transition } from '../api';
import { Command } from '../command';
import state, { ActiveIssue } from '../state';

export class TransitionIssueCommand implements Command {

  public id = 'vscode-jira.transitionIssues';

  @bind
  public async run(withDeactivation = true): Promise<void> {
    if (!state.jira) {
      vscode.window.showInformationMessage(
        'No JIRA client configured. Setup baseUrl, projectNames, username and password');
      return;
    }
    const activeIssue = this.getActiveIssue();
    if (activeIssue && activeIssue.key) {
      const selected = await this.selectTransition(withDeactivation, activeIssue);
      if (selected === null) {
        vscode.commands.executeCommand('vscode-jira.activateIssues', null);
      } else  if (selected !== undefined) {
        vscode.window.showInformationMessage(`Should exec transition ${selected.to.name}`);
      }
    }
  }

  private async selectTransition(withActivation: boolean, activeIssue: ActiveIssue):
      Promise<Transition | null | undefined> {
    if (!state.jira || !activeIssue.key) {
      return;
    }
    const transitions = await state.jira.getTransitions(activeIssue.key);
    const picks = transitions.transitions.map(transition => ({
      label: transition.to.name || transition.name,
      description: ``,
      transition
    }));
    if (withActivation) {
      picks.unshift({
        label: this.getDeactivationText(activeIssue),
        description: ``,
        transition: null as any
      });
    }
    const selected = await vscode.window.showQuickPick(picks,
      {
        placeHolder: `Select transition to execute for ${activeIssue.key}`,
        matchOnDescription: true
      }
    );
    return selected ? selected.transition : undefined;
  }

  private getDeactivationText(activeIssue: ActiveIssue): string {
    return `Deactivate ${activeIssue.key}`;
  }

  private getActiveIssue(): ActiveIssue | undefined {
    if (state.workspaceState) {
      return state.workspaceState.get('vscode-jira:active-issue');
    }
  }

}
