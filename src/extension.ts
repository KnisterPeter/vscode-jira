import * as vscode from 'vscode';

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
