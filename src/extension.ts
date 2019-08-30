import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

  console.log('copyright-header-inserter: extension is now active');

  let disposable = vscode.commands.registerCommand('copyright.insert.header', insertHeader);
  context.subscriptions.push(disposable);
}

export function deactivate() {}


function insertHeader() {
  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) {
    console.log("copyright-header-inserter: no active file - do nothing");
    return;
  }

  const docLanguageId = activeEditor.document.languageId;
  const docLanguageInfo = getDocumentLanguageInfo(docLanguageId);
  if (!docLanguageInfo) {
    console.error(`copyright-header-inserter: failed to find configuration for language ${docLanguageId}`);
    return;
  }

  const configView = vscode.workspace.getConfiguration();
  const copyright: string = configView.get("copyright") || "apache";
  const holder: string = configView.get("holder") || "Google LLC";
  const year:string = configView.get("year") || String((new Date()).getFullYear());

  let template = CopyrightMap.get(copyright);
  if (!template) {
    console.error(`copyright-header-inserter: copyright '${copyright}' is not supported.`);
    return;
  }

  
  if (template) {
    let copyrightHeader = template(holder, year);

    // insert copyright
    console.log(copyrightHeader);
  } else {
    
  }
}

class LanguageData {
  firstLine: RegExp;
  configuration: vscode.LanguageConfiguration;
  constructor(firstLine: string, configPath: string) {
    this.firstLine = new RegExp(firstLine);
    this.configuration = require(configPath);
  }
}

// at the moment (v1.37.1) VSCode API does not provide language configuration by language id
// this hack reads through extensions to find a language extension that contributes a desired language id
function getDocumentLanguageInfo(languageId: string) {
  for (const extension of vscode.extensions.all) {
    if (extension.packageJSON.contributes && extension.packageJSON.contributes.languages) {
      const data = extension.packageJSON.contributes.languages.find( (it:any) => it.id === languageId);
      if (data) {
        return new LanguageData(data.firstLine, path.join(extension.extensionPath, data.configuration));
      }
    }
  }
  return null;
}

var CopyrightMap = new Map([
  ['apache', (holder: string, year: string) => `Copyright ${year} ${holder}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`],

  ['bsd', (holder: string, year: string) => `Copyright (c) ${year} ${holder} All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.`],

  ['mit', (holder: string, year: string) => `Copyright (c) ${year} ${holder}

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`]
]);
