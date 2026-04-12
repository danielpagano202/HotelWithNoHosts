/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4043172148")

  // remove field
  collection.fields.removeById("relation1320872079")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4043172148")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2190056601",
    "hidden": false,
    "id": "relation1320872079",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "notification_admin",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
