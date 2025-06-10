import * as vscode from 'vscode';
import fetch from 'node-fetch';


export function activate(context: vscode.ExtensionContext) {
  console.log('Extension is now active!!');
	let disposable = vscode.commands.registerCommand('multi-agent-coder.explainCode',async ()=>{
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No active editor!');
      		return;
		}
		
		const selection = editor.selection;
		const text = editor.document.getText(selection);
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
			throw new Error('Invalid response');
		  }
		  const explanation = data.explanation || 'No explanation received.';
		  vscode.window.showInformationMessage(explanation, { modal: true });

	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
