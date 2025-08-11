import { defaultLanguage, domain } from "@src/config";
import { type GetServerSidePropsContext, type GetStaticPropsContext } from "next";

import { type ContentScope } from "./ContentScope";

function inferContentScopeFromContext(context: GetStaticPropsContext | GetServerSidePropsContext): ContentScope {
    if (typeof context.params?.domain === "string" && typeof context.params?.language === "string") {
        // Site preview
        return { domain: context.params.domain, language: context.params.language };
    } else {
        // Live site
        const language = context.locale ?? defaultLanguage;
        return { domain, language };
    }
}

export { inferContentScopeFromContext };
