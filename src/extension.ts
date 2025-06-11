import * as vscode from 'vscode';
import fetch from 'node-fetch';


export function activate(context: vscode.ExtensionContext) {
	console.log('Extension is now active!!');
  
	const disposable = vscode.commands.registerCommand('multi-agent-coder.explainCode', async () => {
	  const editor = vscode.window.activeTextEditor;
	  if (!editor) {
		vscode.window.showWarningMessage('No active editor!');
		return;
	  }
  
	  const selection = editor.selection;
	  const text = editor.document.getText(selection);
	  if (!text.trim()) {
		vscode.window.showWarningMessage('Please select some code to explain.');
		return;
	  }
  
	  // Create webview panel with "Loading..." message
	  const panel = vscode.window.createWebviewPanel(
		'codeExplainer',
		'Code Explanation',
		vscode.ViewColumn.Beside,
		{
		  enableScripts: true,
		  retainContextWhenHidden: true
		}
	  );
	  panel.webview.html = getWebviewContent("⏳ Generating explanation...");
  
	  try {
		const response = await fetch('http://localhost:5000/explain', {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ code: text }),
		});
  
		interface ApiResponse {
		  explanation?: string;
		}
  
		const data = await response.json() as ApiResponse;
  
		if (!data || typeof data !== 'object') {
		  throw new Error('Invalid response from server');
		}
  
		const explanation = data.explanation || 'No explanation received.';
		panel.webview.html = getWebviewContent(explanation);
	  } catch (error: any) {
		vscode.window.showErrorMessage(`Error getting explanation: ${error.message}`);
		panel.webview.html = getWebviewContent("❌ Failed to fetch explanation.");
	  }
	});
  
	context.subscriptions.push(disposable);
  }

export function deactivate() {}

function getWebviewContent(content: string): string {
	return `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
		<style>
		  body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
			padding: 1.5em;
			line-height: 1.6;
			background-color: #f8f8f8;
			color: #333;
		  }
		  h1 {
			font-size: 1.4em;
			margin-bottom: 1em;
		  }
		  .loader {
			font-style: italic;
			color: #888;
		  }
		  pre {
			background: #eee;
			padding: 1em;
			border-radius: 8px;
			overflow-x: auto;
		  }
		</style>
	  </head>
	  <body>
		<h1>Explanation</h1>
		<div>${content || '<span class="loader">Nothing to explain.</span>'}</div>
	  </body>
	  </html>`;
  }
  
