console.log('sdvsdv');

console.log(document.body);

chrome.browserAction.onClicked.addListener(function(tab) {
alert('sdf'); console.log('s');
});

// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log('Turning ' + tab.url + ' red!');
  chrome.tabs.executeScript({
    code: 'document.body.style.backgroundColor="red"'
  });
});

function copyToClipboard(text) {
  const input = document.createElement('input');
  input.style.position = 'fixed';
  input.style.opacity = 0;
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
};

function preachify(text) {
  var preachText = text.replace(/ /g, " 👏 ")
  preachText = preachText + " 👏"
  return preachText;
}

function userMessage(preachText) {
  return "Paste to preach: " + preachText
}

function preach(info, tab) {
	var text = info.selectionText;
	var preachText = preachify(text);
	var usrMessage = userMessage(preachText);

	copyToClipboard(preachText);

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {message: "preach", preachText: usrMessage});
	});
 }

chrome.contextMenus.create({
	title: "Preach!",
 	contexts:["selection", "editable"],  // ContextType
 	onclick: preach // A callback function
});


