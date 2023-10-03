const VIEW = {
	Timeline: "timeline",
	Table: "table",
	Album: "album",
	Board: "board",
	Blog: "blog",
	Gallery: "gallery",
	List: "list",
	Trend:"trend"
}

class Database {
	static IsLocal = true

	constructor() {
		this.data = []
		this.datamap = new Map() // id=>data
		this.isRecent = false //caching
		this.visualize_importance = true
		this.id = 1
		this.tags = new Map() // id=>tag
		this.view = VIEW.Table
		this.dbData = new Map() //dbid => name,desc
		this.currentEditingEvent=-1
	}
	
	setData(data) {
		this.data = data.sort((a, b) => {
			return new Date(b.eventstart).valueOf() - new Date(a.eventstart).valueOf()
		})
		for (const d of data) {
			d.tags=new Set()
			this.datamap.set(d.counter, d)
		}
	}
	setTags(tagdata) {
		console.log(tagdata)
		for (const d of tagdata.items) {
			this.tags.set(d.counter, d)
		}
		for (const d of tagdata.eventtags) {
			let event=this.datamap.get(d.event)
			if(event)
				event.tags.add(d.tag)
		}
	}
	setDBData(id, name, desc) {
		this.dbData.set(String(id), { name: name, desc: desc })
	}
	thisDBData() {
		return this.dbData.get(this.id)
	}

	reload() {
		$("#nameinput").val(null)
		quill.setContents([])
		changeView(this.view)
	}
}
const DB = new Database()
var quill
const DatabaseStub = Database.IsLocal ? new LocalDatabase() : new ServerConnection()
function exportData() {
	// let data=JSON.stringify()
	const name=localStorage.getItem(DB.id+"_name")
	const desc=localStorage.getItem(DB.id+"_desc")
	downloadObjectAsJson(
		{ 
			items: DB.data, 
			name: (name ? name : "database_" + DB.id), 
			desc: (desc ? desc : "" )
		},
		"database_" +(name ? name :DB.id)
	)
}
async function uploadData(data) {
	const dbdata=JSON.parse(data)
	const items = dbdata.items
	DB.id = hexId()
	console.log(data.dbid)
	if(items[0].dbid==="18af1c9319e") DB.id=items[0].dbid

	try {
		if (!items || items.length == 0 || items[0].eventstart == null) {
			alert("invalid format")
			return
		}
		
		await DatabaseStub.addDatabase(DB.id, dbdata.name,dbdata.desc)
		await DatabaseStub.createManyEventRequest(null, items)
		if(items[0].dbid!=="18af1c9319e")
			alert("import complete!")
		DatabaseStub.dbList()
	} catch (e) {
		alert("import failed" + e)
	}
}
async function createDatabase() {
	if (!$("#database-name-input").val()) {
		alert("choose a name for database")
		return
	}
	// if(DB.id===-1) DB.id = 
	console.log($("#database-name-input").val())
	await DatabaseStub.addDatabase(hexId(), $("#database-name-input").val(), $("#database-desc-input").val())
	DatabaseStub.dbList()
}

function closeEdit() {
	$("#emojiwindow").addClass("hidden")
	$("#editwindow").addClass("hidden")
	$("#shadow").addClass("hidden")
	$("body").css("overflow", "auto")
	$("#thumbnail").html("")
	$("#input-image").val(null)
	closePost()
}

function openPost(id) {
	$("#postwindow").removeClass("hidden")
	$("#shadow-post").removeClass("hidden")
	$("body").css("overflow", "hidden")
	let html = getBlogPost(DB.datamap.get(id), "post")
	$("#postwindow-content").html(html)
	populatePostContent(DB.datamap.get(id), "post")
	addPostBtnEvent()
}
function closePost() {
	$("#postwindow").addClass("hidden")
	$("#shadow-post").addClass("hidden")
	$("body").css("overflow", "auto")
}

function openEdit(id) {
	// console.log("edit" + id)
	$("#pickemoji").html('<img src="smile.svg">')
	$("#pickemoji").data("emoji", null)
	$("#preview-emoji").html("")
	$("#image-url-input").val("")
	if (id !== undefined) {
		DB.currentEditingEvent=id
		$("#editwindow h2").html("Edit Event")
		$("#submit-event-edit").show()
		$("#submit-event-edit").data("id", id)
		$("#submit-event").hide()
		$("#tagarea-container").show()
		$("#endinput").val(null)

		const data = DB.datamap.get(id)
		if (!data) return
		$("#nameinput").val(data.eventname)
		$("#startinput").val(data.eventstart.slice(0, 10))
		if (data.eventend) $("#endinput").val(data.eventend.slice(0, 10))
		if (data.emoji) {
			$("#pickemoji").data("emoji", data.emoji)
			$("#pickemoji").html(data.emoji)
			$("#preview-emoji").html(data.emoji)
		}
		$("#importance-range").val(data.importance)
		$("#importance-label").html("Importance:" + data.importance)

		if (data.color !== undefined) {
			$("#color-selection").data("color", data.color)
			$(".ql-toolbar").css("background", COLORS_LIGHT[Number(data.color)])
			$("#color-selection-current").css("background", COLORS_LIGHT[Number(data.color)])
		}
		console.log(data.eventdesc)
		if (data.eventdesc) {
			let desc=data.eventdesc
			if(typeof desc === "string") desc = JSON.parse(desc)
			quill.setContents(desc)
		}
		if (data.thumbnail) {
			if(isImageRemote(data.thumbnail)) {
				$("#image-url-input").val(data.thumbnail)
				$("#thumbnail").html("<img src='" + data.thumbnail + "'>")
		}
			else $("#thumbnail").html("<img src='./uploads/" + data.thumbnail + "'>")
		}
		$("#useemoji").prop("checked", data.emojiThumbnail === 1)
		if (data.isPeriod) {
			$("#type-period").prop("selected", true)
			$("#type-event").prop("selected", false)
		} else {
			$("#type-period").prop("selected", false)
			$("#type-event").prop("selected", true)
		}
		$(".tag-selection-editable").removeClass("selected")
		console.log(data.tags)
		for(const tag of data.tags){
			const tagobj=DB.tags.get(tag)
			$("#eventtag_"+tag).addClass("selected")
			$("#eventtag_"+tag).css("background", COLORS_MID[Number(tagobj.color)])
		}

	} else {
		DB.currentEditingEvent=-1

		$("#submit-event-edit").hide()
		$("#submit-event").show()
		$("#editwindow h2").html("Add New Event")
		$("#tagarea-container").hide()
	}
	$("#editwindow").removeClass("hidden")
	$("#shadow").removeClass("hidden")
	$("body").css("overflow", "hidden")
	document.getElementById("editwindow").scrollTo(0, 0)
}
function changeView(view) {
	$(".section").addClass("hidden")
	$("#section-" + view).removeClass("hidden")
	DB.view = view
	const url = new URL(window.location)
	url.searchParams.set("view", view)
	window.history.pushState(null, "", url.toString())

	// window.location.search = urlParams;

	switch (view) {
		case "db":
			window.location.href = "/"
			break
		case "timeline":
			Timeline()
			break
		case "table":
			Table()
			break
		case "album":
			Album()
			break
		case "gallery":
			Gallery()
			break
		case "board":
			Board()
			break
		case "blog":
			Blog()
			break
		case "list":
			ListView()
			break
		case "trend":
			TrendView()
			break
	}
}

async function createEvent(id) {
	const name = $("#nameinput").val()
	const desc = quill.getContents()
	const text = quill.getText()
	let start = $("#startinput").val()
	let end = $("#endinput").val()
	const emoji = $("#pickemoji").data("emoji")
	const importance = $("#importance-range").val()
	const type = $("#typeinput").find(":selected").val()
	const color = $("#color-selection").data("color")
	let emojithumb = $("#useemoji").prop("checked")

	if (end && new Date(start) >= new Date(end)) {
		alert("End date should be later than start date!")
		return
	}
	const event = {
		eventname: name,
		eventdesc: JSON.stringify(desc),
		desctext: text,
		eventstart: start,
		eventend: end,
		emoji: emoji,
		importance: importance,
		type: type,
		color: color,
		isPeriod: end && type === "2" ? 1 : 0,
		emojiThumbnail: emojithumb ? 1 : 0,
		tags: "",
		thumbnail:null
	}

	if (event.eventname === "") {
		alert("Missing eventname!")
		return
	}
	if (event.eventname.length >= 20) {
		alert("Eventname should be shorter than 20 characters")
		return
	}
	if (event.eventstart === "") {
		alert("Missing start date!")
		return
	}
	if (type === "2" && event.eventend === "") {
		alert("Period requires end date!")
		return
	} else if (event.eventend === "") {
		event.eventend = undefined
	}

	const formdata = new FormData()
	formdata.append("eventname", event.eventname)
	formdata.append("eventdesc", event.eventdesc)
	formdata.append("desctext", event.desctext)
	formdata.append("eventstart", event.eventstart)
	if (event.eventend) formdata.append("eventend", event.eventend)
	if (event.emoji) formdata.append("emoji", event.emoji)

	formdata.append("importance", event.importance)
	formdata.append("type", event.type)
	formdata.append("color", event.color)
	formdata.append("isPeriod", event.isPeriod)
	formdata.append("emojiThumbnail", event.emojiThumbnail)
	formdata.append("tags", "")
	let img=id?DB.datamap.get(id).thumbnail:""
	if($("#image-url-input").val())
		img = $("#image-url-input").val()
	
	if (!Database.IsLocal) {
		const image = $("#input-image")[0].files[0]
		// console.log(image)

		if (image) formdata.append("img", image)
		else if (img) {
			formdata.append("thumbnail", img)
		}
	}
	else{
		
		if (img) {
			// console.log(img)/
			event.thumbnail=img
			formdata.append("thumbnail",img)
		}
	}
	console.log(event)
	//create event
	if (!id) {
		DatabaseStub.createEventRequest(formdata, event)
	} else {
		//edit event
		DatabaseStub.editEventRequest(formdata, event, id)
	}
}

function drawTags() {
	let html = ""
	for (const tag of DB.tags.values()) {
		html += 
		`<div class="tag-selection tag-selection-editable" data-id=${tag.counter} id="eventtag_${tag.counter}" data-color=${tag.color} style="background-color:${
			COLORS_LIGHT[tag.color]
		};">
        <img src="check.png">${tag.name}</div>`
	}
	
	$("#tagarea").html(html)
	$(".tag-selection-editable").click(function () {
		if (!$(this).data("id") || !$(this).data("color")) return

		if ($(this).hasClass("selected")) {
			$(this).css("background", COLORS_LIGHT[Number($(this).data("color"))])
			$(this).removeClass("selected")
			if(DB.currentEditingEvent!==-1)
				DatabaseStub.setEventTag(DB.currentEditingEvent,$(this).data("id"),false)
		} else {
			$(this).addClass("selected")
			$(this).css("background", COLORS_MID[Number($(this).data("color"))])
			if(DB.currentEditingEvent!==-1)
				DatabaseStub.setEventTag(DB.currentEditingEvent,$(this).data("id"),true)
		}
	})
}
function convertDate(date) {
	date = date.split("T")[0]
	return date.split("-")[2] + "/" + date.split("-")[1] + "/" + date.split("-")[0]
}
function openEditTag(){
	$("#tagwindow").removeClass("hidden")
	$("#shadow-post").removeClass("hidden")
	let html = ""
	for (const tag of DB.tags.values()) {
		html += `<div class="tag-selection" data-id=${tag.counter} data-color=${tag.color} style="background-color:${
			COLORS_MID[tag.color]
		};">
        ${tag.name}</div>`
	}
	$("#tagwindow-tags").html(html)
	$("#create-tag-btn").off()
	$("#create-tag-btn").click(async function(){
		let name=$("#tagnameinput").val()
		const color = $("#tag-color-selection").data("color")
		await DatabaseStub.addTag(name,color)
		await DatabaseStub.loadTags()
		openEditTag()
	})
}