/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2008026834")

  // remove field
  collection.fields.removeById("relation3317298516")

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1703631466",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Log_user",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2008026834")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3245856272",
    "hidden": false,
    "id": "relation3317298516",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Log_User",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("relation1703631466")

  return app.save(collection)
})
