export interface Command {
  id: string;

  run(): void | Promise<void>;
}
