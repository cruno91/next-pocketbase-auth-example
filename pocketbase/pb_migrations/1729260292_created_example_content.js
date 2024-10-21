/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "zu476qneva9zdcc",
    "created": "2024-10-18 14:04:52.893Z",
    "updated": "2024-10-18 14:04:52.893Z",
    "name": "example_content",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "6qiklkde",
        "name": "description",
        "type": "editor",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "convertUrls": false
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("zu476qneva9zdcc");

  return dao.deleteCollection(collection);
})
