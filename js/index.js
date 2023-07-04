const VIEW = {
	Timeline: "timeline",
	Table: "table",
	Album: "album",
	Board: "board",
	Blog: "blog",
	Gallery: "gallery",
	List: "list",
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
		this.name = ""
		this.desc = ""
	}
	setData(data) {
		this.data = data.sort((a, b) => {
			return new Date(b.eventstart).valueOf() - new Date(a.eventstart).valueOf()
		})
		for (const d of data) {
			this.datamap.set(d.counter, d)
		}
	}
	setTags(tags) {
		for (const d of tags) {
			this.tags.set(d.id, d)
		}
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
	downloadObjectAsJson({ items: DB.data }, "database_" + DB.id)
}
async function uploadData(data) {
	const items = JSON.parse(data).items
	DB.id = hexId()
	try {
		if (!items || items.length == 0 || items[0].eventstart == null) {
			alert("invalid format")
			return
		}
		if(!$("#database-name-input").val()){
			alert("choose a name for database")
			return
		}
		await DatabaseStub.addDatabase(DB.id, $("#database-name-input").val()
		, $("#database-desc-input").val())
		await DatabaseStub.createManyEventRequest(null, items)
		alert("import complete!")
		DatabaseStub.dbList()
	} catch (e) {
		alert("import failed" + e)
	}
}
async function createDatabase(){
	if(!$("#database-name-input").val()){
		alert("choose a name for database")
		return
	}
	await DatabaseStub.addDatabase(DB.id, $("#database-name-input").val()
	, $("#database-desc-input").val())
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
	$("#postwindow").html(html)
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

	if (id !== undefined) {
		$("#editwindow h2").html("Edit Event")
		$("#submit-event-edit").show()
		$("#submit-event-edit").data("id", id)
		$("#submit-event").hide()
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
			quill.setContents(data.eventdesc)
		}
		if (data.thumbnail) {
			$("#thumbnail").html("<img src='./uploads/" + data.thumbnail + "'>")
		}
		$("#useemoji").prop("checked", data.emojiThumbnail === 1)
		if (data.isPeriod) {
			$("#type-period").prop("selected", true)
			$("#type-event").prop("selected", false)
		} else {
			$("#type-period").prop("selected", false)
			$("#type-event").prop("selected", true)
		}
	} else {
		$("#submit-event-edit").hide()
		$("#submit-event").show()
		$("#editwindow h2").html("Add New Event")
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
	formdata.append("tags", event.tags)

	if (!Database.IsLocal) {
		const image = $("#input-image")[0].files[0]
		// console.log(image)
		if (image) formdata.append("img", image)
		else if (id !== undefined && DB.datamap.get(id).thumbnail) {
			formdata.append("thumbnail", DB.datamap.get(id).thumbnail)
		}
	}

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
		html += `<div class="tag-selection" data-id=${tag.id} data-color=${tag.color} style="background-color:${
			COLORS_LIGHT[tag.color]
		};">
        <img src="check.png">${tag.name}</div>`
	}
	$("#tagarea").html(html)
	$(".tag-selection").click(function () {
		if (!$(this).data("id") || !$(this).data("color")) return

		if ($(this).hasClass("selected")) {
			$(this).css("background", COLORS_LIGHT[Number($(this).data("color"))])
			$(this).removeClass("selected")
		} else {
			$(this).addClass("selected")
			$(this).css("background", COLORS_MID[Number($(this).data("color"))])
		}
	})
}
function convertDate(date) {
	date = date.split("T")[0]
	return date.split("-")[2] + "/" + date.split("-")[1] + "/" + date.split("-")[0]
}
