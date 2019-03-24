var extractList = (rows)=>{
	let headers = []
	Object.values(rows[0].children).forEach(e=>{
		try {
			if(window.location.href.includes("lightning"))
				headers.push(e.innerText.match(/\n([\w ]+)\n*/)[1])
			else
				headers.push(e.innerText)
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
	let items = extractList(element)
	let headers = items[0]
	let output = headers.join("\t").trim() + "\n"
	for (var i = 1; i < items.length; i++) {
		let item = []
		for (var j = 0; j < headers.length; j++) {
			if(!["", "Action"].includes(headers[j]))
				item.push(items[i][ headers[j] ])
		}
		output += item.join("\t") + "\n"
	}
	executeCopy(output)
	copyPopup({label: "Visible Rows", mode: "show"})
}
var addCopyListButtons = ()=>{
	let lists = document.querySelectorAll(".slds-table")
	let LEX = true
	if(lists.length == 0) {
		LEX = false
		lists = document.querySelectorAll(".listBody")
	}
	for (var i = 0; i < lists.length; i++) {
		let button = document.createElement("button")
		button.style.position = "absolute"
		if(LEX) {
			button.style.top = "0.5rem"
			button.classList = "slds-button slds-button--neutral"
			button.style.left = "50%"
			button.style.paddingRight = "25px"
		} else {
			button.style.top = "-2.1rem"
			button.classList = ""
			button.style.left = "90%"
			button.style.padding = "5px 25px 5px 5px"
		}
		button.style.backgroundImage = "url('" + chrome.extension.getURL("images/sf-copypaste16.png") + "')"
		button.style.backgroundPosition = "95% center"
		button.style.backgroundRepeat = "no-repeat"
		button.innerText = "Copy List"
		button.id = "copyList" + i
		button.addEventListener("click", (e)=>{ e.preventDefault(); copyList(e.target.parentElement.querySelectorAll("tr"));return false })
		let target
		if(LEX) {
			target = lists[i].closest(".forceListViewManager")
			if(target == undefined)
				target = lists[i].closest(".forceSearchResultsGridView")
		} else {
			target = lists[i].closest(".listBody")
		}
		target.prepend(button)
	}
}
let tableLoop = (tableCount)=>{
	if(tableCount == undefined || tableCount < 1) {
		let count = document.querySelectorAll(".slds-table").length + document.querySelectorAll(".listBody").length
		setTimeout(()=>tableLoop(count), 50)
	} else
		addCopyListButtons()
}
document.addEventListener("DOMContentLoaded", ()=>tableLoop())