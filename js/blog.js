function getBlogPost(item,index)
{
	let emoji=""
	if(item.emoji) emoji=`<b class="blog-cover-emoji">${item.emoji}</b>`
	let stars=""
	for(let j=0;j<item.importance;++j){
		stars+="<img src='star.png'>"
		if(j===4) stars+="<br>"
	}
	let date=item.eventstart.slice(0,10)
	if(item.eventend){
		date+=" ~ "+item.eventend.slice(0,10)
	}

	return `      
	<div class="blog-post">
		<div class="blog-cover" style="background:linear-gradient(to bottom,${COLORS_DARK[item.color]},${
			COLORS_MID[item.color]
		});">
			${emoji}
			<b class="blog-cover-stars">${stars}</b>
		</div>
		<div class="blog-header">
			<h1>${item.eventname}</h1>
			<b class="blog-header-date">${date}</b><br>
			${allTags(item.tags)}
			<hr>
			<div class="blog-header-btns">
				<img src="edit.svg" class='blog-edit' data-id=${item.counter} title="edit event">
				<img src="trash.svg" class='blog-delete' data-id=${item.counter} data-name=${item.eventname} title="delete event">
			</div>
		</div>
		<div id="blog-post-${index}" class="blog-content">

		</div>
	</div>`
}

function populatePostContent(item,index){
	if(isEmpty(item.desctext) && !item.thumbnail) {
		
		document.getElementById("blog-post-"+index).innerHTML='<p style="padding:10px;">[No Content]</p>'
		return
	}
	if(!isEmpty(item.desctext) && isEmpty(item.eventdesc)){
		document.getElementById("blog-post-"+index).innerHTML=`<p style="padding:10px;">${item.desctext}</p>`
		console.log(item.desctext)
		if(item.thumbnail){
			$(`#blog-post-${index}`).prepend(`<img class='blog-img' src="${getImgSrc(item.thumbnail)}" data-src="${getImgSrc(item.thumbnail)}">`)
		}
	}
	else{
		const blogquill = new Quill(document.getElementById("blog-post-"+index), {
			theme: "snow",
			bounds: ".blog-post",
			modules: {
				toolbar: false,
			},
		})
		blogquill.setContents(item.eventdesc)
		blogquill.enable(false);
		if(item.thumbnail){
			$(`#blog-post-${index} .ql-editor`).prepend(`<img class='blog-img' src="${getImgSrc(item.thumbnail)}" data-src="${getImgSrc(item.thumbnail)}">`)
		}
	}
	
}

function addPostBtnEvent(){
	$(".blog-edit").off()
	$(".blog-delete").off()
	$(".blog-edit").click(function(){
		openEdit($(this).data("id"))
	})
	$(".blog-delete").click(function(){
		if (confirm('Delete "' + $(this).data("name") + '"?')) {
			DatabaseStub.deleteItem($(this).data("id"),true)
		} 
	})
}

async function Blog(){
    
	$("#blog-loading").show()
	DB.view = VIEW.Blog
	await DatabaseStub.loadData()
	$("#blog-loading").hide()
	let html=``
	for(const [i,item] of DB.data.entries()){
		html+=getBlogPost(item,i)
	}
	$("#blog-container").html(html)
	addPostBtnEvent()

	for(const [i,item] of DB.data.entries()){
		
		populatePostContent(item,i)
	}
	$(".blog-img").off()
	$(".blog-img").click(function(){
		focusImage($(this).data("src"),"",$(this).height()/$(this).width())
	  });
}