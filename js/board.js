

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


    for(const [key,items] of groups.entries()){
        const count=items.length
        let header=``
        if(groupby==="importance"){
            let stars=""
            for(let i=0;i<Number(key);++i){
                stars+=`<img src='star.png' style="width: 15px;">`
            }
            header=`<div class="board-area-header">${stars}<b>Total: ${count}</b></div>`
        }
        else if(groupby==="year"){
            header=`<div class="board-area-header">${key}<b>Total: ${count}</b></div>`
        }
        else{
            header=`<div class="board-area-header" style="background:linear-gradient(to bottom,${COLORS_LIGHT[Number(key)]} 0%,${COLORS_MID[Number(key)]} 100%);"><b>Total: ${count}</b></div>`

        }

        html+=`<div class="board-area">
        ${header}
        <div class="board-area-content">`
        for (const item of items.reverse()) {
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

            html+=`
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
        html+=` </div></div>`
    }

    $("#board-container").html(html)

    $(".board-item").click(function(){
        openPost($(this).data("id"))
    })
}