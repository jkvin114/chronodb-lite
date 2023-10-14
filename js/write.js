

function openEdit(id) {
	// console.log("edit" + id)
	$("#pickemoji").html('<img src="smile.svg">')
	$("#pickemoji").data("emoji", null)
	$("#preview-emoji").html("")
	$("#image-url-input").val("")
    $("#bgm-url-input").val("")
    $("#yt-title").html("")
    $("#yt-thumbnail").html(`<div id="yt-player-editor"></div>`)
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
    const bgm = $("#bgm-url-input").data("url")
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
		thumbnail:null,
        videoId:bgm
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
    formdata.append("videoId", event.videoId)
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
