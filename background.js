/*
Copyright (c) 2011, Steve Andersen
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var shortIdLength = 15
var longIdLength = 18
var id = ""
var id18 = ""
var cleanLink = ""
// var clickCount = 1

ID_RE = [
	/http[s]?\:\/\/.*force\.com\/(\w{18})/,												// Matches id-18 for a standard salesforce page
	/http[s]?\:\/\/.*force\.com\/(\w{15})/,												// Matches id-15 for a standard salesforce page
	/http[s]?\:\/\/.*force\.com\/apex\/.*id=(\w{15})/,									// Matches id for an apex/visualforce page
	/http[s]?\:\/\/.*force\.com\/_ui\/core\/userprofile\/UserProfilePage\?u=(\w{15})/,	// Matches id for a User profile
	/http[s]?\:\/\/.*force\.com\/.*sObject\/(\w{18})\/.*/
]
// these look identical?
LINK_RE = [
	/(http[s]?\:\/\/.*force\.com\/\w{18})/,												// Matches link (id-18) for a standard salesforce page
	/(http[s]?\:\/\/.*force\.com\/\w{15})/,												// Matches link (id-15) for a standard salesforce page
	/(http[s]?\:\/\/.*force\.com\/apex\/.*id=\w{15})/,									// Matches link for an apex/visualforce page
	/(http[s]?\:\/\/.*force\.com\/_ui\/core\/userprofile\/UserProfilePage\?u=\w{15})/,	 	// Matches id for a User profile
	/(http[s]?\:\/\/.*force\.com\/.*sObject\/\w{18}\/view)/
]

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create(
		{"title": "Copy Salesforce Id", "contexts" : ["link"],"onclick": copyToClipboard}
	)
	chrome.contextMenus.create(
		{"title": "Copy Clean Salesforce URL", "contexts" : ["link"],"onclick": onCleanCopyClick}
	)
})
chrome.commands.onCommand.addListener(function(command)) {
	switch(command) {
		case 'copyRecordId':
			copyId()
			break
		case 'pasteRecordId':
			pasteFromClipboard()
			break
	}
}
var makeClipboard = function() {
	var clipboard = document.createElement("textarea")
	var body = document.getElementsByTagName('body')[0]
	body.appendChild(clipboard)
	clipboard.select()
	return clipboard
}
var pasteFromClipboard = function() {
	cb = makeClipboard()
	document.execCommand('paste')
	var currentId = cb.value.trim()
	if(currentId.match(/\w{15}/) != null || currentId.match(/\w{18}/) != null)
		window.location.href = window.location.origin + "/" + currentId
	body.removeChild(cb)
	return true
}
var copyToClipboard = function(link, tab) {
	var targetUrl = ""
	if(info != null && info.linkUrl)
		targetUrl = info.linkUrl
	else
		targetUrl = window.location.href
	var copyId = getIdFromLink(targetUrl)
	var cb = makeClipboard()
	cb.textContent = copyId
	document.execCommand('copy')
	body.removeChild(cb)
	return true
}
var getIdFromLink = function(url) {
	for(var i in LINK_RE) {
		var match = url.match(regex_set[i])
		if (match != null) { return match[1] }
	}
	return false
}
var onId18Copy = function(info, tab) {
	extractID(info.linkUrl)
	copyToClipboard(id18)
}
var onCleanCopyClick = function(info, tab) {
	var link = extractLink(info.linkUrl)
	if (link) copyToClipboard(link)
}

function extractID(url, regex_set) {
	if (!regex_set) regex_set = ID_RE
	for (var i in regex_set) {
		var match = url.match(regex_set[i]);
		if (match) {
			if(regex_set == ID_RE) { setIds(match[1]) }
			else { cleanLink = match[1] }
			break // Even if 'return' is removed, processing should still stop;
		}
	}
	return false
}
function setIds(currentId) {
	//get Id and check to see if it's 18 chars, set truncated id if it is
	if(currentId.length == longIdLength) {
		id = currentId.substring(0,shortIdLength)
		id18 = currentId
	} else {
		id = currentId
		id18 = ""
		//thanks to Jeff Douglas for the 15 to 18 code
		var suffix = ""
		for (var i = 0; i < 3; i++) {
			var flags = 0
			for (var j = 0; j < 5; j++) {
				var c = id.charAt(i * 5 + j)
				if (c >= 'A' && c <= 'Z') { flags += 1 << j }
			}
			if (flags <= 25) { suffix += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(flags) }
			else { suffix += "012345".charAt(flags-26) }
		}
		id18 = id + suffix;
	}
}

// Extract a link from a URL (delegates to extractID)
function extractLink(url) {
	extractID(url, LINK_RE)
	return cleanLink
}
// copy Id (18) only

// Listen for any changes to the URL of any tab.
// chrome.tabs.onUpdated.addListener(checkForValidUrl);

// Called when the user clicks on the page action.
/*
chrome.pageAction.onClicked.addListener(function(tab) {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
		extractID(tabs[0].url);
		if (id) {
			//1 clicks copy 15, 2 copy 18, 3 copy clean link
			if ((clickCount % 3) == 1){
				copyToClipboard(id);
				chrome.pageAction.setIcon({path: "clippered.png", tabId: tab.id});
			} else if ((clickCount % 3) == 2){
				copyToClipboard(id18);
				chrome.pageAction.setIcon({path: "clippered18.png", tabId: tab.id});
			} else {
				copyToClipboard(extractLink(tab.url));
				chrome.pageAction.setIcon({path: "clipperedLink.png", tabId: tab.id});
			}
		}
		clickCount++;
	});
});
*/
	// Set up context menu tree at install time.
// copy Id only
// function onIdCopy(info, tab) {
// 	extractID(info.linkUrl)
// 	if (id) copyToClipboard(id)
// }
// Called when the url of a tab changes.
// function checkForValidUrl(tabId, changeInfo, tab) {
// 	// If it's a salesforce database URL and contains an id
// 	var valid = false
// 	for (var i = 1; i < (ID_RE.length - 1); i++) { // why not match the first one though?
// 		if(tab.url.match(ID_RE[i]) != null)
// 			valid = true
// 	}
// 	// if ((tab.url.indexOf('force') > -1) && ((tab.url.match(ID_RE[1]) != null) || (tab.url.match(ID_RE[2]) != null) || (tab.url.match(ID_RE[3]) != null) || (tab.url.match(ID_RE[4]) != null))) {
// // I may want to get rid of this entirely, I'm not a fan of the icons
// 	if ((tab.url.indexOf('force') > -1) && valid) {
// 		chrome.pageAction.show(tabId)
// 		chrome.pageAction.setIcon({path: "clipper.png", tabId: tab.id})
// 	}
// }
