# terminal-rspec

Run rspec for the current file or line in an external terminal, iTerm2 or [cmux](https://cmux.com).

Forked from [xijo/vscode-iterm-rspec](https://github.com/xijo/vscode-iterm-rspec).

## Commands

* `terminal-rspec: Run all` runs the current spec file
* `terminal-rspec: Run current line` runs the example under the cursor
* `terminal-rspec: Run again` repeats the last run

## Extension Settings

* `terminal-rspec.terminal`: `iterm` (default) or `cmux`
* `terminal-rspec.rspecCommand`: rspec command to use, default `bundle exec rspec`
* `terminal-rspec.runInForeground`: iTerm only, activate the iTerm session on execution
* `terminal-rspec.cmuxSurface`: cmux only, the surface that runs rspec
* `terminal-rspec.cmuxPath`: cmux only, path to the cmux CLI

## cmux setup

cmux only accepts socket commands from processes it started, so VS Code gets rejected with `Socket read error`. In cmux go to Settings > Automation and set socket control to password mode with a password. The CLI picks up the saved password, so the extension needs nothing else.

Without a surface, cmux types into whichever pane has focus, so the extension refuses to run until `terminal-rspec.cmuxSurface` is set. Open a terminal for rspec, run `cmux identify` in it (or `cmux tree` from anywhere) and copy its surface ref, e.g. `surface:3`. Refs can shift when panes get rearranged; the UUID from `cmux tree --id-format uuids` stays stable.
