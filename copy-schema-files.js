const fs = require("fs");

(async () => {
    await Promise.all([
        fs.promises.copyFile("packages/api/schema.gql", "packages/admin/schema.gql"),

        fs.promises.copyFile("demo/api/block-meta.json", "demo/admin/block-meta.json"),
        fs.promises.copyFile("demo/api/block-meta.json", "demo/site/block-meta.json"),
        fs.promises.copyFile("demo/api/block-meta.json", "demo/campaign/block-meta.json"),
        fs.promises.copyFile("demo/api/schema.gql", "demo/admin/schema.gql"),
        fs.promises.copyFile("demo/api/schema.gql", "demo/site/schema.gql"),
        fs.promises.copyFile("demo/api/schema.gql", "demo/campaign/schema.gql"),
        fs.promises.copyFile("demo/api/src/comet-config.json", "demo/site/comet-config.json"),
        fs.promises.copyFile("demo/api/src/comet-config.json", "demo/admin/comet-config.json"),
        fs.promises.copyFile("demo/api/src/comet-config.json", "demo/campaign/comet-config.json"),
    ]);
})();
