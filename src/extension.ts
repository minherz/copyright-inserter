/*
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
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