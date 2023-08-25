/**
 * @ Author: Daniel Lin
 * @ Create Time: 2019-04-08 17:21:36
 * @ Modified by: Daniel Lin
 * @ Modified time: 2019-04-10 16:08:06
 * @ Description:
 */

import { commands, ExtensionContext } from 'vscode';

import commandList from './commands/commands';
import handleEvents from './events/events';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Register commands
  for (const [key, value] of commandList) {
    const command = commands.registerCommand(key, value.handler);
    context.subscriptions.push(command);
    console.log("注册菜单:"+key);
  }

  // Handle events
  handleEvents();
}

// this method is called when your extension is deactivated
export function deactivate() {
  // tslint:disable-next-line:no-empty
}
