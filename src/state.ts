import { Jira } from './api';

export interface State {
  jira: Jira | undefined;
}

const state: State = {
  jira: undefined
};

export default state;
