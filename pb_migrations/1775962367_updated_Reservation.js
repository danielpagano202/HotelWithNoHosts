/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_883287542")

  // remove field
  collection.fields.removeById("text2420534521")

  // remove field
  collection.fields.removeById("text3961577812")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "date2420534521",
    "max": "",
    "min": "",
    "name": "check_in",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "date3961577812",
    "max": "",
    "min": "",
    "name": "check_out",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_883287542")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2420534521",
    "max": 0,
    "min": 0,
    "name": "check_in",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3961577812",
    "max": 0,
    "min": 0,
    "name": "check_out",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("date2420534521")

  // remove field
  collection.fields.removeById("date3961577812")

  return app.save(collection)
})
