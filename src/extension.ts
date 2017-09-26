import * as vscode from 'vscode';

import { createClient, Jira } from './api';
import { BrowseMyIssuesCommand } from './commands/browse-my-issues';
import { SetupCredentialsCommand } from './commands/setup-credentials';
import { IssueLinkProvider } from './document-link-provider';
import state from './state';

export const CREDENTIALS_SEPARATOR = '##';

let context: vscode.ExtensionContext;
let baseUrl: string | undefined;

export function activate(_context: vscode.ExtensionContext): void {
  context = context;

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
      };
      connect().catch(() => {
        vscode.window.showErrorMessage('Failed to connect to jira');
      });
    }
  }

  const setupCredentials = new SetupCredentialsCommand(context, baseUrl);
  vscode.commands.registerCommand(setupCredentials.id, setupCredentials.run);
  const browseMyIssues = new BrowseMyIssuesCommand(baseUrl, projectNames);
  vscode.commands.registerCommand(browseMyIssues.id, browseMyIssues.run);
}

export async function connectToJira(): Promise<Jira | undefined> {
  const credentials: string | undefined = context.globalState.get(`vscode-jira:${baseUrl}`);
  if (credentials && baseUrl) {
    const [username, password] = credentials.split(CREDENTIALS_SEPARATOR);
    const client = createClient(baseUrl, username, password);
    const serverInfo = await client.serverInfo();
    if (serverInfo.versionNumbers[0] < 7) {
      vscode.window.showInformationMessage(
        `Unsupported JIRA version '${serverInfo.version}'. Must be at least 7.0.0`);
      return;
    }
    return client;
  }
}
