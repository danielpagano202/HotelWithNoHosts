/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4120942869")

  // update collection data
  unmarshal({
    "updateRule": "Roomkey_via_room.user.id = @request.auth.id || @request.auth.role = \"Cleaner\" || 1 = 1"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4120942869")

  // update collection data
  unmarshal({
    "updateRule": "Roomkey_via_room.user.id = @request.auth.id || @request.auth.role = \"Cleaner\""
  }, collection)

  return app.save(collection)
})
