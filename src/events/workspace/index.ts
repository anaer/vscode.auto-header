/**
 * @ Author: Daniel Lin
 * @ Create Time: 2019-04-10 09:35:10
 * @ Modified by: Daniel Lin
 * @ Modified time: 2019-04-10 16:05:31
 * @ Description:
 */

import { Position, Range, TextDocument, TextEditorEdit, window, workspace } from 'vscode';

import defaultConfig from '../../config/default.config';
import { checkLineStartsWith, checkLineStartsWith2, getConfigOptionCount, getModify } from '../../utils/index';

// Last save time
let lastSaveTime = 0;

// Last save file name
let lastFileName = '';

/**
 * File did save event handler
 */
export const onDidSaveTextDocument = (document: TextDocument) => {
  if (document.fileName === lastFileName) {
    const currentTime = new Date().getTime();
    const timeInterval = currentTime - lastSaveTime;
    if (timeInterval <= 5 * 1000) {
      return;
    }
  }

  lastSaveTime = new Date().getTime();
  lastFileName = document.fileName;

  // Get configuration from user settings
  const autoHeaderConfig = workspace.getConfiguration('autoHeader');
  const format = (autoHeaderConfig && autoHeaderConfig.format) || defaultConfig.format;
  const header = (autoHeaderConfig && autoHeaderConfig.header) || defaultConfig.header;

  // Selected activated file the very first time the command is executed
  const activeTextEditor = window.activeTextEditor;

  // Get modify entity
  const modifyEntity = getModify({ format, header }, document.fileName);
  const createTime = modifyEntity.createTime;
  const modifyTime = modifyEntity.modifyTime;
  const modifier = modifyEntity.modifier;

  const length = getConfigOptionCount(header);

  let createTimeRange = new Range(new Position(0, 0), new Position(0, 0));
  let modifyTimeRange = new Range(new Position(0, 0), new Position(0, 0));
  let modifierRange = new Range(new Position(0, 0), new Position(0, 0));
  const createTimeStartsWith = `${format.middleWith}${format.headerPrefix}${createTime.key}:`;
  const modifyTimeStartsWith = `${format.middleWith}${format.headerPrefix}${modifyTime.key}:`;
  const modifierStartsWith = `${format.middleWith}${format.headerPrefix}${modifier.key}:`;
  for (let index = 0; index < length; index++) {
    // Get line text
    const linetAt = document.lineAt(index);
    const line = linetAt.text;

    // 判断是否创建时间行, 同时判断配置是否为空
    const isCreateTimeLine = checkLineStartsWith2(line, createTimeStartsWith);
    if (isCreateTimeLine) {
      createTimeRange = linetAt.range;
      continue;
    }

    // tslint:disable-next-line:max-line-length
    const isModifyTimeLine = checkLineStartsWith(line, modifyTimeStartsWith);
    if (isModifyTimeLine) {
      modifyTimeRange = linetAt.range;
      continue;
    }

    const isModifierLine = checkLineStartsWith(line, modifierStartsWith);
    if (isModifierLine) {
      modifierRange = linetAt.range;
    }
  }

  const isUpdateCreateTime = !createTimeRange.isEmpty && createTime.key && createTime.value;
  const isUpdateModifyTime = !modifyTimeRange.isEmpty && modifyTime.key && modifyTime.value;
  const isUpdateModifier = !modifierRange.isEmpty && modifier.key && modifier.value;

  if (!isUpdateCreateTime && !isUpdateModifyTime && !isUpdateModifier) {
    return;
  }

  // Update header
  if (activeTextEditor) {
    activeTextEditor.edit((editBuilder: TextEditorEdit) => {
      if (isUpdateCreateTime) {
        editBuilder.replace(createTimeRange, createTime.value);
      }

      if (isUpdateModifyTime) {
        editBuilder.replace(modifyTimeRange, modifyTime.value);
      }

      if (isUpdateModifier) {
        editBuilder.replace(modifierRange, modifier.value);
      }
    });
    setTimeout(() => {
      document.save();
    }, 200);
  }
};
