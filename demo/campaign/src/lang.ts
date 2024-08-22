import { IntlConfig } from "react-intl";

export function getMessages(language: string): Promise<IntlConfig["messages"]> {
    if (language === "en") {
        return require("../lang/comet-brevo-module-demo-lang/campaign/en.json");
    }
    return require("../lang/comet-brevo-module-demo-lang/campaign/de.json");
}
