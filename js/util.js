function isEmpty(text){
    // console.log(text)
    if(typeof(text)!=="string") return true
    if(!text) return true
    return text.replace(/\s/g, '').length===0
}

function dayLength(start, end) {
	if (!end) return 1
	let sdate = new Date(start).valueOf()
	let edate = new Date(end).valueOf()
	return Math.floor((edate - sdate) / (1000 * 3600 * 24))
}
function getYear(item){
    return Number(item.eventstart.slice(0,4))
}
function hexId(){
    return Math.floor(Date.now()+Math.random()*1000000).toString(16).padEnd(10, "0")
}
function getMidTime(item){
    if(!item.eventend)
        return new Date(item.eventstart).valueOf()

    return (new Date(item.eventstart).valueOf() + new Date(item.eventend).valueOf())/2
}

function getDBListItem(id,title,description,count){
    return `
    <a href="?db=${id}" class="list-group-item list-group-item-action flex-column align-items-start">
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">${title}</h5>
          <small>${count} Events</small>
        </div>
        <small>${description}</small>
      </a>`
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  
function tagHtml(id){
	const tag=DB.tags.get(Number(id))
	if(!tag) return ""
	return `<div class='tag-selection selected' style="background-color:${
		COLORS_MID[Number(tag.color)]
	};">${tag.name}</div>`
}
function allTags(tags){
	let html=""
	for(const t of tags){
		html+=tagHtml(t)
	}
	return "<div>"+html+"</div>"
}

function isImageRemote(imageurl){
    return (imageurl.slice(0,4) === "http" || imageurl.slice(0,4) === "data")
}
function getImgSrc(image){
    let src=isImageRemote(image) ? image : `./uploads/${image}`
    return src
}