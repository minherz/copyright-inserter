/*
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as vscode from 'vscode';
import * as path from 'path';
import { parse } from 'jsonc-parser'

export class CopyrightInserter {
    // map of supported license labels to inline formatting functions that
    // insert copyright holder and year into the license
    // currently supported licenses are:
    // 'apache' - APACHE 2.0
    // 'bsd' - BSD
    // 'mit' - MIT
    // 'gpl3' - GPL 3.0
    // 'agpl3' - Affero GPL 3.0
    // 'mpl2' - MPL 2.0
    // 'pbzc' - Public Benefit Zero Copyright License 1.0
    readonly CopyrightMap = new Map([
        ['apache', (holder: string, year: string) =>
`Copyright ${year} ${holder}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     https://www.apache.org/licenses/LICENSE-2.0

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
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`],

        ['gpl3', (holder: string, year: string) =>
`Copyright (c) ${year} ${holder}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.`],

        ['agpl3', (holder: string, year:string) =>
`Copyright (C) ${year} ${holder}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.`],

        ['mpl2', (holder: string, year:string) =>
`Copyright (C) ${year} ${holder}

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at <https://mozilla.org/MPL/2.0/>.`],

    ['pbzc', (holder: string, year:string) =>
`This file is part of software which has been
Developed (D) ${year} by ${holder}.
        
Distributed under the Public Benefit Zero Copyright License (v.1.0)
        
You should have received a copy of the Public Benefit Zero Copyright License
along with this program. If not, see <https://github.com/wmthornton/PBZC.git>.`],
]);

    cachedLanguageConfigs = new Map();

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

        if (this.hasCopyright(editor.document, language.vsconfig.comments)) {
            console.log(`copyright-header-inserter: document already has copyright header`);
            return;
        }

        let firstLine = editor.document.getText(new vscode.Range(0, 0, 1, 0));
        let needLineBeforeBlock = this.hasMandatoryFirstLine(firstLine, language);
        let needLineAfterBlock = (firstLine && (!needLineBeforeBlock || editor.document.getText(new vscode.Range(1, 0, 2, 0)).trim())) ? true : false;

        let header:string|undefined = this.formatHeader(licenseTemplate, language, extensionConfig);
        if (!header) {
            return;
        }

        editor.edit( b =>
            {
                let startLine:number = 0;

                if (needLineBeforeBlock === true) {
                    header = "\n" + header;
                    startLine = 1;
                }
                if (needLineAfterBlock === true) {
                    header = header + "\n";
                }
                b.insert(new vscode.Position(startLine, 0), String(header));
            });      
    }

    private getExtensionConfig(): ExtensionConfiguration {
        const configView = vscode.workspace.getConfiguration();
        return {
            license: (configView.get("copyrightInserter.license") || "apache"),
            useLineComment: (configView.get("copyrightInserter.useLineComment") || false),
            linePrefix: (configView.get("copyrightInserter.linePrefix") || ""),
            data: new CopyrightData(
                String(configView.get("copyrightInserter.holder")),
                configView.get("copyrightInserter.year") || String((new Date()).getFullYear())
                )
        };
    }

    private getLanguageConfigById(id: string, fileName: string): LanguageConfig | undefined {
        let fileExt:string = path.extname(fileName).toLowerCase();
        let config:LanguageConfig = this.cachedLanguageConfigs.get(id + "+" + fileExt);
        if (config) {
            return config;
        }
        for (const extension of vscode.extensions.all) {
            if (extension.packageJSON.contributes && extension.packageJSON.contributes.languages) {
                const data = extension.packageJSON.contributes.languages.find((it: any) => it.id === id && (!fileExt || it.extensions.indexOf(fileExt) >= 0));
                if (data && data.configuration) {
                    config = {
                        id: id,
                        firstLine: data.firstLine ? new RegExp(data.firstLine) : undefined,
                        vsconfig: this.loadLanguageConfiguration(path.join(extension.extensionPath, data.configuration))
                    };
                    this.cachedLanguageConfigs.set(id + "+" + fileExt, config);
                    return config;
                }
            }
        }
        return undefined;
    }

    private hasCopyright(doc: vscode.TextDocument, c?: vscode.CommentRule): boolean {
        // search for copyright part of the license header in first 10 lines
        let prefix = doc.getText(new vscode.Range(0, 0, 10, 0));

        if (c!.blockComment) {
            let bcStart = this.escapeStringForRegexp(c!.blockComment[0]);
            // treat "^" working over multiple lines, ignore casing and allow "." to match newline 
            if (new RegExp(`^${bcStart}.*Copyright`, "mis").test(prefix)) {
                return true;
            }
        }
        if (c!.lineComment) {
            let lc = this.escapeStringForRegexp(c!.lineComment);
            // treat "^" working over multiple lines and ignore casing
            if (new RegExp(`^${lc}.*Copyright`, "mi").test(prefix)) {
                return true;
            }
        }
        return false;
    }

    private loadLanguageConfiguration(uri: string): vscode.LanguageConfiguration {
        // try to load JSON ECMA-262
        try {
            return require(uri);
        }
        catch (e) {
            if (!(e instanceof SyntaxError)) {
                throw e;
            }        
        }
        var fs = require('fs');
        var jsonString = fs.readFileSync(uri, 'utf8');

        return parse(jsonString, undefined, { disallowComments: false, allowTrailingComma: true })
    }

    private escapeStringForRegexp(s: string): string {
        // see explanations in https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    private hasMandatoryFirstLine(firstLine: string, language: LanguageConfig): boolean {
        if (language.firstLine) {
            let re = new RegExp(language.firstLine);
            if (re.test(firstLine)) {
                return true;
            }
        }
        // fix vscode 'html' language contribution that does not define first line but opt out to have one
        if (language.id === "html" && firstLine.toLowerCase().startsWith("<!doctype")) {
            return true;
        }
        // fix vscode 'shellscript' language firstLine regex that matches only limited set of commands
        if (language.id === "shellscript" && firstLine.startsWith("#!/")) {
            return true;
        }
        return false;
    }

    private formatString(header: string, first_line: string, prefix: string, last_line: string): string {
        var result : string = "";

        if (first_line !== "") {
            result += first_line + "\n";
        }
        for (const line of header.split("\n")) {
            const new_line = prefix + line;
            result += new_line.trimRight() + "\n";
        }
        return result += last_line ? (last_line +"\n") : "";
    }

    private formatHeader(template: (holder: string, year: string) => string, language: LanguageConfig, config: ExtensionConfiguration): string | undefined {
        const c = language.vsconfig.comments;
        let header = template(config.data.holder, config.data.year);

        // use block comment
        if (c!.blockComment && (!config.useLineComment || !c!.lineComment)) {
            if (config.useLineComment) {
                console.warn(`copyright-header-inserter: use block comments nevertheless "Use Line Comment" setting is set because language ${language.id} does not have line comments`);
            }
            let openExp = c!.blockComment[0];
            let closExp = c!.blockComment[1];
            // indent header by one space if first char of open comment same as last char of close comment
            if (openExp[openExp.length-1] === closExp[0]) {
                header = this.formatString(header, c!.blockComment[0], " " + config.linePrefix, " " + c!.blockComment[1]);
            } else {
                header = this.formatString(header, c!.blockComment[0], config.linePrefix, c!.blockComment[1]);
            }
        } else if (c!.lineComment && (config.useLineComment || !c!.blockComment)) {
            const prefix = c!.lineComment + " ";
            header = this.formatString(header, "", prefix, "");
        } else {
            console.error(`copyright-header-inserter: language ${language.id} does not define comments`);
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
    useLineComment: boolean,
    linePrefix: string,
    data: CopyrightData;
};

class CopyrightData {
    holder: string = "Google LLC";
    year: string = String((new Date()).getFullYear());

    constructor(holder: string, year?: string) {
        if (holder) {
            this.holder = holder;
        }
        if (year) {
            this.year = year;
        }
    }
}
