/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3905696460")

  // remove field
  collection.fields.removeById("relation2114104832")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select4133540203",
    "maxSelect": 1,
    "name": "severity",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "low",
      "medium",
      "high"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3905696460")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2190056601",
    "hidden": false,
    "id": "relation2114104832",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "admin",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("select4133540203")

  return app.save(collection)
})
