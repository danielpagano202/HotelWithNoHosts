/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4120942869")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2091671594",
    "maxSelect": 1,
    "name": "Status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Vacant",
      "Occupied",
      "Ready For Cleaning",
      "Do Not Disturb"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4120942869")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2091671594",
    "maxSelect": 1,
    "name": "Status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Vacant",
      "Occupied",
      "Ready For Cleaning"
    ]
  }))

  return app.save(collection)
})
