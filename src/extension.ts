import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { saveExplanation } from './History/historyManager';
import { registerHistoryView } from './History/historyProvider';
import { HistoryProvider } from './History/historyTree';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension is now active!!');
	
	const historyProvider = new HistoryProvider(context);
	vscode.window.registerTreeDataProvider('explanationHistoryView', historyProvider);
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
		
		saveExplanation(context, text, explanation);
		historyProvider.refresh();  
	  } catch (error: any) {
		vscode.window.showErrorMessage(`Error getting explanation: ${error.message}`);
		panel.webview.html = getWebviewContent("❌ Failed to fetch explanation.");
	  }
	});
  
	context.subscriptions.push(disposable);

	const viewExplanationCommand = vscode.commands.registerCommand(
		'multi-agent-coder.viewExplanation',
		(snippet: string, explanation: string) => {
		  const panel = vscode.window.createWebviewPanel(
			'codeExplanationView',
			'Saved Code Explanation',
			vscode.ViewColumn.Beside,
			{
			  enableScripts: true
			}
		  );
	  
		  panel.webview.html = getWebviewContentWithSnippet(snippet, explanation);
		}
	  );
	  context.subscriptions.push(viewExplanationCommand);

  }

export function deactivate() {}

export function getWebviewContent(content: string): string {
	const escaped = content
	  .replace(/`/g, '\\`')   // escape backticks
	  .replace(/\$/g, '\\$'); // escape $ which breaks string interpolation
  
	return `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
		<meta charset="UTF-8">
		<title>Code Explanation</title>
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
		  pre {
			background: #eee;
			padding: 1em;
			border-radius: 8px;
			overflow-x: auto;
		  }
		  code {
			font-family: monospace;
		  }
		</style>
		<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
		<link rel="stylesheet" href="https://dev.prismjs.com/themes/prism.css" />
	  </head>
	  <body>
		<h1>Explanation</h1>
		<div id="explanation">Loading...</div>
		<script>
		  const raw = \`${escaped}\`;
		  document.getElementById('explanation').innerHTML = marked.parse(raw);
		</script>
	  </body>
	  </html>
	`;
  }

  function getWebviewContentWithSnippet(snippet: string, explanation: string): string {
	const escapedExplanation = explanation.replace(/`/g, '\\`').replace(/\$/g, '\\$');
	const escapedSnippet = snippet.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  
	return `
	  <!DOCTYPE html>
	  <html>
	  <head>
		<meta charset="UTF-8">
		<title>Explanation Detail</title>
		<style>
		  body {
			font-family: sans-serif;
			padding: 1em;
			background-color: #f8f8f8;
			color: #333;
		  }
		  h2 {
			margin-top: 1em;
		  }
		  pre {
			background: #f0f0f0;
			padding: 1em;
			border-radius: 6px;
			overflow-x: auto;
		  }
		  .section {
			margin-bottom: 2em;
		  }
		</style>
		<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
	  </head>
	  <body>
		<div class="section">
		  <h2>🧾 Original Code</h2>
		  <pre><code>${escapedSnippet}</code></pre>
		</div>
		<div class="section">
		  <h2>🧠 Explanation</h2>
		  <div id="explanation">Loading explanation...</div>
		</div>
  
		<script>
		  const explanation = \`${escapedExplanation}\`;
		  document.getElementById('explanation').innerHTML = marked.parse(explanation);
		</script>
	  </body>
	  </html>
	`;
  }
  

