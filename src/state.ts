import * as vscode from 'vscode';
import { Jira } from './api';

export interface State {
  jira?: Jira;
  workspaceState?: vscode.Memento;
  subscriber: (() => void)[];
  update(): void;
}

export interface ActiveIssue {
  key?: string;
}

const state: State = {
  subscriber: [],
  update(): void {
    this.subscriber.forEach(subscriber => subscriber());
  }
};

export default state;
