# Copyright Inserter

The Copyright Inserter is a VS Code extension that adds a copyright and license header into editing files. The development was inspired by [addlicense](https://github.com/google/addlicense) and [autogen](https://github.com/mbrukman/autogen) tools and comes to simplify the process of adding copyright and license into files during development by integrating with one of the most popular development environments.

The extension supports the following licenses:

**Copyright**
- [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [MIT](https://opensource.org/licenses/MIT)
- [BSD](http://www.linfo.org/bsdlicense.html)

**Copyleft**
- [GPL 3](https://www.gnu.org/licenses/gpl-3.0.en.html)
- [Affero GPL 3](https://www.gnu.org/licenses/agpl-3.0.en.html)
- [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/)
- [PBZC](https://github.com/wmthornton/PBZC.git)

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
* `copyrightInserter.license`: one of the following literals that define the copyright license: `apache` for Apache 2.0, `bsd` for BSD, `mit` for MIT, `gpl3` for GPL version 3, `agpl3` for Affero GPL version 3 and `pbzc` for Public Benefit Zero Copyright License. Default value is `apache`.
* `copyrightInserter.year`: a string describing the copyright year. Default value is empty string. If the string is empty, the current year will be used.
* `copyrightInserter.useLineComment`: a boolean flag to describe selection between block and line comments. Default is `false`.

## Known Issues

None

## [Release Notes](CHANGELOG.md)
