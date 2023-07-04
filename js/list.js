
const MONTHS=["January","February","March","April",
"May","June","July","August","September","October","November","December"]
const MONTHS_KOR=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"]

async function ListView(){
    
    $("#list-loading").show()

	DB.view = VIEW.List
	await DatabaseStub.loadData()
  
    $("#list-loading").hide()
    let html=""
    let curryear=""
    let currmonth=""
    for (const item of DB.data.reverse()) {
        let year=item.eventstart.slice(0,4)
        if(year!==curryear){
            html+=`<hr><h3>${year}</h3>`
            curryear=year
            currmonth=""
        }
        if(item.isPeriod===1){
            html+=`<br><h5>${item.eventname}<img src="search.svg" style="width:1em;" class='list-post-btn' data-id=${item.counter}></h5>`
            html+=`<b>${item.eventstart.slice(0,7)} ~ ${item.eventend.slice(0,7)}</b>`
            html+=`<p>${item.desctext}</p>`
        }
        else{
            let month=item.eventstart.slice(5,7)
            if(month!==currmonth){
                html+=`<b>${MONTHS_KOR[Number(month)-1]}</b>`
                currmonth=month
            }
            if(item.eventend){
                html+=`<li>${item.eventname}(~${item.eventend.slice(0,7)})<img src="search.svg" style="width:1em;" class='list-post-btn' data-id=${item.counter}></li>`
            }
            else{
                html+=`<li>${item.eventname}<img src="search.svg" style="width:1em;" class='list-post-btn' data-id=${item.counter}></li>`
            }

            if(!isEmpty(item.desctext)){
                html+=`<ul><li class='desc'>${item.desctext}</li></ul>`
            }
        }
    }
    
    DB.data.reverse() //reerse back the data
    $("#list-container").html(html)
    $(".list-post-btn").click(function(){
        openPost($(this).data("id"))
    })
}