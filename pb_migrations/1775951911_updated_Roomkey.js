/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_697655776")

  // remove field
  collection.fields.removeById("relation179460423")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation2482917405",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "roomkey_user",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_697655776")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3245856272",
    "hidden": false,
    "id": "relation179460423",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "roomkey_customer",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("relation2482917405")

  return app.save(collection)
})
