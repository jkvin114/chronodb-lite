
function item_moment(content, id, colorId, imp, icon) {
	if (!icon) icon = ""
	imp = Math.max(1, Math.min(10, imp))
	if (!DB.visualize_importance) imp = 5

	return (
		`<div data-id=${id} id="event-${id}" class='event event-moment imp-${imp}' data-color=${colorId} data-type=item data-clicked=0` +
		` style="background-color:${COLORS_LIGHT[colorId]};"/>${icon}${parsecontent(content)}</div>`
	)
}

function item_range(content, id, colorId, imp, icon) {
	if (!icon) icon = ""
	imp = Math.max(1, Math.min(10, imp))
	if (!DB.visualize_importance) imp = 5

	return (
		`<div data-id=${id} id="event-${id}" class='event event-range imp-${imp}' data-color=${colorId} data-type=item data-clicked=0` +
		` style="background:linear-gradient(to left,${COLORS_LIGHT[colorId]},${
			COLORS_MID[colorId]
		});"/>${icon}${parsecontent(content)}</div>`
	)
}

function item_period(content, id, colorId, imp, icon) {
	if (!icon) icon = ""
	imp = Math.max(1, Math.min(10, imp))
	if (!DB.visualize_importance) imp = 5

	return (
		`<div data-id=${id} id="event-${id}" class='event event-period imp-${imp}' data-color=${colorId} data-type=item data-clicked=0` +
		` style="background:linear-gradient(to top,${COLORS_LIGHT[colorId]},${
			COLORS_MID[colorId]
		});"/>${icon}${parsecontent(content)}</div>`
	)
}
function addimg(img) {
	return `<img class=eventimg src="${img}">`
}
function addemoji(emoji) {
	//129424
	return `<b class=eventemoji>${emoji}</b>`
}
function parsecontent(content) {
	let sliced = ""
	if (content.length > 40) {
		sliced = content.slice(0, 40) + ".."
	} else sliced = content
	return `<a title=${content}>${sliced}</a>`
}

function tooltipContent(name, content, start, end) {
	let text = content
	if (text.length > 200) text = content.slice(0, 200) + ".."

	return `<div class=tooltip-content>${name}<hr>
    ${text !== "" ? "<a class=tooltip-desc>" + text + "</a><hr>" : ""}
        <div class=tooltip-date>
            ${start.split("T")[0]}${end ? "~" + end.split("T")[0] : ""}
        </div>
    </div>`
}

async function Timeline() {
	DB.view = VIEW.Timeline
	//$("#section-timeline").removeClass("hidden")
//	$("#section-table").addClass("hidden")
	//$(".nav-link").toggleClass("active")
	$("#timeline-container").html("")
    $("#timeline-loading").show()
	await DatabaseStub.loadData()
	setTimeout(()=>$("#timeline-loading").hide(),500)
	window.scrollTo(0, 0)
	const container = document.getElementById("timeline-container")
	var options = {
		// height: "400px",
		// width: "100%",
		minHeight: 300,
		margin: {
			item: 4,
			axis: 10,
		},
		order: (i1, i2) => {
			// console.log(i1.data.order)
			return i2.order - i1.order
			//return i1.type === "range" ? 1 : -1
		},
		editable: {
			remove: true,
		},
		selectable: true,
		format: {
			minorLabels: {
				millisecond: "SSS",
				second: "s",
				minute: "HH:mm",
				hour: "HH:mm",
				weekday: "ddd D",
				day: "D",
				week: "w",
				month: "MM",
				year: "YYYY",
			},
			majorLabels: {
				millisecond: "HH:mm:ss",
				second: "D MM HH:mm",
				minute: "ddd D MM",
				hour: "ddd D MM",
				weekday: "MM YYYY",
				day: "MM YYYY",
				week: "MM YYYY",
				month: "YYYY",
				year: "",
			},
		},
		showCurrentTime: false,
		onRemove: function (item, callback) {
			if (confirm('Delete "' + item.name + '"?')) {
				DatabaseStub.deleteItem(item.id)
				callback(item)
			} else callback(null)
		},
	}
	const items = [
	]

	for (const item of DB.data) {
		if (item.eventend && item.isPeriod) {
			let content = item_period(item.eventname, item.counter, item.color, item.importance)
			if (item.thumbnail && item.emojiThumbnail === 0) {
				content = item_period(item.eventname, item.counter, item.color, item.importance, addimg(getImgSrc(item.thumbnail)))
			} else if (item.emoji && item.emoji !== "undefined") {
				content = item_period(item.eventname, item.counter, item.color, item.importance, addemoji(item.emoji))
			}

			items.push({
				id: item.counter,
				content: content,
				className: "period eventitem-" + item.counter,
				start: item.eventstart.split("T")[0],
				end: item.eventend.split("T")[0],
				order: item.importance + 20,
				name: item.eventname,
			})
		} else if (item.eventend) {
			let content = item_range(item.eventname, item.counter, item.color, item.importance)
			if (item.thumbnail && item.emojiThumbnail === 0) {
				content = item_range(item.eventname, item.counter, item.color, item.importance, addimg(getImgSrc(item.thumbnail)))
			} else if (item.emoji && item.emoji !== "undefined") {
				content = item_range(item.eventname, item.counter, item.color, item.importance, addemoji(item.emoji))
			}
			items.push({
				id: item.counter,
				content: content,
				className: "color-range eventitem-" + item.counter,
				start: item.eventstart.split("T")[0],
				end: item.eventend.split("T")[0],
				order: item.importance + 10,
				name: item.eventname,
			})
		} else {
			let content = item_moment(item.eventname, item.counter, item.color, item.importance)
			if (item.thumbnail && item.emojiThumbnail === 0) {
				content = item_moment(item.eventname, item.counter, item.color, item.importance, addimg(getImgSrc(item.thumbnail)))
			} else if (item.emoji && item.emoji !== "undefined") {
				content = item_moment(item.eventname, item.counter, item.color, item.importance, addemoji(item.emoji))
			}
			let type = "box"
			let classname="eventitem-" + item.counter
			if (item.importance < 4) classname+=" event-light"
			items.push({
				id: item.counter,
				content: content,
				className: classname,
				start: item.eventstart.split("T")[0],
				order: item.importance,
				type: type,
				name: item.eventname,
			})
		}
	}

	const timeline = new vis.Timeline(container, new vis.DataSet(items), options)
	timeline.on("select", function (properties) {
		// console.log(properties.event);
		$(".edit-item").remove()
		if (properties.event.firstTarget.className === "edit-item") {
			openPost(properties.items[0])

			properties.event.stopPropagation()
			properties.event.preventDefault()
		} else {
			$(".edit-item").remove()
			$(".eventitem-" + properties.items[0])
				.not(".vis-dot")
				.not(".vis-line")
				.append(`<img data-id=${properties.items[0]} class='edit-item' src='search.svg'>`)
		}
	})

	for (const item of DB.data) {
		let text = item.desctext ? item.desctext : ""

		tippy("#event-" + item.counter, {
			content: tooltipContent(item.eventname, text, item.eventstart, item.eventend),
			allowHTML: true,
		})
	}

	// $("#saveimg").off()
	// $("#saveimg").click(function(){
	// 	html2canvas(document.getElementById("timeline-container")).then(
	// 		function (canvas) {
	// 			document
    //                 .getElementById('section-timeline')
    //                 .appendChild(canvas);
	// 		})

	// })
	// $(".event").off()
	// $(".event-moment").hover(function(){
	//     console.log("Sd")
	//     console.log($(this).data("eventid"))
	//     console.log($(this).data("color"))
	//     if($(this).data("clicked")==0){
	//         $(this).css("background-color",COLORS_DARK[Number($(this).data("color"))])
	//         $(this).data("clicked",1)
	//     }
	//     else{
	//         $(this).data("clicked",0)
	//         $(this).css("background-color",COLORS_LIGHT[Number($(this).data("color"))])
	//     }
	// })
}