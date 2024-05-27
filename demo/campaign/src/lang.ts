import { IntlConfig } from "react-intl";

export function getMessages(language: string): Promise<IntlConfig["messages"]> {
    if (language === "en") {
        return require("../lang/comet-brevo-module-demo-lang/site/en.json");
    }
    return require("../lang/comet-brevo-module-demo-lang/site/de.json");
}
