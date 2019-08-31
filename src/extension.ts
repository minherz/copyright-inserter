import * as vscode from 'vscode';
import {CopyrightInserter} from './copyrightinserter';


let obj: CopyrightInserter;

export function activate(context: vscode.ExtensionContext) {

    console.log('copyright-header-inserter: extension is now active');

    obj = new CopyrightInserter();
    let disposable = vscode.commands.registerCommand('copyright.insert.header', insertHeader);
    context.subscriptions.push(disposable);
}

export function deactivate() { }

// TODO: figure out how to "share" scope across files
function insertHeader() {
    obj.insertHeader();
}