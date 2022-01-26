## [1.0.0]

- Initial release

## [1.0.1]

- Fix adding the license and copyright header to files which already have it
- Fix adding the header to the end of the line instead of new line when a file has only one line

## [1.0.2]

- Fix not honoring the extension settings
- Format languages with /**/ block comment to prefix all lines in the header with *

## [1.0.3]

- Fix a bug that caused to fail if vscode language configuration is JSON with comments
- Change invocation command from `Copyright: insert.header` to `Copyright: Insert Header`

## [1.0.4]

- Update Apache license URL schema from `http://` to `https://`

## [1.0.5]

- Fix ([#3](https://github.com/minherz/copyright-inserter/issues/3)) by configuring extension to run on local host.

## [1.0.6]

- Add option always select one line comment.
- Support languages without comments.

## [1.0.7]

- Add GPL 3 license to the list of the supported licenses.

## [1.0.8]

- Fix issues related to license block's layouts for line and block comments modes.
- Upgrade dependencies to resolve minor security vulnerability.

## [1.0.9]
- Fix issue with inserting license block when 'Use Line Comment' is set but a file's language does not have line comment.

## [1.0.10]
- Add `linePrefix` configuration allowing to customize a prefix for each line of the copyright.

## [1.0.11]
- Add `Affero GPL 3` license to the list of the supported licenses. 
