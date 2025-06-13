import * as vscode from 'vscode';
import { loadExplanationHistory } from './historyManager';
import { getWebviewContent } from '../extension';

class HistoryItem extends vscode.TreeItem {
    constructor(
      public readonly snippet: string,
      public readonly explanation: string
    ) {
      super(snippet.slice(0, 60).replace(/\s+/g, ' ') + '...', vscode.TreeItemCollapsibleState.None);
      this.tooltip = snippet;
      this.command = {
        command: 'multi-agent-coder.showFromHistory',
        title: 'Show Explanation',
        arguments: [explanation]
      };
    }
  }
  
  export class ExplanationHistoryProvider implements vscode.TreeDataProvider<HistoryItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<HistoryItem | undefined | void> = new vscode.EventEmitter();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
    constructor(private context: vscode.ExtensionContext) {}
  
    refresh(): void {
      this._onDidChangeTreeData.fire();
    }
  
    getTreeItem(element: HistoryItem): vscode.TreeItem {
      return element;
    }
  
    getChildren(): Thenable<HistoryItem[]> {
      const history = loadExplanationHistory(this.context);
      const items = Object.entries(history).map(([hash, entry]) =>
        new HistoryItem(entry.snippet, entry.explanation)
      );
      return Promise.resolve(items);
    }
  }
  
  export function registerHistoryView(context: vscode.ExtensionContext) {
    const provider = new ExplanationHistoryProvider(context);
    vscode.window.registerTreeDataProvider('explanationHistoryView', provider);
  
    context.subscriptions.push(
      vscode.commands.registerCommand('multi-agent-coder.showFromHistory', (explanation) => {
        const panel = vscode.window.createWebviewPanel(
          'codeExplainer',
          'Past Code Explanation',
          vscode.ViewColumn.Beside,
          { enableScripts: true }
        );
        panel.webview.html = getWebviewContent(explanation);
      })
    );
  }