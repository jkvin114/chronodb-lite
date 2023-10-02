
function getIdxedDBValues(storename) {
	return new Promise((resolve, rej) => {
		const request = window.indexedDB.open("cdb") // 1. DB 열기
		request.onerror = (e) => rej(e)

		request.onsuccess = (e) => {
			const db = request.result
			const tran = db.transaction(storename)
			const objStore = tran.objectStore(storename) // 2. name 저장소 접근
			let list = []
			tran.oncomplete = () => resolve(list)

			const cursorRequest = objStore.openCursor()
			cursorRequest.onsuccess = (e) => {
				let cursor = e.target.result

				if (cursor) {
					const value = objStore.get(cursor.key) // 3. 커서를 사용해 데이터 접근
					value.onsuccess = (e) => {
						list.push(e.target.result)
					}
					cursor.continue() // 4. cursor로 순회
				}
			}
		}
	})
}

function addToListToIdxedDB(storename, list) {
	const request = window.indexedDB.open("cdb")
	request.onerror = (e) => {
		alert("DataBase error", e.target.errorCode)
	}
	request.onsuccess = (e) => {
		const db = request.result
		const tran = db.transaction(storename, "readwrite")
		// transaction으로
		const objStore = tran.objectStore(storename)

		for (const item of list) {
			//console.log(item)
			const request = objStore.add(item) // 저장
		//	request.onsuccess = (e) => console.log(e.target.result)
		}
	}
}

function getAllEventsfrom(dbid) {
	return new Promise((resolve, rej) => {
		const request = window.indexedDB.open("cdb")
		request.onerror = (e) => {
			rej("database error")
		}
		request.onsuccess = (e) => {
			const db = request.result
			const tran = db.transaction("event", "readwrite")
			// transaction으로
			const objStore = tran.objectStore("event")

			let list = []
			tran.oncomplete = () => resolve(list)

			const index = objStore.index("event")
			index.openKeyCursor(IDBKeyRange.only(dbid)).onsuccess = (e) => {
				let cursor = e.target.result

				if (cursor) {
					// console.log(cursor)
					const value = objStore.get(cursor.primaryKey) // 3. 커서를 사용해 데이터 접근
					value.onsuccess = (e) => {
						list.push(e.target.result)
					}
					cursor.continue() // 4. cursor로 순회
				}
			}
		}
	})
}

function editEvent(id, newEvent) {
	return new Promise((resolve, rej) => {
        const request =window.indexedDB.open("cdb")
		request.onsuccess = (e) => {
			const db = request.result
			const objStore = db.transaction("event", "readwrite").objectStore("event")
			objStore.get(id).onsuccess = (e) => {
				const updateRequest = objStore.put(newEvent) // 4. 수정
				updateRequest.onerror = (e) => rej("error")
				updateRequest.onsuccess = (e) => resolve()
			}
		}
	})
}
function updateEventCount(dbid,change){
    return new Promise((resolve, rej) => {
		const request =window.indexedDB.open("cdb")

         request.onsuccess = (e) => {
			const db = request.result
			const objStore = db.transaction("eventdb", "readwrite").objectStore("eventdb")
			objStore.get(dbid).onsuccess = (e) => {
                let eventdb =  e.target.result
                eventdb.count+=change
				const updateRequest = objStore.put(eventdb) // 4. 수정
				updateRequest.onerror = (e) => rej("error")
				updateRequest.onsuccess = (e) => resolve()
			}
        }
	})
}

function deleteEvent(id) {
	return new Promise((resolve, rej) => {
        const request =window.indexedDB.open("cdb")

		request.onsuccess = (e) => {
			const db = request.result
			const objStore = db.transaction("event", "readwrite").objectStore("event")
			const req = objStore.delete(id)
			req.onerror = () => rej("error")
			req.onsuccess = () => resolve()
		}
	})
}

class LocalDatabase {
	constructor() {
		// localStorage.setItem("cdb-1234",`{"name":"testDB","desc":"test description"}`)
		// localStorage.setItem("cdb-1234-count",10)
		// localStorage.setItem("cdb-321",`{"name":"Test2","desc":"test description"}`)
		// localStorage.setItem("cdb-321-count",9)
		const idxedDB = window.indexedDB

		this.idxedDB = window.indexedDB
		if (!idxedDB) alert("This browser is not supported!")
		const request = window.indexedDB.open("cdb", 1)
		let db
		request.onupgradeneeded = (e) => {
			db = e.target.result

			const objectStore = db.createObjectStore("eventdb", { keyPath: "counter" }) // 4. name저장소 만들고, key는 id로 지정
			const objectEventStore = db.createObjectStore("event", { keyPath: "counter" }) // 4. name저장소 만들고, key는 id로 지정
			objectEventStore.createIndex("event", "dbid", { unique: false })

			request.onerror = (e) => console.error(e)
			request.onsuccess = (e) => (db = request.result) // 5. 성공시 db에 result를 저장
		}

		//  addToListToIdxedDB("eventdb",[{counter:"1234",name:"test db",desc:"wertyuiop",count:0}])
	}

	async dbList() {
		return new Promise(async (resolve, reject) => {
			$("#database-loading").hide()

			let list = await getIdxedDBValues("eventdb")
			let html = ""
			for (const item of list) {
				localStorage.setItem(item.counter+"_name",item.name)
				localStorage.setItem(item.counter+"_desc",item.desc)
				html += getDBListItem(item.counter, item.name, item.desc, item.count)
			}
			$("#databases-container").html(html)
			resolve()
		})
	}

	async hasExampleDB(){
		return new Promise(async (resolve, reject) => {

			let list = await getIdxedDBValues("eventdb")
			for (const item of list) {
				if(item.counter === "18af1c9319e") resolve(true)
			}
			resolve(false)
		})
	}

    async addDatabase(id,name,desc,count){
        if(!count) count=0
		console.log(id)
        return new Promise(async (resolve, reject) => {
			try {
                await addToListToIdxedDB("eventdb",[{name:name,desc:desc,count:count,counter:id}])
				resolve()
			} catch (e) {
				console.log(e)
				alert(e)
				reject()
			}
		})
    }
	async deleteItem(id, reload) {
		return new Promise(async (resolve, reject) => {
			try {
                DB.isRecent=false
                await deleteEvent(id)
                updateEventCount(DB.id,-1)
				if (reload) DB.reload()
				resolve()
			} catch (e) {
				alert(e)
				reject()
			}
		})
	}

	async loadData() {
		return new Promise(async (resolve, reject) => {
			if (DB.isRecent) return resolve()
            try{
                let list2 = await getAllEventsfrom(DB.id)
                // console.log(list2)
                DB.setData(list2)
                resolve()
            }
            catch(e){
                
                console.error(e)
                reject()
            }
		})
	}

        
	async createManyEventRequest(formdatas,eventObjects) {

        eventObjects=eventObjects.map(obj=>{
            obj.counter=hexId()
            obj.dbid=DB.id
            return obj
        })
        console.log(eventObjects)
        return new Promise(async (resolve, reject) => {
			try {
                DB.isRecent=false
                await addToListToIdxedDB("event",eventObjects)
                updateEventCount(DB.id,eventObjects.length)
				resolve()
			} catch (e) {
				alert(e)
				reject()
			}
		})
    }


	async createEventRequest(formdata,eventObj) {
        eventObj.counter=hexId()
        eventObj.dbid=DB.id
        return new Promise(async (resolve, reject) => {
			try {	
                DB.isRecent=false
                await addToListToIdxedDB("event",[eventObj])
                DB.reload()
                updateEventCount(DB.id,1)
				closeEdit()
				resolve()
			} catch (e) {
				alert(e)
				reject()
			}
		})
    }

	async editEventRequest(formdata,eventObj,id) {
        eventObj.counter=id
        eventObj.dbid=DB.id
        return new Promise(async (resolve, reject) => {
			try {
                DB.isRecent=false
                await editEvent(id,eventObj)
                DB.reload()
				closeEdit()
				resolve()
			} catch (e) {
				alert(e)
				reject()
			}
		})

    }
}
