/*
Copyright (c) 2011, Steve Andersen
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

ID_RE = [
	/http[s]?\:\/\/.*force\.com\/.*(\w{18})/, // tries to find the first 18 digit
	/http[s]?\:\/\/.*force\.com\/.*(\w{15})/ // falls back to 15 digit
]

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create(
		{"title": "Copy Salesforce Id", "contexts" : ["link"], "onclick": copyToClipboard}
	)
})
chrome.commands.onCommand.addListener(function(command) {
	switch(command) {
		case 'copyRecordId':
			copyToClipboard()
			break
		case 'pasteRecordId':
			pasteFromClipboard()
			break
		case 'pasteRecordIdToNewTab':
			pasteFromClipboardToNewTab()
			break
	}
})
var makeClipboard = function() {
	var clipboard = document.createElement("textarea")
	var body = document.getElementsByTagName('body')[0]
	body.appendChild(clipboard)
	clipboard.select()
	return clipboard
}
var pasteFromClipboardToNewTab = function() { pasteFromClipboard(true) }
var pasteFromClipboard = function(newtab) {
	cb = makeClipboard()
	document.execCommand('paste')
	var currentId = cb.value.trim()
	if(currentId.match(/^\w{15}$/) != null || currentId.match(/^\w{18}$/) != null)
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			if(newtab)
				chrome.tabs.create({active: false, url: tabs[0].url.match(/.*force.com/)[0] + "/" + currentId})
			else
				chrome.tabs.update(tabs[0].id, {url: tabs[0].url.match(/.*force.com/)[0] + "/" + currentId})
		})
	cb.remove()
	return true
}
var copyToClipboard = function(link, tab) {
	if(link != null && link.linkUrl)
		finishCopyToClipboard(link.linkUrl)
	else {
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			finishCopyToClipboard(tabs[0].url)
		})
	}
}
var finishCopyToClipboard = function(targetUrl) {
	var copyId = getIdFromUrl(targetUrl)
	var cb = makeClipboard()
	cb.textContent = copyId
	cb.select()
	document.execCommand('copy')
	cb.remove()
	return true
}
var getIdFromUrl = function(url) {
	for(var i in ID_RE) {
		var match = url.match(ID_RE[i])
		if (match != null) { return match[1] }
	}
	return false
}