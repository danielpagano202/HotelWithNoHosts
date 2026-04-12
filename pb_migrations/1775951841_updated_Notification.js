/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4043172148")

  // remove field
  collection.fields.removeById("relation3559503532")

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation900701555",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "notification_user",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4043172148")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3245856272",
    "hidden": false,
    "id": "relation3559503532",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "notification_customer",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("relation900701555")

  return app.save(collection)
})
