/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4120942869")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool4168973377",
    "name": "Unlocked",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4120942869")

  // remove field
  collection.fields.removeById("bool4168973377")

  return app.save(collection)
})
