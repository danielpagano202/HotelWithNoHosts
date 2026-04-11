/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861403772")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4120942869",
    "hidden": false,
    "id": "relation1827854287",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "roomkey_room",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3861403772")

  // remove field
  collection.fields.removeById("relation1827854287")

  return app.save(collection)
})
