/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const snapshot = [
    {
      "id": "zu476qneva9zdcc",
      "created": "2024-10-18 14:04:52.893Z",
      "updated": "2024-10-22 12:56:51.781Z",
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
        },
        {
          "system": false,
          "id": "zhqji8jt",
          "name": "account",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        }
      ],
      "indexes": [],
      "listRule": null,
      "viewRule": "@request.auth.id != \"\" && @request.auth.id = account",
      "createRule": "@request.auth.id != \"\" && @request.auth.id = @request.data.account",
      "updateRule": "@request.auth.id != \"\" && @request.auth.id = account",
      "deleteRule": "@request.auth.id != \"\" && @request.auth.id = account",
      "options": {}
    },
    {
      "id": "tshz16ybex79drf",
      "created": "2024-10-21 12:21:22.441Z",
      "updated": "2024-10-26 21:01:42.462Z",
      "name": "api_keys",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "7humlyti",
          "name": "account",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "jl93vh18",
          "name": "key",
          "type": "text",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "g5gvvz60",
          "name": "name",
          "type": "text",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "kycch3kq",
          "name": "revoked",
          "type": "date",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        },
        {
          "system": false,
          "id": "odig8z1z",
          "name": "last_used",
          "type": "date",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        }
      ],
      "indexes": [],
      "listRule": "@request.auth.id != \"\" && account = @request.auth.id",
      "viewRule": "@request.auth.id != \"\" && @request.auth.id = account",
      "createRule": "@request.auth.id != \"\" && @request.auth.id = @request.data.account",
      "updateRule": "@request.auth.id != \"\" && @request.auth.id = account",
      "deleteRule": "@request.auth.id != \"\" && @request.auth.id = account",
      "options": {}
    },
    {
      "id": "_pb_users_auth_",
      "created": "2024-10-26 20:44:35.255Z",
      "updated": "2024-10-26 20:44:35.296Z",
      "name": "users",
      "type": "auth",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "users_name",
          "name": "name",
          "type": "text",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "users_avatar",
          "name": "avatar",
          "type": "file",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "mimeTypes": [
              "image/jpeg",
              "image/png",
              "image/svg+xml",
              "image/gif",
              "image/webp"
            ],
            "thumbs": null,
            "maxSelect": 1,
            "maxSize": 5242880,
            "protected": false
          }
        }
      ],
      "indexes": [],
      "listRule": "id = @request.auth.id",
      "viewRule": "id = @request.auth.id",
      "createRule": "",
      "updateRule": "id = @request.auth.id",
      "deleteRule": "id = @request.auth.id",
      "options": {
        "allowEmailAuth": true,
        "allowOAuth2Auth": true,
        "allowUsernameAuth": true,
        "exceptEmailDomains": null,
        "manageRule": null,
        "minPasswordLength": 8,
        "onlyEmailDomains": null,
        "onlyVerified": false,
        "requireEmail": false
      }
    }
  ];

  const collections = snapshot.map((item) => new Collection(item));

  return Dao(db).importCollections(collections, true, null);
}, (db) => {
  return null;
})
