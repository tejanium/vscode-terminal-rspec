const vscode = require('vscode')
const {execFile} = require('child_process')

const TERMINALS = {
	iterm: sendToIterm,
	cmux: sendToCmux,
}

let lastCode

function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('terminal-rspec.runAll', runAll),
		vscode.commands.registerCommand('terminal-rspec.runAgain', runAgain),
		vscode.commands.registerCommand('terminal-rspec.runCurrent', runCurrent)
	)
}
exports.activate = activate

function runAll() {
	run(`${rspecCommand()} ${getFilePath()}`)
}

function runAgain() {
	if (!lastCode) {
		vscode.window.showInformationMessage('terminal-rspec: No previous command found')
		return
	}
	send(lastCode)
}

function runCurrent() {
	let line = vscode.window.activeTextEditor.selection.active.line + 1
	run(`${rspecCommand()} ${getFilePath()}:${line}`)
}

// Try to return relative file path, fallback to full qualified.
function getFilePath() {
	const resource = vscode.window.activeTextEditor.document.uri
	const workspace = vscode.workspace

	if (resource.scheme === 'file') {
		const folder = workspace.getWorkspaceFolder(resource)
		if (!folder) {
			return resource.fsPath
		} else {
			return resource.fsPath.replace(folder.uri.fsPath + '/', '')
		}
	}
}

function run(code) {
	lastCode = code
	send(code)
}

function send(code) {
	const terminal = config().get('terminal')
	const sendTo = TERMINALS[terminal]
	if (!sendTo) {
		vscode.window.showErrorMessage(`terminal-rspec: Unknown terminal "${terminal}"`)
		return
	}
	sendTo(code)
}

function sendToIterm(code) {
	const script = ['tell application id "com.googlecode.iterm2"', 'tell current session of first window']
	if (config().get('runInForeground')) {
		script.push('activate current session')
	}
	script.push(`write text "${escapeAppleScript(code)}"`, 'end tell', 'end tell')
	execFile('osascript', script.flatMap(line => ['-e', line]), reportError)
}

// Without --surface cmux types into whichever pane has focus, which could be an agent session.
function sendToCmux(code) {
	const surface = config().get('cmuxSurface')
	if (!surface) {
		vscode.window.showErrorMessage('terminal-rspec: Set terminal-rspec.cmuxSurface to the cmux surface that should run rspec (find it with `cmux tree`)')
		return
	}
	execFile(config().get('cmuxPath'), ['send', '--surface', surface, `${code}\n`], reportError)
}

function escapeAppleScript(text) {
	return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function reportError(error, _stdout, stderr) {
	if (error) {
		vscode.window.showErrorMessage(`terminal-rspec: ${stderr.trim() || error.message}`)
	}
}

function rspecCommand() {
	return config().get('rspecCommand')
}

function config() {
	return vscode.workspace.getConfiguration('terminal-rspec')
}
