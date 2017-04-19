/*
Copyright (c) 2011, Steve Andersen
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


var shortIdLength = 15;
var longIdLength = 18;
var id = "";
var id18 = "";
var cleanLink = "";
var clickCount = 1;

ID_RE = [
	/http[s]?\:\/\/.*\.salesforce\.com\/(\w{18})/,												// Matches id-18 for a standard salesforce page
	/http[s]?\:\/\/.*\.salesforce\.com\/(\w{15})/,												// Matches id-15 for a standard salesforce page
	/http[s]?\:\/\/.*\.salesforce\.com\/apex\/.*id=(\w{15})/,									// Matches id for an apex/visualforce page
	/http[s]?\:\/\/.*\.salesforce\.com\/_ui\/core\/userprofile\/UserProfilePage\?u=(\w{15})/,	// Matches id for a User profile
	/http[s]?\:\/\/.*\.lightning\.force\.com\/.*sObject\/(\w{18})\/.*/,
	
];
LINK_RE = [
	/(http[s]?\:\/\/.*\.salesforce\.com\/\w{18})/,												// Matches link (id-18) for a standard salesforce page
	/(http[s]?\:\/\/.*\.salesforce\.com\/\w{15})/,												// Matches link (id-15) for a standard salesforce page
	/(http[s]?\:\/\/.*\.salesforce\.com\/apex\/.*id=\w{15})/,									// Matches link for an apex/visualforce page
	/(http[s]?\:\/\/.*\.salesforce\.com\/_ui\/core\/userprofile\/UserProfilePage\?u=\w{15})/,	 	// Matches id for a User profile
	/(http[s]?\:\/\/.*\.lightning\.force\.com\/.*sObject\/\w{18}\/view)/,
	
];


// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
	// If it's a salesforce database URL and contains an id
	if ((tab.url.indexOf('force') > -1) && 
                     ((tab.url.match(ID_RE[1]) != null) || (tab.url.match(ID_RE[2]) != null) || (tab.url.match(ID_RE[3]) != null) || (tab.url.match(ID_RE[4]) != null))) {
		// ... show the page action.
		chrome.pageAction.show(tabId);
		chrome.pageAction.setIcon({path: "clipper.png", tabId: tab.id});
	}
};

// Extract the ID from a URL and copy to clipboard
function extractID(url, regex_set) {
	if (!regex_set) regex_set = ID_RE;
	for (var i in regex_set) {
		var match = url.match(regex_set[i]);
		if (match) {
			//if we're getting an id, set the ids
			if(regex_set == ID_RE){
				setIds(match[1]);
			} else {
				cleanLink = match[1];
			}
			break; // Even if 'return' is removed, processing should still stop;
		}
	}
	return false;
}

// Extract a link from a URL (delegates to extractID)
function extractLink(url) {
	extractID(url, LINK_RE);
	return cleanLink;
}

function setIds(currentId) {
	id = currentId;
	if(id.length == longIdLength) {
		id18 = id;
	} else {
	
		id18 = "";
		//thanks to Jeff Douglas for the 15 to 18 code
		var suffix = "";
		for (var i = 0; i < 3; i++) {
   			var flags = 0;
    		for (var j = 0; j < 5; j++) {
        		var c = id.charAt(i * 5 + j);
        		if (c >= 'A' && c <= 'Z') {
            		flags += 1 << j;
        		}
    		}
    		if (flags <= 25) {
        		suffix += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(flags);
    		} else {
        		suffix += "012345".charAt(flags-26);
    		}
		}
	
			id18 = id + suffix;
		}
}

function copyToClipboard(copy_me) {
	//we need a dom element in which to put the string before we can copy it

  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = copy_me;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
  return true;
}	

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

// Called when the user clicks on the page action.
chrome.pageAction.onClicked.addListener(function(tab) {
	/*chrome.tabs.executeScript({
    code: 'var ta=document.createElement("TEXTAREA"); ta.setAttribute("id", "clipboardholder");'
  });*/
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

	// Set up context menu tree at install time.
	chrome.runtime.onInstalled.addListener(function() {
		chrome.contextMenus.create(
			{"title": "Copy Salesforce Id (15)", "contexts" : ["link"],"onclick": onIdCopyClick}
		)
		chrome.contextMenus.create(
			{"title": "Copy Salesforce Id (18)", "contexts" : ["link"],"onclick": onId18CopyClick}
		)
		chrome.contextMenus.create(
			{"title": "Copy Clean Salesforce URL", "contexts" : ["link"],"onclick": onCleanCopyClick}
		)
	});
	
// copy Id only
function onIdCopyClick(info, tab) {
	extractID(info.linkUrl);
	if (id) copyToClipboard(id);
}

// copy Id (18) only
function onId18CopyClick(info, tab) {
	extractID(info.linkUrl);
	if (id) copyToClipboard(id18);
}

// copy clean URL
function onCleanCopyClick(info, tab) {
	var link = extractLink(info.linkUrl);
	if (link) copyToClipboard(link);
}