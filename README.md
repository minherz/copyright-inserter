# Copyright Header Inserter

The Copyright Header Inserter is a VS Code extension that adds a copyright header into editing file. It is relevant when publishing code into public domain. The development was inspired by [addlicense](https://github.com/google/addlicense) and [autogen](https://github.com/mbrukman/autogen) tools and comes to simplify the process by integrating with one of the most popular development environments.

The extension supports [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0), [MIT](https://opensource.org/licenses/MIT) and [BSD](http://www.linfo.org/bsdlicense.html) licenses.

## Features

When invoked in the editor, the extension adds a copyright header at the top of the file.
The extension captures the current language mode of the editor and uses the language configuration to decide where to insert the header and how to decorate it.
The header is usually inserted into the first line. However, for language modes such as `shellscript`, `html` and `xml` which has mandatory declarations in the first line, the header is inserted next after the declaration line.
The header is decorated using language's comment syntax. If the language has both block and line comments, the extension will use the block comments for the decoration.

The extension can be invoked by typing `insert.header` or `Copyright: insert.header` in the [VSCode Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette). No key binding is defined at the moment.

TODO: add animation here:

\!\[feature X\]\(images/feature-x.png\)


## Extension Settings

This extension adds the following settings into `Extensions` section under `Copyright Inserter`:

* `Holder`: a string describing the copyright holder. Default value is `Google LLC`
* `License`: one of the following literals that define the copyright license: `apache` for Apache 2.0, `bsd` for BSD and `mit` for MIT. Default value is `apache`.
* `Year`: a string describing the copyright year. Default value is empty string. If the string is empty, the current year will be used.

## Known Issues

No known issues at the moment.

## Release Notes

### 0.0.1

Initial release of the Copyright Header Inserter. Supports adding copyright header to any file for which the [Language Mode](https://code.visualstudio.com/docs/languages/overview) defines comments.
