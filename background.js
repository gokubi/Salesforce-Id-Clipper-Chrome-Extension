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
				chrome.tabs.create({active: false, url: cleanUrl(tabs[0].url, currentId)})
			else
				chrome.tabs.update(tabs[0].id, {url: cleanUrl(tabs[0].url, currentId)})
		})
	cb.remove()
	return true
}
var copyCleanUrl = function(link) { copyToClipboard(link, true) }
var copyToClipboard = function(link, fullUrl) {
	if(link && link.linkUrl)
		finishCopyToClipboard(link.linkUrl, fullUrl)
	else {
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			finishCopyToClipboard(tabs[0].url, fullUrl)
		})
	}
}
var finishCopyToClipboard = function(targetUrl, fullUrl) {
	var copyId = getIdFromUrl(targetUrl)
	if(copyId != false) {
		var cb = makeClipboard()
		var action = ""
		var width = "360px"
		if(fullUrl === true) {
			cb.textContent = cleanUrl(targetUrl, copyId)
			action = "URL: " + cb.textContent
			width = "600px"
		}
		else {
			cb.textContent = copyId
			action = "Id: <span style='font-weight:bold'>" + copyId +"</span>"
		}
		cb.select()
		document.execCommand('copy')
		cb.remove()
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			chrome.tabs.executeScript(tabs[0].id, {code: `
var alert = document.createElement("div")
alert.style.backgroundColor = "#fff"
alert.style.border = "1px solid #1589ee"
alert.style.borderRadius = "4px"
alert.style.boxShadow = "0 0 3px #0070D2"
alert.style.fontSize = "140%"
alert.style.margin = "0 auto"
alert.style.padding = "10px 32px 10px 10px"
alert.style.left = 0
alert.style.right = 0
alert.style.width = "`+width+`"
alert.style.whiteSpace = "nowrap"
alert.style.overflow = "hidden"
alert.style.textOverflow = "ellipsis"
alert.style.position = "fixed"
alert.style.top = "18px"
alert.style.zIndex = "9999"
alert.style.opacity = 0
alert.style.transition = ".5s"
alert.innerHTML = "Copied ` + action + `<img src='data:image/png;base64,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' style='position:absolute;top:6px;right:6px;width:32px;height:32px'/>"
document.body.append(alert)
setTimeout(function() {
	alert.style.opacity = 1
	setTimeout(function() {
		alert.style.opacity = 0
		setTimeout(function() {
			alert.remove()
		}, 2000)
	}, 2000)
}, 10)
			`})
		})
		return true
	} else { return false }
}
var getIdFromUrl = function(url) {
	for(var i in ID_RE) {
		var match = url.match(ID_RE[i])
		if (match != null) { return match[1] }
	}
	return false
}
var cleanUrl = function(url, currentId) { return url.match(/.*force.com/)[0] + "/" + currentId }
var extractList = (rows)=>{
	let headers = []
	Object.values(rows[0].children).forEach(e=>{
		try { headers.push(e.querySelector("a").innerText.replace("SORT\n","")) }
		catch(er) {}
	})
	let exportList = [headers]
	for (var i = 1; i < rows.length; i++) {
		let j = 0
		let item = {}
		Object.values(rows[i].children).forEach(e=>{
			try {
				item[ headers[j] ] = e.innerText
				j++
			} catch(er) {}
		})
		exportList.push(item)
	}
	return exportList
}
var copyList = (element)=>{
// probably generlize finalcopy
	var cb = makeClipboard()
	let items = extractList(element)
	let headers = items[0]
	let output = headers.join("\t") + "\n"
	for (var i = 1; i < items.length; i++) {
		let item = []
		for (var j = 0; j < headers.length; j++) {
			item.push(items[i][ headers[j] ])
		}
		output += item.join("\t") + "\n"
	}
	cb.textContent = output
	cb.select()
	document.execCommand('copy')
	cb.remove()
}
var addCopyListButton = ()=>{
	let lists = document.querySelectorAll(".searchResultsGridHeader")
	let button = document.createElement("button")
	button.innerText = "Copy List"
	button.addEventListener("click", (e)=>{
		copyList(e.target.closest(".forceSearchResultsGridView"))
		return true
	})
	for (var i = 0; i < lists.length; i++) {
		lists[i].appendChild(button)
	}
}