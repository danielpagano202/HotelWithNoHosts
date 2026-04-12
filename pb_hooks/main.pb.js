/*onRecordUpdate((recordUpdateEvent) => {
    let currentRecord = recordUpdateEvent.record;
    
    // Get the record ID and collection name
    let id = currentRecord.get("id");
    let collection = currentRecord.collection().name;

    // Check for isArray or isMap fields
    let isArray = currentRecord.getString("isArray").replace(/\s+/g, "");
    let isMap = currentRecord.getString("isMap").replace(/\s+/g, "")

    // Process array updates
    if(isArray.length > 0){
        const raw = currentRecord.getString("isArray").replace(/\s+/g, "");
        const [listName, indexStr] = raw.split(".");

        const oldRecord = $app.dao().findRecordById(collection, id);
        const oldArray = JSON.parse(oldRecord.getString(listName) || "[]");
        const newValue = JSON.parse(currentRecord.getString(listName) || "[]");

        if (!Array.isArray(oldArray)) {
            console.error(`${listName} is not an array`);
            return;
        }

        // Insert at specific index
        if (indexStr !== undefined) {
            const index = parseInt(indexStr, 10);
            if (Number.isNaN(index) || index < 0 || index > oldArray.length) {
                console.error("Index out of bounds for array insertion");
                return;
            }

            oldArray.splice(index, 0, newValue);
            currentRecord.set(listName, oldArray);
        }
        // Otherwise concatenate arrays
        else {
            if (!Array.isArray(newValue)) {
            console.error("New value is not an array");
            return;
            }

            currentRecord.set(listName, oldArray.concat(newValue));
        }

        // Reset trigger
        currentRecord.set("isArray", "");
    }else{
        //console.log("Not array");
    }
    if(isMap.length > 0){
        //Gets the field of the map
        // split not needed if we don't do specific key updates, but leaving for future proofing
        let objName = currentRecord.getString("isMap").split(".")[0];

        //Gets the old record and gets the current map values
        let oldRecordMap = $app.dao().findRecordById(collection, id);
        let oldParsedField = JSON.parse(oldRecordMap.getString(objName));
        let newParsedField = JSON.parse(currentRecord.getString(objName));

        //Combines the two maps
        let finalCombinedField = {...oldParsedField, ...newParsedField};

        //Sets the combined map to the current record
        currentRecord.set(objName, finalCombinedField);

        //Resets new map to ensure no extra calls are sent
        currentRecord.set("isMap", "")
    }else{
        //console.log("Not a map update!");
    }
    recordUpdateEvent.next();
})*/

//TODO: Get rid of hashtags

cronAdd("remove_guests", "0 0 * * *", () => {
  let records = $app.findRecordsByFilter(
    "users",
    "isAnonymous = true && created < @yesterday",
  );
  console.log(`Removing ${records.length} guest accounts`);
  for (let record of records) {
    $app.delete(record);
  }
});
cronAdd("remove_oldRooms", "0 0 * * *", () => {
  let records = $app.findRecordsByFilter("gamerooms", "created < @yesterday");
  console.log(`Removing ${records.length} old rooms`);
  for (let record of records) {
    $app.delete(record);
  }
});
cronAdd("remove_oldPlayers", "0 0 * * *", () => {
  let records = $app.findRecordsByFilter("players", "created < @yesterday");
  console.log(`Removing ${records.length} old rooms`);
  for (let record of records) {
    $app.delete(record);
  }
});
