// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const BuildCommandHandler = require("./build");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

let extensionFeatures = [];

function activate(context) {
  extensionFeatures = [new BuildCommandHandler(context.subscriptions)];

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("IO-Email-Worker-Utility is now active");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  // let buildDisposable = vscode.commands.registerCommand(
  //   "ewu.build",
  //   function() {
  //     console.log("Building");

  //     // The code you place here will be executed every time your command is executed

  //     // Display a message box to the user
  //     vscode.window.showInformationMessage("Building");
  //   }
  // );

  let watchDisposable = vscode.commands.registerCommand(
    "ewu.watch",
    function() {
      console.log("Watch");

      vscode.window.showInformationMessage("Watching test");
    }
  );

  let testDisposable = vscode.commands.registerCommand("ewu.test", function() {
    console.log("Testing");

    vscode.window.showInformationMessage("Testing");
  });

  // context.subscriptions.push(buildDisposable);
  context.subscriptions.push(watchDisposable);
  context.subscriptions.push(testDisposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
