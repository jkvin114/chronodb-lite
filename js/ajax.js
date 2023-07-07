

class ServerConnection{

	constructor(){

	}

	async dbList () {
		$("#database-loading").show()
		try {
			const data = await (await fetch("/db/all")).json()
			let str = ""
			for (let i = 0; i < data.items.length; ++i) {
				str += getDBListItem(data.items[i].counter,
					data.items[i].title,data.items[i].desc,data.counts[i])

				localStorage.setItem(data.items[i].counter+"_name",data.items[i].title)
				localStorage.setItem(data.items[i].counter+"_desc",data.items[i].desc)
			}
			$("#databases-container").html(str)
			$("#database-loading").hide()
		} catch (e) {
			alert("Error!")
			console.error(e)
			return
		}
	}
	async deleteItem(id,reload) {
		try {
			let result = await fetch("/db/event/" + id + "/delete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			})
			console.log(result)
			if (result.ok) {
				DB.isRecent = false
				if(reload)
					DB.reload()
			} else {
				alert("Failed to delete event!")
			}
		} catch (e) {
			alert(e)
		}
	}

	async loadData() {
		this.loadTags()
		if (DB.isRecent) return
		try {
			DB.setData((await (await fetch("/db/" + DB.id + "/events")).json()).items)
			
			DB.isRecent = true
		} catch (e) {
			alert("Error!")
			console.error(e)
			return
		}
	}
	async loadTags() {
		try {
			const tags = (await (await fetch("/db/" + DB.id + "/tags")).json()).items
			DB.setTags(tags)
			drawTags()
		} catch (e) {
			alert("Error!")
			console.error(e)
			return
		}
	}


	async createEventRequest(formdata,eventObj){
		try {
			let result = await fetch("/db/" + DB.id + "/event", {
				method: "POST",
				headers: {
					// "Content-Type": "application/json",
				},
				body: formdata,
			})
			console.log(result)
			if (result.ok) {
				DB.isRecent = false
				DB.reload()
				closeEdit()
			//	alert("Successfully created event " + event.eventname)
			} else {
				alert("Failed to create event!")
			}
		} catch (e) {
			alert(e)
		}
	}

	async addDatabase(id,name,desc){
        
    }
	async createManyEventRequest(formdatas,eventObjects){

	}
	async editEventRequest(formdata,eventObj,id){
		try {
			let result = await fetch("/db/event/" + id + "/edit", {
				method: "POST",
				body: formdata,
			})
			if (result.ok) {
				DB.isRecent = false
				DB.reload()
				closeEdit()
			//	alert("Successfully edited event " + event.eventname)
			} else {
				alert("Failed to edit event!")
			}
		} catch (e) {
			alert(e)
		}
	}

}







