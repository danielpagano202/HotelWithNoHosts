/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4120942869")

  // remove field
  collection.fields.removeById("text2091671594")

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4120942869")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2091671594",
    "max": 0,
    "min": 0,
    "name": "Status",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("select2091671594")

  return app.save(collection)
})
