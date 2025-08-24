import { createInterface, Interface } from "readline";
import { stdin as input, stdout as output } from "process";

export class InputGetter {
  private rl: Interface;

  constructor() {
    this.rl = createInterface({ input, output, terminal: true });
    this.rl.setPrompt("> ");
  }

  ask(question: string): Promise<string> {
    return new Promise(resolve => this.rl.question(question, answer => resolve(answer)));
  }

  onLine(handler: (line: string) => void): void {
    this.rl.on("line", line => handler(line));
  }

  prompt(): void {
    this.rl.prompt();
  }

  close(): void {
    this.rl.close();
  }
}
