module.exports = {
    "./!(demo|packages)/**/*.{js,json,md,yml,yaml}": () => "pnpm lint:root",
};
