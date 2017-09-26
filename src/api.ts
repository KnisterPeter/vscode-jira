import { Pretend, Get, Post } from 'pretend';

export interface Jira {
  serverInfo(): Promise<ServerInfo>;
  search(params: {jql: string}): Promise<Issues>;
  getTransitions(issue: string): Promise<Transitions>;
}

export interface ServerInfo {
  version: string;
  versionNumbers: number[];
}

export interface Issues {
  issues: Issue[];
  maxResults: number;
  startAt: number;
  total: number;
}

export interface Issue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
  };
}

export interface Transitions {
}

export function createClient(endpoint: string, username: string, password: string): Jira {
  return Pretend.builder()
    .basicAuthentication(username, password)
    .target(impl.JiraBlueprint, endpoint);
}

namespace impl {

  export class JiraBlueprint implements Jira {
    @Get('/rest/api/2/serverInfo')
    public serverInfo(): any {/* */}
    @Get('/rest/api/2/search', true)
    public search(): any {/* */}
    @Get('/rest/api/2/issue/:issue/transitions')
    public getTransitions(): any {/* */}
  }
}
