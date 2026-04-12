/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2008026834")

  // remove field
  collection.fields.removeById("date3619953762")

  // remove field
  collection.fields.removeById("date2344233448")

  // remove field
  collection.fields.removeById("text1204587666")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select1204587666",
    "maxSelect": 1,
    "name": "action",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "entry",
      "exit"
    ]
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4120942869",
    "hidden": false,
    "id": "relation1923043739",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "room",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "autodate2990389176",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1703631466",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2008026834")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "date3619953762",
    "max": "",
    "min": "",
    "name": "Timestamp_in",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "date2344233448",
    "max": "",
    "min": "",
    "name": "Timestamp_out",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1204587666",
    "max": 0,
    "min": 0,
    "name": "action",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("select1204587666")

  // remove field
  collection.fields.removeById("relation1923043739")

  // remove field
  collection.fields.removeById("autodate2990389176")

  // update field
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
})
