/* eslint-disable */

// @ts-check
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

const cometConfig = require("./comet-config.json");

/**
 * @type {import('next').NextConfig['i18n'] | undefined}
 **/
let i18n = undefined;

if (process.env.NEXT_PUBLIC_CAMPAIGN_IS_PREVIEW !== "true") {
    if (!process.env.NEXT_PUBLIC_CAMPAIGN_LANGUAGES) {
        throw new Error("Missing environment variable NEXT_PUBLIC_CAMPAIGN_LANGUAGES");
    }

    if (!process.env.NEXT_PUBLIC_CAMPAIGN_DEFAULT_LANGUAGE) {
        throw new Error("Missing environment variable NEXT_PUBLIC_CAMPAIGN_DEFAULT_LANGUAGE");
    }

    i18n = {
        locales: process.env.NEXT_PUBLIC_CAMPAIGN_LANGUAGES.split(","),
        defaultLocale: process.env.NEXT_PUBLIC_CAMPAIGN_DEFAULT_LANGUAGE,
        localeDetection: process.env.NODE_ENV === "development" ? false : undefined,
    };
}

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
    pageExtensions: ["page.ts", "page.tsx"],
    basePath: process.env.NEXT_PUBLIC_CAMPAIGN_IS_PREVIEW === "true" ? "/campaign" : "",
    images: {
        deviceSizes: cometConfig.dam.allowedImageSizes,
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        var path = require("path");

        config.resolve.alias["@src"] = path.resolve(__dirname, "src/");

        return config;
    },
    i18n,
    typescript: {
        ignoreBuildErrors: process.env.NODE_ENV === "production",
    },
    eslint: {
        ignoreDuringBuilds: process.env.NODE_ENV === "production",
    },
    compiler: {
        styledComponents: true,
    },
    env: {
        DAM_ALLOWED_IMAGE_SIZES: cometConfig.dam.allowedImageSizes.join(","),
    },
    async rewrites() {
        return [
            {
                source: "/",
                destination: "/api",
            },
        ];
    },
    // https://nextjs.org/docs/advanced-features/security-headers
    headers: async () => [
        {
            source: "/:path*",
            headers: [
                {
                    key: "X-DNS-Prefetch-Control",
                    value: "on",
                },
                {
                    key: "Strict-Transport-Security",
                    value: "max-age=63072000; includeSubDomains; preload",
                },
                {
                    key: "X-XSS-Protection",
                    value: "1; mode=block",
                },
                {
                    key: "X-Frame-Options",
                    value: "SAMEORIGIN",
                },
                {
                    key: "Permissions-Policy",
                    value: "",
                },
                {
                    key: "X-Content-Type-Options",
                    value: "nosniff",
                },
                {
                    key: "Referrer-Policy",
                    value: "strict-origin-when-cross-origin",
                },
                {
                    key: "Content-Security-Policy",
                    value: `
                                default-src 'self' https:;
                                img-src 'self' https: data:${process.env.NODE_ENV === "development" ? " http:" : ""};
                                media-src 'self' https: data:${process.env.NODE_ENV === "development" ? " http:" : ""};
                                style-src 'self' 'unsafe-inline'; 
                                font-src 'self' https: data:;
                                script-src 'self' 'unsafe-inline' https:${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""};
                                connect-src 'self' https:${process.env.NODE_ENV === "development" ? " http:" : ""};
                                frame-ancestors ${process.env.ADMIN_URL};
                            `
                        .replace(/\s{2,}/g, " ")
                        .trim(),
                },
            ],
        },
    ],
};

module.exports = withBundleAnalyzer(nextConfig);
