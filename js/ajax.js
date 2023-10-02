

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
		if (DB.isRecent) return
		try {
			DB.setData((await (await fetch("/db/" + DB.id + "/events")).json()).items)
			
			DB.isRecent = true

			await this.loadTags()
		} catch (e) {
			alert("Error!")
			console.error(e)
			return
		}
	}
	async loadTags() {
		try {
			const tags = (await (await fetch("/db/" + DB.id + "/tags")).json())
			DB.setTags(tags)
			drawTags()
		} catch (e) {
			alert("Error!")
			console.error(e)
			return
		}
	}

	async deleteTag(id){
		
		try {
			let result = await fetch("/db/" + DB.id + "/tag/delete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",

				},
				body: JSON.stringify({id:id})
			})
			if (result.ok) {
			} else {
				alert("Failed to delete tag!")
			}
		} catch (e) {
			alert(e)
		}
	}

	async addTag(name,color){
		try {
			let result = await fetch("/db/" + DB.id + "/tag/add", {
				method: "POST",
				headers: {
					 "Content-Type": "application/json",
				},
				body: JSON.stringify({
					name:name,color:color
				})
			})
			console.log(result)
			if (result.ok) {
				const data=await result.json()
				return data.id
			} else {
				alert("Failed to add tag!")
			}
		} catch (e) {
			alert(e)
		}
	}

	async setEventTag(event,tag,isOn){
		const url="/db/" + DB.id + "/tag/event/"+(isOn?"on":"off")
		try {
			let result = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					event:event,tag:tag
				}),
			})
			console.log(result)
			if (result.ok) {
			} else {
				alert("Failed to set event tag!")
			}
		} catch (e) {
			alert(e)
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
        alert("operation not supported")
    }
	async createManyEventRequest(formdatas,eventObjects){
		alert("operation not supported")
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







