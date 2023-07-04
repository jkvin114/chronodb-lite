
function tagHtml(id){
	const tag=DB.tags.get(Number(id))
	if(!tag) return ""
	return `<div class='tag-selection selected' style="background-color:${
		COLORS_LIGHT[Number(tag.color)]
	};">${tag.name}</div>`
}
function allTags(tags){
	let html=""
	for(const t of tags.split(",")){
		html+=tagHtml(t)
	}
	return "<div>"+html+"</div>"
}
async function Table() {
	DB.view = VIEW.Table
	$("#table-container").html("")
//	$("#section-timeline").addClass("hidden")
//	$("#section-table").removeClass("hidden")
//	$(".nav-link").toggleClass("active")
    $("#table-loading").show()
	await DatabaseStub.loadData()
	setTimeout(()=>$("#table-loading").hide(),300)
    
	window.scrollTo(0, 0)
	let tabledata = []
	for (const item of DB.data) {
		let emoji = item.emoji ? item.emoji : ""
		let t=allTags("2,1,0")

		let name=`<b class='table-name' data-id=${item.counter}>${emoji + " " + item.eventname}</b>`
		tabledata.push({
			id: item.counter,
			name: name,
			importance: item.importance,
			start: item.eventstart.slice(0, 10),
			end: item.eventend ? item.eventend.slice(0, 10) : "",
			tags: t,
			length: dayLength(item.eventstart, item.eventend),
		})
	}

	let table = new Tabulator("#table-container", {
		data: tabledata, //load row data from array
		layout: "fitColumns", //fit columns to width of table
		responsiveLayout: "hide", //hide columns that don't fit on the table
		addRowPos: "top", //when adding a new row, add it to the top of the table
		history: true, //allow undo and redo actions on the table
		pagination: "local", //paginate the data
		paginationSize: 50, //allow 7 rows per page of data
		paginationCounter: "rows", //display count of paginated rows in footer
		movableColumns: false, //allow column order to be changed
		initialSort: [
			//set the initial sort order of the data
			{ column: "start", dir: "asc" },
		],
		columnDefaults: {
			tooltip: true, //show tool tips on cells
		},
		columns: [
			//define the table columns
			{ title: "Name", field: "name", editor: false, formatter: "html" },
			{ title: "Start", field: "start", hozAlign: "center", maxWidth: 130, formatterParams: { inputFormat: "iso" } },
			{
				title: "Importance",
				field: "importance",
				hozAlign: "left",
				formatter: "progress",
				editor: false,
				formatterParams: {
					legend: true,
					legendColor: "#000000",
					legendAlign: "left",
					min: 0,
					max: 10,
					color: [COLORS_LIGHT[8],COLORS_MID[8],COLORS_DARK[8]],
				},
			},
			{ title: "End", field: "end", hozAlign: "center", maxWidth: 130, formatterParams: { inputFormat: "iso" } },
			{ title: "Days", field: "length", hozAlign: "center", maxWidth: 70 },
			{ title: "Tags", field: "tags", hozAlign: "center", formatter: "html" },
		],
	})
	table.on("cellClick", function(e, cell){
        //e - the click event object
        //cell - cell componen
		if(cell.getField()==="name"){

			var row = cell.getRow()
			var rowIndex = row.getIndex();
			openPost(rowIndex)
		}
	});
}