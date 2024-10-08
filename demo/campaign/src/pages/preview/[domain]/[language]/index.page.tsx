import { BlockPreviewProvider, IFrameBridgeProvider, useIFrameBridge } from "@comet/cms-site";
import { generateMjmlMailContent, IntlProviderValues, RenderedMail } from "@src/components/RenderedMail";
import { defaultLanguage } from "@src/config";
import { getMessages } from "@src/lang";
import { GetServerSidePropsContext } from "next";
import * as React from "react";

interface Props {
    intlProviderValues: IntlProviderValues;
}

const PreviewPage: React.FC<Props> = ({ intlProviderValues }) => {
    const { block } = useIFrameBridge();

    if (!block?.content) {
        return null;
    }

    const mjmlContent = generateMjmlMailContent(block.content, intlProviderValues);

    return <RenderedMail mjmlContent={mjmlContent} />;
};

const MailPreviewPage: React.FC<Props> = (props) => (
    <IFrameBridgeProvider>
        <BlockPreviewProvider>
            <PreviewPage {...props} />
        </BlockPreviewProvider>
    </IFrameBridgeProvider>
);

export default MailPreviewPage;

export async function getServerSideProps({ params }: GetServerSidePropsContext): Promise<{ props: Props } | undefined> {
    const locale = typeof params?.language === "string" ? params.language : defaultLanguage;
    const [messages] = await Promise.all([getMessages(locale)]);
    return {
        props: {
            intlProviderValues: {
                locale,
                messages,
                defaultLocale: defaultLanguage,
            },
        },
    };
}
