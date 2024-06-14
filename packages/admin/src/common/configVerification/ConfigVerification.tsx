import { useQuery } from "@apollo/client";
import { Alert, Loading, MainContent } from "@comet/admin";
import { ContentScopeInterface } from "@comet/cms-admin";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { brevoConfigCheckQuery } from "./ConfigVerification.gql";
import { GQLBrevoConfigCheckQuery, GQLBrevoConfigCheckQueryVariables } from "./ConfigVerification.gql.generated";

interface ConfigCheckProps {
    scope: ContentScopeInterface;
}

export function ConfigVerification({ scope, children }: React.PropsWithChildren<ConfigCheckProps>): JSX.Element {
    const { data, error, loading } = useQuery<GQLBrevoConfigCheckQuery, GQLBrevoConfigCheckQueryVariables>(brevoConfigCheckQuery, {
        variables: { scope },
        fetchPolicy: "network-only",
    });

    if (error) throw error;

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    if (!data?.brevoConfig?.isApiKeySet) {
        return (
            <MainContent>
                <Alert severity="error">
                    <FormattedMessage
                        id="cometBrevoModule.brevoConfig.apiKeyMissing"
                        defaultMessage="Missing brevo api key, please set via brevo config page"
                    />
                </Alert>
            </MainContent>
        );
    }

    return <>{children}</>;
}
