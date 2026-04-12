/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2901257340")

  // remove field
  collection.fields.removeById("autodate3133418153")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation722422536",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user_chat",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select765557111",
    "maxSelect": 1,
    "name": "sender",
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

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "autodate3133418153",
    "name": "sent",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation722422536",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "chat_user",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(3, new Field({
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
