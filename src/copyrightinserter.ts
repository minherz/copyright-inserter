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
import * as path from 'path';
import { start } from 'repl';


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
        let language = this.getLanguageConfigById(editor.document.languageId, editor.document.fileName);
        if (!language) {
            console.error(`copyright-header-inserter: failed to find configuration for language ${editor.document.languageId}`);
            return;
        }

        // for now do not support languages without comments
        if (!language.vsconfig.comments) {
            console.error(`copyright-header-inserter: language ${editor.document.languageId} does not support comments`);
            return;
        }

        if (this.hasCopyright(editor.document, language.vsconfig.comments)) {
            console.log(`copyright-header-inserter: document already has copyright header`);
            return;
        }

        let startLine:number = this.calculateInsertLine(editor.document, language);
        let header:string|undefined = this.formatHeader(licenseTemplate, extensionConfig.data, language.vsconfig);
        if (!header) {
            console.error(`copyright-header-inserter: language ${language.id} defines invalid comments`);
            return;
        }

        editor.edit( b =>
            {
                // insert header to line 0 or 1; prefix with newline if document has only one line
                if (startLine === editor.document.lineCount) {
                    header = "\n" + header;
                }
                b.insert(new vscode.Position(startLine, 0), String(header));
            });      
    }

    private getExtensionConfig(): ExtensionConfiguration {
        const configView = vscode.workspace.getConfiguration();
        return {
            license: (configView.get("copyrightInserter.license") || "apache"),
            data: new CopyrightData(
                String(configView.get("copyrightInserter.holder")),
                configView.get("copyrightInserter.year") || String((new Date()).getFullYear())
                )
        };
    }

    private getLanguageConfigById(id: string, fileName: string): LanguageConfig | undefined {
        let fileExt:string = path.extname(fileName).toLowerCase();
        let config:LanguageConfig = this.languageConfigurationMap.get(id + "+" + fileExt);
        if (config) {
            return config;
        }
        for (const extension of vscode.extensions.all) {
            if (extension.packageJSON.contributes && extension.packageJSON.contributes.languages) {
                const data = extension.packageJSON.contributes.languages.find((it: any) => it.id === id && (!fileExt || it.extensions.indexOf(fileExt) >= 0));
                if (data) {
                    config = {
                        id: id,
                        firstLine: data.firstLine ? new RegExp(data.firstLine) : undefined,
                        vsconfig: require(path.join(extension.extensionPath, data.configuration))
                    };
                    this.languageConfigurationMap.set(id + "+" + fileExt, config);
                    return config;
                }
            }
        }
        return undefined;
    }

    private hasCopyright(doc: vscode.TextDocument, c: vscode.CommentRule): boolean {
        let prefix = doc.getText(new vscode.Range(0, 0, 10, 0)); // assume the copyright part of header is in first 10 lines

        if (c!.blockComment) {
            let bcStart = this.escapeStringForRegexp(c!.blockComment[0]);
            if (new RegExp(`^${bcStart}.*Copyright`, "mis").test(prefix)) {
                return true;
            }
        }
        if (c!.lineComment) {
            let lc = this.escapeStringForRegexp(c!.lineComment);
            if (new RegExp(`^${lc}.*Copyright`, "mi").test(prefix)) {
                return true;
            }
        }
        return false;
    }

    private escapeStringForRegexp(s: string): string {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    private calculateInsertLine(doc: vscode.TextDocument, language: LanguageConfig): number {
        let line: number = 0;
        let firstLine = doc.getText(new vscode.Range(0, 0, 1, 0));
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

    private formatString(header: string, first_line: string, prefix: string, last_line: string): string {
        var cur_prefix = first_line;
        var result : string = "";
        header = "\n" + header;
        for (const line of header.split("\n")) {
            const new_line = cur_prefix + line;
            result += new_line.trimRight() + "\n";
            cur_prefix = prefix;
        }
        return result + last_line;
    }

    private formatHeader(template: (holder: string, year: string) => string, data: CopyrightData, language: vscode.LanguageConfiguration): string | undefined {
        const c = language.comments;

        let header = template(data.holder, data.year);
        if (c!.blockComment) {
            // We want to format it as follows:
            //
            // <Block Comment Start>\n
            // <Fist line of copyright>\n
            // <etc.>\n
            // <Block Comment End>\n
            if (c!.blockComment[0] === "/*") {
                // Most c like languages (c, java, etc.) like prepending '*' before block-comments
                // We want:
                // /*
                //  * the first line
                //  * the second line
                //  */
                header = this.formatString(header, c!.blockComment[0], " * ", " " + c!.blockComment[1] + "\n");
            } else {
                header = this.formatString(header, c!.blockComment[0], "", c!.blockComment[1] + "\n");
            }
        } else if (c!.lineComment) {
            const prefix = c!.lineComment + " ";
            header = this.formatString(header, prefix, prefix, "");
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
