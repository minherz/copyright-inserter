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

- `copyrightInserter.holder`: a string describing the copyright holder. Maximum length is 128 symbols. Default value is `Google LLC`
- `copyrightInserter.license`: one of the following
  - "Apache 2.0 `apache`" for Apache License, Version 2.0
  - "Affero GPL 3 `agpl3`" for GNU Affero General Public License version 3
  - "BSD `bsd`" for BSD-style license
  - "GPL 3 `gpl3" for GLP version 3
  - "MIT `mit`" for MIT license
  - "MPL 2 `mpl2`" for Mozilla Public License version 2
  - "User defined `user`" for a license text that is provided by a user
- `copyrightInserter.year`: a four digit copyright year or an empty string. If the string is empty, the current year will be used. Default value is empty string.
- `copyrightInserter.useLineComment`: a boolean flag to describe selection between block and line comments. Default is `false`.
- `copyrightInserter.userText`: A text of the user-defined license. It should use placeholders `${holder}` to include the copyright holder and `${year}` to include the copyright year. The maximum length is 2048 symbols. The `copyrightInserter.license` should be set to `user` in order to use the user-defined text for the license.

## Known Issues

None

## [Release Notes](CHANGELOG.md)
