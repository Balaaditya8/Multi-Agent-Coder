import * as vscode from 'vscode';
import * as crypto from 'crypto';

export type ExplanationEntry = {
    snippet: string;
    explanation: string;
}

function getSnippetHash(code: string): string {
    return crypto.createHash('md5').update(code).digest('hex');
}

export function saveExplanation(context: vscode.ExtensionContext, snippet:string, explanation:string){
    const hash = getSnippetHash(snippet);
    const history = context.globalState.get<{[key: string]: ExplanationEntry}>('explanationHistory') || {};
    history[hash] = {snippet, explanation};
    context.globalState.update('explanationHistory', history);

    console.log('Explanation saved:', history);
}

export function loadExplanationHistory(context: vscode.ExtensionContext): {[key: string]: ExplanationEntry}{
    const history = context.globalState.get<{ [key: string]: ExplanationEntry }>('explanationHistory') || {};
    console.log("Loading history from globalState:", history);
    return history;
}

