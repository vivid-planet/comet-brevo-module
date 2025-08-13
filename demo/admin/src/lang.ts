import { type ResolvedIntlConfig } from "react-intl";

import project_messages_de from "../lang-compiled/comet-brevo-module-demo-lang/de.json";
import project_messages_en from "../lang-compiled/comet-brevo-module-demo-lang/en.json";
import comet_brevo_module_messages_de from "../lang-compiled/comet-brevo-module-lang/de.json";
import comet_brevo_module_messages_en from "../lang-compiled/comet-brevo-module-lang/en.json";
import comet_messages_de from "../lang-compiled/comet-lang/de.json";
import comet_messages_en from "../lang-compiled/comet-lang/en.json";

const cometMessages = {
    en: comet_messages_en,
    de: comet_messages_de,
};

const cometBrevoModuleMessages = {
    en: comet_brevo_module_messages_en,
    de: comet_brevo_module_messages_de,
};

const projectMessages = {
    en: project_messages_en,
    de: project_messages_de,
};

export const getMessages = (): ResolvedIntlConfig["messages"] => {
    return {
        ...cometMessages["en"],
        ...cometBrevoModuleMessages["en"],
        ...projectMessages["en"],
    };
};
