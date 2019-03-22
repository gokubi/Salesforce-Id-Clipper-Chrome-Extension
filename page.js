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
var addCopyListButtons = ()=>{
	let button = document.createElement("button")
	button.classList = "slds-button slds-button--neutral"
	button.style.top = "0.5rem"
	button.style.position = "absolute"
	// button.href = "#"
	button.innerText = "Copy List"
	button.addEventListener("click", (e)=>{
console.log(e.target)
		copyList(e.target.closest(".forceSearchResultsGridView"))
		return true
	})
	let lists = document.querySelectorAll(".slds-table")
	for (var i = 0; i < lists.length; i++) {
		lists[i].prepend(button.cloneNode())
	}
}