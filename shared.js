var executeCopy = (copyText)=>{
	var clipboard = document.createElement("textarea")
	var body = document.getElementsByTagName('body')[0]
	body.appendChild(clipboard)
	clipboard.select()
	clipboard.textContent = copyText
	clipboard.select()
	document.execCommand('copy')
	clipboard.remove()
	return true
}
var copyPopup = (args)=>{
	let label, width, mode
	({label, width, mode} = args)
	mode = mode || "text"
	width = width || "230px"
	let cmd = `
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
alert.innerHTML = "Copied ` + label + `<img src='` + chrome.extension.getURL("images/sf-copypaste128.png") + `' style='position:absolute;top:6px;right:6px;width:32px;height:32px'/>"
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
`
	if(mode == "text")
		return cmd
	else
		eval(cmd)
}