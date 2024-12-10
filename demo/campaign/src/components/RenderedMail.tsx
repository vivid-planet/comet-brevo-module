import { renderToMjml } from "@luma-team/mjml-react";
import { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { ContentBlock } from "@src/blocks/ContentBlock";
import { getPreparedHtml } from "@src/util/getPreparedHtml";
import { replaceMailHtmlPlaceholders } from "@src/util/replaceMailHtmlPlaceholders";
import * as React from "react";
import { IntlConfig, IntlProvider } from "react-intl";

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

export const RenderedMail: React.FC<Props> = ({ mjmlContent }) => {
    const [mailHtml, setMailHtml] = React.useState<string>("");

    React.useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mjml2htmlBrowser = require("mjml-browser");
        const { html: escapedHtml, errors } = mjml2htmlBrowser(mjmlContent);

        const preparedHtml = getPreparedHtml(escapedHtml);
        const html = replaceMailHtmlPlaceholders(preparedHtml, "preview");

        if (errors.length) {
            // eslint-disable-next-line no-console
            console.error(`${errors.length} MJML render errors:`, errors);
        }

        setMailHtml(html);
    }, [mjmlContent]);

    return <span dangerouslySetInnerHTML={{ __html: mailHtml }} />;
};
