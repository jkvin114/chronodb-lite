async function checkYTVideo(){
    let url = $("#bgm-url-input").val()
    try{

        const data = await(await fetch("https://noembed.com/embed?dataType=json&url="+url)).json()
        let title=data.title
        let author = data.author_name
        const id = data.html.match(/www.youtube.com\/embed\/(.+)\?feature=oembed/)[1]
        console.log(id)
        $("#bgm-url-input").data("url",id)
        $("#yt-title").html(title + " - "+author)
        // $("#yt-thumbnail").html(`<img src="${data.thumbnail_url}">`)
        $("#yt-thumbnail").html(`<div id="yt-player-editor"></div>`)
        setYTVideo("yt-player-editor",id,0)
    }
    catch(e){
        console.error(e)
        alert("Failed to retrieve youtube url!")
        $("#yt-title").html("")
        $("#yt-thumbnail").html(``)
    }
}

var player
function onYouTubeIframeAPIReady() {

}

function setYTVideo(elemId,id,start){
    maximizeYTWidget()
    

    $("#yt-widget").removeClass("hidden")
	if(!start) start=40
	player = new YT.Player(elemId, {
		height: "200",
		width: "300",
		videoId: id,
		playerVars: {
			playsinline: 1,
			start:start,
		},
		autoplay:1,
		origin:window.location.href,
		// mute: 1,
	})

}

function maximizeYTWidget(){
    $(".yt-player-container").removeClass("small")
    $("#yt-widget-maximize").addClass("hidden")
    $("#yt-widget-minimize").removeClass("hidden")
}
function minimizeYTWidget(){
    $(".yt-player-container").addClass("small")
    $("#yt-widget-maximize").removeClass("hidden")
    $("#yt-widget-minimize").addClass("hidden")
}
function removeYTWidget(){
    $(".yt-player-container").html(`<div id="yt-player"></div>`)
    $("#yt-widget").addClass("hidden")
}