import { renderToMjml } from "@luma-team/mjml-react";
import { type EmailCampaignContentBlockData } from "@src/blocks.generated";
import { ContentBlock } from "@src/blocks/ContentBlock";
import { replaceMailHtmlPlaceholders } from "@src/util/replaceMailHtmlPlaceholders";
import { type FC, useEffect, useState } from "react";
import { type IntlConfig, IntlProvider } from "react-intl";

import { Root } from "./Root";

export interface IntlProviderValues {
    locale: string;
    messages: IntlConfig["messages"];
    defaultLocale: string;
}

interface Props {
    mjmlContent: string;
}

export const generateMjmlMailContent = (blockData: EmailCampaignContentBlockData, intlProviderValues: IntlProviderValues): string => {
    const { locale, messages, defaultLocale } = intlProviderValues;

    return renderToMjml(
        <IntlProvider messages={messages} locale={locale} defaultLocale={defaultLocale}>
            <Root>
                <ContentBlock content={blockData} />
            </Root>
        </IntlProvider>,
    );
};

export const RenderedMail: FC<Props> = ({ mjmlContent }) => {
    const [mailHtml, setMailHtml] = useState<string>("");

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mjml2htmlBrowser = require("mjml-browser");
        const { html: mjmlHtml, errors } = mjml2htmlBrowser(mjmlContent);
        const html = replaceMailHtmlPlaceholders(mjmlHtml, "preview");

        if (errors.length) {
            console.error(`${errors.length} MJML render errors:`, errors);
        }

        setMailHtml(html);
    }, [mjmlContent]);

    return <span dangerouslySetInnerHTML={{ __html: mailHtml }} />;
};
