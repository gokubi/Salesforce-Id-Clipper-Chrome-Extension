/*
Copyright (c) 2011, Steve Andersen
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Copyright (c) 2019, Danny Summerlin
Honestly, same.
*/
ID_RE = [
	/http[s]?\:\/\/.*force\.com\/.*([a-zA-Z0-9]{18})[^\w]/, // tries to find the first 18 digit
	/http[s]?\:\/\/.*force\.com\/.*([a-zA-Z0-9]{15})[^\w]/ // falls back to 15 digit
]
chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({"title": "Copy Salesforce Id", "contexts" : ["page","link"], "onclick": copyToClipboard})
	chrome.contextMenus.create({"title": "Copy Clean URL", "contexts" : ["page","link"], "onclick": copyCleanUrl})
})
chrome.commands.onCommand.addListener(function(command) {
	switch(command) {
		case 'copyRecordId':
			copyToClipboard()
			break
		case 'copyCleanUrl':
			copyCleanUrl()
			break
		case 'pasteRecordId':
			pasteFromClipboard()
			break
		case 'pasteRecordIdToNewTab':
			pasteFromClipboardToNewTab()
			break
	}
})
var pasteFromClipboardToNewTab = ()=>{ pasteFromClipboard(true) }
var pasteFromClipboard = (newtab)=>{
	cb = makeClipboard()
	document.execCommand('paste')
	var currentId = cb.value.trim()
	if(currentId.match(/^\w{15}$/) != null || currentId.match(/^\w{18}$/) != null)
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			if(newtab)
				chrome.tabs.create({active: false, url: cleanUrl(tabs[0].url, currentId)})
			else
				chrome.tabs.update(tabs[0].id, {url: cleanUrl(tabs[0].url, currentId)})
		})
	cb.remove()
	return true
}
var copyCleanUrl = (link)=>{ copyToClipboard(link, true) }
var copyToClipboard = function(link, fullUrl) {
	if(link && link.linkUrl)
		finishCopyToClipboard(link.linkUrl, fullUrl)
	else {
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			finishCopyToClipboard(tabs[0].url, fullUrl)
		})
	}
}
var finishCopyToClipboard = (targetUrl, fullUrl)=>{
	let copyId = getIdFromUrl(targetUrl)
	if(copyId != false) {
		let copyText = ''
		let label = ""
		let width = "360px"
		if(fullUrl === true) {
			copyText = cleanUrl(targetUrl, copyId)
			label = "URL: " + cb.textContent
			width = "600px"
		}
		else {
			copyText = copyId
			label = "Id: <span style='font-weight:bold'>" + copyId +"</span>"
		}
		executeCopy(copyText)
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			chrome.tabs.executeScript(tabs[0].id, {code: copyPopup({label: label, width: width})})
		})
		return true
	} else { return false }
}
var getIdFromUrl = (url)=>{
	for(var i in ID_RE) {
		var match = url.match(ID_RE[i])
		if (match != null) { return match[1] }
	}
	return false
}
var cleanUrl = (url, currentId)=>{ return url.match(/.*force.com/)[0] + "/" + currentId }