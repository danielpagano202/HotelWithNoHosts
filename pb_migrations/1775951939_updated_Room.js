/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4120942869")

  // remove field
  collection.fields.removeById("relation568282829")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation4002888749",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "room_user",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4120942869")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3245856272",
    "hidden": false,
    "id": "relation568282829",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "room_customer",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("relation4002888749")

  return app.save(collection)
})
