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
      const [username, password] = credentials.split(CREDENTIALS_SEPARATOR);
      state.jira = connectToJira();
    }
  }

  const setupCredentials = new SetupCredentialsCommand(context, baseUrl);
  vscode.commands.registerCommand(setupCredentials.id, setupCredentials.run);
  const browseMyIssues = new BrowseMyIssuesCommand(baseUrl, projectNames);
  vscode.commands.registerCommand(browseMyIssues.id, browseMyIssues.run);
}

export function connectToJira(): Jira | undefined {
  const credentials: string | undefined = context.globalState.get(`vscode-jira:${baseUrl}`);
  if (credentials && baseUrl) {
    const [username, password] = credentials.split(CREDENTIALS_SEPARATOR);
    return createClient(baseUrl, username, password);
  }
}
