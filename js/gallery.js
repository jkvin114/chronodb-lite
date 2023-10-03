function focusImage(src,name,imgratio){
  let winratio=window.innerHeight/window.innerWidth
  $("body").append(`
    <div id="imageview">
      <b class=imageview-text>${name}</b>
      <img src="${src}">
    </div>
  `)
  if(winratio < imgratio){
    $("#imageview img").css("height","100%")
    $("#imageview img").css("width","auto")
  }
  
  $("html").css("overflow","hidden")

  $("#imageview").click(function(){
    $("#imageview").remove()
    $("html").css("overflow","auto")
  })
}

async function Gallery() {
  $("#gallery-loading").show()

	DB.view = VIEW.Album
	await DatabaseStub.loadData()
  
  $("#gallery-loading").hide()

	window.scrollTo(0, 0)
	let html=""
	for (const item of DB.data) {
        if(item.thumbnail!=null && !isEmpty(item.thumbnail)){
            html+=`<a class=gallery-item data-src='${getImgSrc(item.thumbnail)}' data-name='${item.eventname}'><img  src="${getImgSrc(item.thumbnail)}"></a>`
        }
    }
    $("#gallery-container").html(html)
    if(html===""){
        $("#gallery-container").html(`<img class='empty-gallery-img' src="./empty.png" alt="image">`)
    }

    $(".gallery-item").click(function(){
        console.log("imageclick")
        focusImage($(this).data("src"),$(this).data("name"),$(this).height()/$(this).width())
      });
}