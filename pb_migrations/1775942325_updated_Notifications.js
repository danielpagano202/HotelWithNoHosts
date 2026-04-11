/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3905696460")

  // update collection data
  unmarshal({
    "name": "EscalationNotifications"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3905696460")

  // update collection data
  unmarshal({
    "name": "Notifications"
  }, collection)

  return app.save(collection)
})
