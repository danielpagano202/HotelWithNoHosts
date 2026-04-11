/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2901257340")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select765557111",
    "maxSelect": 1,
    "name": "User",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "AI",
      "User",
      "Staff"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2901257340")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select765557111",
    "maxSelect": 1,
    "name": "User",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "AI"
    ]
  }))

  return app.save(collection)
})
