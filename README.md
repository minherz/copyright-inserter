# Copyright Inserter

The Copyright Inserter is a VS Code extension that adds a copyright and license header into editing files. The development was inspired by [addlicense](https://github.com/google/addlicense) and [autogen](https://github.com/mbrukman/autogen) tools and comes to simplify the process of adding copyright and license into files during development by integrating with one of the most popular development environments.

The extension supports [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0), [MIT](https://opensource.org/licenses/MIT) and [BSD](http://www.linfo.org/bsdlicense.html) licenses.

## Features

When the extension command is invoked in the editor, a copyright and license header is inserted at the top of the file.
The extension captures the current language mode of the editor and uses the language configuration to decide where to insert the header and how to decorate it.
The header is usually inserted into the first line. However, for language modes such as `shellscript`, `html` and `xml` which has mandatory declarations in the first line, the header is inserted next after the declaration line.
The header is decorated using language's comment syntax. If the language has both block and line comments, the extension will use the block comments for the decoration.

The extension can be invoked by typing `insert header` or `Copyright: insert header` in the [VSCode Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette). No key binding is defined at the moment.

## Demo

![Insert copyright header](resources/animation.gif)


## Extension Settings

This extension adds the following settings into `Extensions` section under `Copyright Inserter`:

* `copyrightInserter.holder`: a string describing the copyright holder. Default value is `Google LLC`
* `copyrightInserter.license`: one of the following literals that define the copyright license: `apache` for Apache 2.0, `bsd` for BSD and `mit` for MIT. Default value is `apache`.
* `copyrightInserter.year`: a string describing the copyright year. Default value is empty string. If the string is empty, the current year will be used.

## Known Issues

None

## Release Notes

### 1.0.0

Initial release of the Copyright Header Inserter. Supports adding copyright header to any file for which the [Language Mode](https://code.visualstudio.com/docs/languages/overview) defines comments.

### 1.0.1

Fixes a problem when the copyright and license header is already present in a file.

### 1.0.2

Fix a bug that caused ignoring the extension settings.
Format languages with /**/ block comment to prefix all lines in the header with *.

### 1.0.3

Fix a bug that caused to fail if vscode language configuration is JSON with comments.
Change invocation command from `Copyright: insert.header` to `Copyright: Insert Header`.

### 1.0.4

Update Apache license URL schema from `http://` to `https://`.
