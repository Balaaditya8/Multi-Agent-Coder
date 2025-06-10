import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension is now active!!');
	let disposable = vscode.commands.registerCommand('multi-agent-coder.explainCode',()=>{
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No active editor!');
      		return;
		}
		
		const selection = editor.selection;
		const text = editor.document.getText(selection);
		vscode.window.showInformationMessage(`You selected: ${text}`);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
