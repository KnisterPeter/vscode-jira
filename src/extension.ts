import * as vscode from 'vscode';

import { createClient, Jira } from './api';
import { ActivateIssueCommand } from './commands/activate-issue';
import { BrowseMyIssuesCommand } from './commands/browse-my-issues';
import { ListMyIssuesCommand } from './commands/list-my-issues';
import { SetupCredentialsCommand } from './commands/setup-credentials';
import { TransitionIssueCommand } from './commands/transition-issue';
import { IssueLinkProvider } from './document-link-provider';
import state from './state';
import { StatusBarManager } from './status-bar';

export const CREDENTIALS_SEPARATOR = '##';

let context: vscode.ExtensionContext;
let baseUrl: string | undefined;

export function activate(_context: vscode.ExtensionContext): void {
  context = _context;
  state.workspaceState = context.workspaceState;

  const config = vscode.workspace.getConfiguration('jira');
  baseUrl = config.get<string>('baseUrl');
  const projectNames = config.get('projectNames', '').split(',');

  if (baseUrl) {
    if (projectNames.length > 0) {
      const jiraLinkProvider = new IssueLinkProvider(baseUrl, projectNames);
      vscode.languages.registerDocumentLinkProvider('*', jiraLinkProvider);
    }

    const credentials: string | undefined = context.globalState.get(`vscode-jira:${baseUrl}`);
    if (credentials) {
      const connect = async() => {
        const [username, password] = credentials.split(CREDENTIALS_SEPARATOR);
        state.jira = await connectToJira();
        state.update();
      };
      connect().catch(() => {
        vscode.window.showErrorMessage('Failed to connect to jira');
      });
    }
  }

  const commands = [
    new ActivateIssueCommand(),
    new BrowseMyIssuesCommand(baseUrl),
    new ListMyIssuesCommand(baseUrl, projectNames),
    new SetupCredentialsCommand(context, baseUrl),
    new TransitionIssueCommand()
  ];
  context.subscriptions.push(...commands.map(
    command => vscode.commands.registerCommand(command.id, command.run)));
  context.subscriptions.push(new StatusBarManager());
}

export async function connectToJira(): Promise<Jira | undefined> {
  const credentials: string | undefined = context.globalState.get(`vscode-jira:${baseUrl}`);
  if (credentials && baseUrl) {
    const [username, password] = credentials.split(CREDENTIALS_SEPARATOR);
    const client = createClient(baseUrl, username, password);
    const serverInfo = await client.serverInfo();
    if (serverInfo.versionNumbers[0] < 5) {
      vscode.window.showInformationMessage(
        `Unsupported JIRA version '${serverInfo.version}'. Must be at least 5.0.0`);
      return;
    }
    return client;
  }
}
