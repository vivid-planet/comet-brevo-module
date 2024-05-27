export let domain = "";
export let languages: string[] = [];
export let defaultLanguage = "";

if (process.env.NEXT_PUBLIC_CAMPAIGN_IS_PREVIEW !== "true") {
    if (process.env.NEXT_PUBLIC_CAMPAIGN_DOMAIN) {
        domain = process.env.NEXT_PUBLIC_CAMPAIGN_DOMAIN;
    } else {
        throw new Error("Missing environment variable NEXT_PUBLIC_CAMPAIGN_DOMAIN");
    }

    if (process.env.NEXT_PUBLIC_CAMPAIGN_LANGUAGES) {
        languages = process.env.NEXT_PUBLIC_CAMPAIGN_LANGUAGES.split(",");
    } else {
        throw new Error("Missing environment variable NEXT_PUBLIC_CAMPAIGN_LANGUAGES");
    }

    if (process.env.NEXT_PUBLIC_CAMPAIGN_DEFAULT_LANGUAGE) {
        defaultLanguage = process.env.NEXT_PUBLIC_CAMPAIGN_DEFAULT_LANGUAGE;
    } else {
        throw new Error("Missing environment variable NEXT_PUBLIC_CAMPAIGN_DEFAULT_LANGUAGE");
    }
}
