async function Album() {
    
	DB.view = VIEW.Album
	$("#album-container").html("")
    $("#album-loading").show()
	await DatabaseStub.loadData()
    
	window.scrollTo(0, 0)
	let html=""
	for (const item of DB.data) {

        html+=`<div class="album-item" data-id=${item.counter}>
        <div class="album-tag">${allTags(item.tags)}</div>`
        if(item.thumbnail){
            // let src=isImageRemote(item.thumbnail) ? item.thumbnail : `./uploads/${item.thumbnail}`
            html+=`
            <div class="card-img-top">
                <img class="card-thumbnail" src="${getImgSrc(item.thumbnail)}" alt="image">
            </div>`
        }
        else{
            let text = item.desctext?item.desctext:""
            if(!text.replace(/\s/g, '').length)
            {
                html+=`
                <div class="card-img-top noimage">
                <img class="card-empty-image" src="./empty.png" alt="image">
                </div>`
            }
            else{
                if (text.length > 100) text = text.slice(0, 100) + ".."
                html+=`
                <div class="card-img-top noimage">
                    <li>${text}</li>
                </div>`
            }
	        
        }
        let emoji = item.emoji ? item.emoji+" " : ""

        let color=item.color
        if(!item.color) color=0

        let highlight_color = COLORS_LIGHT[color]
        if(item.importance>=7) highlight_color=COLORS_DARK[color]
        else if(item.importance>=4) highlight_color=COLORS_MID[color]


        html+=`
        <div class="album-item-body" style="background-color:${COLORS_LIGHT[color]};">
            <div class="album-item-body-color" style="background-color:${highlight_color};">
            </div>
        <div class="album-item-body-text">
          <b class="album-item-name">${emoji + item.eventname}</b><br>
          <b class="album-item-date">${item.eventstart.split("T")[0]}${item.eventend ? "~" + item.eventend.split("T")[0] : ""}</b>
        </div>
      </div></div>
        `
    }
    $("#album-container").html(html)
    $("#album-loading").hide()
    $(".album-item").click(function(){
        openPost($(this).data("id"))
    })
}