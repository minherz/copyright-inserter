import * as vscode from 'vscode';
import * as path from 'path';


export class CopyrightInserter {
    // mind empty lines and identation, they are meaningful
    readonly CopyrightMap = new Map([
        ['apache', (holder: string, year: string) =>
`Copyright ${year} ${holder}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`],

        ['bsd', (holder: string, year: string) =>
`Copyright (c) ${year} ${holder} All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.`],

['mit', (holder: string, year: string) =>
`Copyright (c) ${year} ${holder}

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

    // language configuration cache
    languageConfigurationMap = new Map();

    constructor() { }

    // insertCopyrightHeader reads extension configuration, determines language in the current editor and inserts copyright header according to the template
    public insertHeader(): void {
        let extensionConfig = this.getExtensionConfig();
        let licenseTemplate = this.CopyrightMap.get(extensionConfig.license);
        if (!licenseTemplate) {
            console.error(`copyright-header-inserter: license type '${extensionConfig.license}' is not supported.`);
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log("copyright-header-inserter: no active editor found");
            return;
        }
        let language = this.getLanguageConfigById(editor.document.languageId);
        if (!language) {
            console.error(`copyright-header-inserter: failed to find configuration for language ${editor.document.languageId}`);
            return;
        }

        // for now do not support languages without comments
        if (!language.vsconfig.comments) {
            console.error(`copyright-header-inserter: language ${editor.document.languageId} does not support comments`);
            return;
        }

        let startLine:number = this.calculateInsertLine(editor, language);
        let header:string|undefined = this.formatHeader(licenseTemplate, extensionConfig.data, language.vsconfig);
        if (!header) {
            console.error(`copyright-header-inserter: language ${language.id} defines invalid comments`);
            return;
        }

        editor.edit( b =>
            {
                b.insert(new vscode.Position(startLine, 0), String(header));
            });      
    }

    private getExtensionConfig(): ExtensionConfiguration {
        const configView = vscode.workspace.getConfiguration();
        return {
            license: (configView.get("license") || "apache"),
            data: new CopyrightData(
                String(configView.get("holder")),
                configView.get("year") || String((new Date()).getFullYear())
                )
        };
    }

    private getLanguageConfigById(id: string): LanguageConfig | undefined {
        let config:LanguageConfig = this.languageConfigurationMap.get(id);
        if (config) {
            return config;
        }
        for (const extension of vscode.extensions.all) {
            if (extension.packageJSON.contributes && extension.packageJSON.contributes.languages) {
                const data = extension.packageJSON.contributes.languages.find((it: any) => it.id === id);
                if (data) {
                    config = {
                        id: id,
                        firstLine: data.firstLine ? new RegExp(data.firstLine) : undefined,
                        vsconfig: require(path.join(extension.extensionPath, data.configuration))
                    };
                    this.languageConfigurationMap.set(id, config);
                    return config;
                }
            }
        }
        return undefined;
    }

    private calculateInsertLine(editor: vscode.TextEditor, language: LanguageConfig): number {
        let line: number = 0;
        let firstLine = editor.document.getText(new vscode.Range(0, 0, 1, 0));
        if (language.firstLine) {
            let re = new RegExp(language.firstLine);
            if (re.test(firstLine)) {
                line = 1;
            }
        }
        // fix vscode 'html' language contribution that does not define first line but opt out to have
        if (language.id === "html" && firstLine.startsWith("<!doctype")) {
            line = 1;
        }
        // fix vscode 'shellscript' language firstLine regex that matches only limited set of commands
        if (language.id === "shellscript" && firstLine.startsWith("#!/")) {
            line = 1;
        }
        return line;
    }
    private formatHeader(template: (holder: string, year: string) => string, data: CopyrightData, language: vscode.LanguageConfiguration): string | undefined {
        const c = language.comments;

        let header = template(data.holder, data.year);
        if (c!.blockComment) {
            header = `${c!.blockComment[0]}\n${header}\n${c!.blockComment[1]}\n`;
        } else if (c!.lineComment) {
            const prefix = c!.lineComment + " ";
            header = prefix + header.replace(/\n/g, ("\n" + prefix)) + "\n"; // use regex to replace new line because string "\n" does not work well
        } else {
            // unexpected case when comments defined but don't have values
            return undefined;
        }
        return header;
    }
}

type LanguageConfig = {
    id : string,
    firstLine: RegExp | undefined;
    vsconfig: vscode.LanguageConfiguration
};

type ExtensionConfiguration = {
    license: string;
    data: CopyrightData;
};

class CopyrightData {
    holder: string = "Google LLC";
    year: string;

    constructor(holder: string, year?: string) {
        if (holder) {
            this.holder = holder;
        }
        if (year) {
            this.year = year;
        } else {
            this.year = String((new Date()).getFullYear());
        }
    }
}
