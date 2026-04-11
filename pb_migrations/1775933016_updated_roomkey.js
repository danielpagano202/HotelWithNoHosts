/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_697655776")

  // update collection data
  unmarshal({
    "name": "Roomkey"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_697655776")

  // update collection data
  unmarshal({
    "name": "roomkey"
  }, collection)

  return app.save(collection)
})
