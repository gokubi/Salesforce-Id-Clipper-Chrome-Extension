var makeClipboard = function() {
	var clipboard = document.createElement("textarea")
	var body = document.getElementsByTagName('body')[0]
	body.appendChild(clipboard)
	clipboard.select()
	return clipboard
}
var extractList = (rows)=>{
	let headers = []
	Object.values(rows[0].children).forEach(e=>{
		try {
			headers.push(e.innerText.match(/\n([\w ]+)\n/)[1])
		} catch(er) { headers.push("") }
	})
	let exportList = [headers]
	for (var i = 1; i < rows.length; i++) {
		let j = 0
		let item = {}
		Object.values(rows[i].children).forEach(e=>{
			if(headers[j] != "") {
				try { item[ headers[j] ] = e.innerText }
				catch(er) {}
			}
			j++
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
	let output = headers.join("\t").trim() + "\n"
	for (var i = 1; i < items.length; i++) {
		let item = []
		for (var j = 0; j < headers.length; j++) {
			if(headers[j] != "")
				item.push(items[i][ headers[j] ])
		}
		output += item.join("\t") + "\n"
	}
	cb.textContent = output
	cb.select()
	document.execCommand('copy')
	cb.remove()
}
var addCopyListButtons = ()=>{
	let lists = document.querySelectorAll(".slds-table")
	for (var i = 0; i < lists.length; i++) {
		let button = document.createElement("button")
		button.classList = "slds-button slds-button--neutral"
		button.style.top = "0.5rem"
		button.style.left = "50%"
		button.style.position = "absolute"
		button.innerText = "Copy List"
		button.addEventListener("click", (e)=>{ copyList(e.target.parentElement.querySelector("table").querySelectorAll("tr"));return false })
		button.id = "copyList" + i
		let target = lists[i].closest(".forceListViewManager")
		if(target == undefined)
			target = lists[i].closest(".forceSearchResultsGridView")
		target.prepend(button)
	}
}
let tableLoop = (tableCount)=>{
	if(tableCount == undefined || tableCount < 1) {
		let count = document.querySelectorAll(".slds-table").length
		setTimeout(()=>tableLoop(count), 50)
	} else
		addCopyListButtons()
}
document.addEventListener("DOMContentLoaded", ()=>tableLoop())