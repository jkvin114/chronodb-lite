

class BoardState{
    static OrderBy=1
    static GroupBy="color"
}

async function Board() {
	DB.view = VIEW.Board
	$("#board-container").html("")

    $("#board-loading").show()
	await DatabaseStub.loadData()
    $("#board-loading").hide()
    let html=""
    let groups=new Map() //key => item[]
    let mul=BoardState.OrderBy?BoardState.OrderBy:1
    let sortedData
    let groupby=BoardState.GroupBy


    if(groupby==="importance"){
        sortedData=DB.data.toSorted((a,b)=>(b.importance-a.importance)*mul)
    }
    else{
        sortedData=DB.data.toSorted((a,b)=>(getYear(b)-getYear(a))*mul)
    }

    if(groupby === "tag"){
        populateTagGroup(groups,sortedData)
    }
    else
        populateGroup(groups,sortedData,groupby)
    


    for(const [key,items] of groups.entries()){
        const count=items.length
        let header=``
        if(groupby==="importance"){
            let stars=""
            for(let i=0;i<Number(key);++i){
                stars+=`<img src='star.png' style="width: 15px;">`
            }
            header=`<div class="board-area-header" data-key=${key} ><a>&#9654;</a>${stars}<b>Total: ${count}</b></div>`
        }
        else if(groupby==="year"){
            header=`<div class="board-area-header" data-key=${key} ><a>&#9654;</a>${key}<b>Total: ${count}</b></div>`
        }
        else if(groupby==="color"){
            header=`<div class="board-area-header"  data-key=${key} style="background:linear-gradient(to bottom,${COLORS_LIGHT[Number(key)]} 0%,${COLORS_MID[Number(key)]} 100%);"><a>&#9654;</a><b>Total: ${count}</b></div>`
        }
        else if(groupby==="tag"){
            const tag = DB.tags.get(key)
            header=`<div class="board-area-header"  data-key=${key} style="background:linear-gradient(to bottom,${COLORS_LIGHT[Number(tag.color)]} 0%,${COLORS_MID[Number(tag.color)]} 100%);">
            <a>&#9654;</a>${tag.name}<b>Total: ${count}</b></div>`
        }

        html+=`<div class="board-area">
        ${header}
        <div class="board-area-content" id=group_${key}>`
        for (const item of items.reverse()) {
            html+=getItemHtml(item,groupby)
        }
        html+=` </div></div>`
    }

    $("#board-container").html(html)
    $(".board-area-header").click(function(){
        $("#group_"+$(this).data("key")).toggle()
        $(this).children("a").toggle()
    })

    $(".board-item").click(function(){
        openPost($(this).data("id"))
    })
}
function populateGroup(groups,sortedData,groupby){

    for (const item of sortedData) {
        let key=item.color
        if(groupby==="importance"){
            key=item.importance
        }
        else if(groupby==="year"){
            key=getYear(item)
        }

        if(groups.has(key)){
            groups.get(key).push(item)
        }
        else groups.set(key,[item])
    }
}

function populateTagGroup(groups,sortedData){
    for(const tag of DB.tags.keys()){
        
        for(const item of sortedData){

            if(item.tags.has(tag)){
                if(groups.has(tag)){
                    groups.get(tag).push(item)
                }
                else groups.set(tag,[item])
            }
        }
    }
}
function getItemHtml(item,groupby){
    let emoji=item.emoji?item.emoji:""
    
    let importance_color=""
    if(item.importance>8) importance_color="red"
    else if(item.importance>6) importance_color="yellow"
    else if(item.importance>4) importance_color="green"

    let contentclass=""
    if(item.eventname.length > 9) contentclass="small"

    let exclamation = ""
    if(groupby!=="importance")
        exclamation=item.importance>2?'<img class="board-item-importance '+importance_color+'" src="alert.png">':""

    return `
    <div class="board-item" data-id=${item.counter} style="background:linear-gradient(to left,transparent 0% ,rgba(255, 255, 255, 0.4) 50%,transparent 100%),linear-gradient(to right,${COLORS_LIGHT[item.color]} 0%,${COLORS_LIGHT[item.color]} 100%);">
        <div class="board-item-content ${contentclass}">
            ${emoji+item.eventname}
            <br><a class=year>${item.eventstart.slice(0,7).replace("-",".")} ${item.isPeriod?"-"+item.eventend.slice(0,7).replace("-","."):""}</a>
        </div>
        <div class="board-item-right" >
           ${exclamation} 
        </div>
    </div>
    `
}