import * as vscode from 'vscode';
import { loadExplanationHistory, ExplanationEntry } from './historyManager';

export class HistoryProvider implements vscode.TreeDataProvider<HistoryItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<HistoryItem | undefined | null | void> = new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<HistoryItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: HistoryItem): vscode.TreeItem {
    return element;
  }

  getChildren(): Thenable<HistoryItem[]> {
    const history = loadExplanationHistory(this.context);
    console.log('Loaded history:', history);
    const items = Object.values(history).map((entry) => {
      const item = new HistoryItem(entry.snippet, entry.explanation);
      item.tooltip = entry.explanation;
      return item;
    });

    return Promise.resolve(items);
  }
}

class HistoryItem extends vscode.TreeItem {
    constructor(
      public readonly snippet: string,
      private explanation: string
    ) {
      super(
        snippet.length > 60 ? snippet.slice(0, 60) + '...' : snippet,
        vscode.TreeItemCollapsibleState.None
      );
  
      this.description = explanation.length > 80 ? explanation.slice(0, 80) + '...' : explanation;
  
      this.tooltip = `Snippet:\n${snippet}\n\nExplanation:\n${explanation}`;
      this.command = {
        title: 'Show Explanation',
        command: 'multi-agent-coder.viewExplanation',
        arguments: [snippet, explanation]
      };
    }
  }
