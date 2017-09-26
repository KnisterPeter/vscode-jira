import * as vscode from 'vscode';

import { createClient, Jira } from './api';

export function activate(context: vscode.ExtensionContext): void {

  const config = vscode.workspace.getConfiguration('jira');
  const baseUrl = config.get<string>('baseUrl');
  const projectNames = config.get('projectNames', '').split(',');

  if (baseUrl && projectNames.length > 0) {
    const jiraLinkProvider: vscode.DocumentLinkProvider = {
      provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentLink[] {
        return document.getText().split('\n')
          .reduce(
            (matches, line, no) => getMatchesOnLine(baseUrl, line, no, projectNames, matches),
            [] as vscode.DocumentLink[]
          );
      }
    };
    vscode.languages.registerDocumentLinkProvider('*', jiraLinkProvider);
  }

  let jira: Jira;
  if (baseUrl) {
    const credentials: string | undefined = context.globalState.get(`vscode-jira:${baseUrl}`);
    if (credentials) {
      const [username, password] = credentials.split('##');
      jira = createClient(baseUrl, username, password);
    }
  }

  vscode.commands.registerCommand('vscode-jira.setupCredentials', async() => {
    if (!baseUrl) {
      vscode.window.showInformationMessage('No JIRA client configured. Setup baseUrl first');
      return;
    }
    const username = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: 'Your JIRA username'
    });
    if (!username) {
      return;
    }
    const password = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      password: true,
      placeHolder: 'Your JIRA password'
    });
    if (!password) {
      return;
    }
    context.globalState.update(`vscode-jira:${baseUrl}`, `${username}##${password}`);
    jira = createClient(baseUrl, username, password);
  });
  vscode.commands.registerCommand('vscode-jira.browseMyIssues', async() => {
    if (!jira) {
      vscode.window.showInformationMessage(
        'No JIRA client configured. Setup baseUrl, projectNames, username and password');
      return;
    }
    const issues = await jira.search({
      jql: `project in (${projectNames.join(',')}) `
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
      const url = `${baseUrl}/browse/${selected.issue.key}`;
      await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }
  });
}

function getMatchesOnLine(baseUrl: string, line: string, lineNo: number, projectNames: string[],
    matches: vscode.DocumentLink[]): vscode.DocumentLink[] {
  projectNames.forEach(projectName => {
    const expr = new RegExp(`${projectName}-\\d+`, 'gi');
    let match;
    while (true) {
      match = expr.exec(line);
      if (match === null) {
        break;
      }
      const range = new vscode.Range(
        new vscode.Position(lineNo, match.index),
        new vscode.Position(lineNo, match.index + match[0].length)
      );
      matches.push({
        range,
        target: vscode.Uri.parse(`${baseUrl}/browse/${match[0]}`)
      });
    }
  });
  return matches;
}
