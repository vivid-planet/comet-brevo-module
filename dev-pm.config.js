const packageFolderMapping = {
    "@comet/brevo-api": "packages/api",
    "@comet/brevo-admin": "packages/admin",
    "@comet/brevo-email-frontend": "packages/site",
};

const waitOnPackages = (...packages) => {
    return packages.map((package) => `${packageFolderMapping[package]}/lib/index.d.ts`);
};

module.exports = {
    scripts: [
        //group api
        {
            name: "api",
            script: "pnpm --filter @comet/brevo-api run dev",
            group: ["api"],
        },
        {
            name: "api-codegen-schema",
            script: "pnpm --filter @comet/brevo-api run generate-schema:watch",
            group: ["api"],
        },
        //group admin
        {
            name: "admin",
            script: "pnpm --filter @comet/brevo-admin run start",
            group: ["admin"],
        },
        //group email-frontend
        {
            name: "email-frontend",
            script: "pnpm --filter @comet/brevo-email-frontend run dev",
            group: ["email-frontend"],
        },
        //group demo admin
        {
            name: "demo-admin",
            script: "pnpm --filter comet-brevo-module-demo-admin run start",
            group: ["demo-admin", "demo"],
            waitOn: [...waitOnPackages("@comet/brevo-admin"), "tcp:$API_PORT"],
        },
        {
            name: "demo-admin-codegen",
            script: "pnpm --filter comet-brevo-module-demo-admin run gql:watch",
            group: ["demo-admin", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
        {
            name: "demo-admin-block-codegen",
            script: "pnpm --filter comet-brevo-module-demo-admin run generate-block-types:watch",
            group: ["demo-admin", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
        //group demo api
        {
            name: "demo-docker",
            script: "docker compose up",
            group: ["demo-api", "demo"],
        },
        {
            name: "demo-api",
            script: ["pnpm --filter comet-brevo-module-demo-api run db:migrate", "pnpm --filter comet-brevo-module-demo-api run start:dev"].join(
                " && ",
            ),
            group: ["demo-api", "demo"],
            waitOn: [...waitOnPackages("@comet/brevo-api"), "tcp:$POSTGRESQL_PORT", "tcp:$IMGPROXY_PORT"],
        },

        //group demo site
        {
            name: "demo-site",
            script: "pnpm --filter comet-brevo-module-demo-site run dev",
            group: ["demo-site", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
        {
            name: "demo-site-codegen",
            script: "pnpm --filter comet-brevo-module-demo-site run gql:watch",
            group: ["demo-site", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
        {
            name: "demo-site-block-codegen",
            script: "pnpm --filter comet-brevo-module-demo-site run generate-block-types:watch",
            group: ["demo-site", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
        // group demo campaign frontend
        {
            name: "demo-campaign",
            script: "pnpm --filter comet-brevo-module-demo-campaign run dev",
            group: ["demo-campaign", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
        {
            name: "demo-campaign-block-codegen",
            script: "pnpm --filter comet-brevo-module-demo-campaign run generate-block-types:watch",
            group: ["demo-campaign", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
    ],
};
