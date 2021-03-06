import React from 'react';
import ReactDOM from 'react-dom';
import noop from 'lodash/noop';
import isBrowser from 'utils/isBrowser';
import uniqueId from 'lodash/uniqueId';

import Dialog from './Dialog';

const dialogInstanceMap = {};

function addDialogInstance(dialogId, dialog) {
  if (dialogInstanceMap[dialogId]) {
    throw new Error(`Duplicate dialog id found: ${dialogId}`);
  }

  dialogInstanceMap[dialogId] = dialog;
}

export function closeDialog(dialogId, options = {}) {
  const dialog = dialogInstanceMap[dialogId];

  if (!dialog) {
    return;
  }

  delete dialogInstanceMap[dialogId];

  const { onClose, container } = dialog;
  if (!container) {
    return;
  }

  const { triggerOnClose = true } = options;
  if (triggerOnClose && onClose) {
    onClose();
  }

  ReactDOM.unmountComponentAtNode(container);
}

/**
  打开一个dialog，返回值是一个用来关闭dialog的函数。
**/
export default function openDialog(options = {}) {
  if (!isBrowser) return noop;

  const {
    onClose: oldOnClose,
    ref,
    dialogId = uniqueId('__zent-dialog__')
  } = options;
  let container = document.createElement('div');

  // 确保多次调用close不会报错
  const close = evt => {
    closeDialog(dialogId, {
      triggerOnClose: evt !== false
    });
  };

  const props = {
    ...options,
    visible: true,
    onClose: close
  };

  // 只支持函数形式的ref
  if (ref && typeof ref !== 'function') {
    delete props.ref;
  }

  // 不要依赖render的返回值，以后可能行为会改变
  ReactDOM.render(React.createElement(Dialog, props), container);

  addDialogInstance(dialogId, {
    onClose: oldOnClose,
    container
  });

  return close;
}
