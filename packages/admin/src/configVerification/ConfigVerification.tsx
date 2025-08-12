import { useQuery } from "@apollo/client";
import { Alert, Loading, MainContent } from "@comet/admin";
import { type ContentScopeInterface } from "@comet/cms-admin";
import { FormattedMessage } from "react-intl";

import { brevoConfigCheckQuery } from "./ConfigVerification.gql";
import { type GQLBrevoConfigCheckQuery, type GQLBrevoConfigCheckQueryVariables } from "./ConfigVerification.gql.generated";
import { DialogContent } from "@mui/material";

interface ConfigCheckProps {
    scope: ContentScopeInterface;
}

export function ConfigVerification({ scope, children }: React.PropsWithChildren<ConfigCheckProps>): JSX.Element {
    const { data, error, loading } = useQuery<GQLBrevoConfigCheckQuery, GQLBrevoConfigCheckQueryVariables>(brevoConfigCheckQuery, {
        variables: { scope },
        fetchPolicy: "cache-and-network",
    });

    if (error) throw error;

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    if (!data?.brevoConfig?.id) {
        return (
            <MainContent>
                <Alert severity="error">
                    <FormattedMessage
                        id="cometBrevoModule.missingConfig"
                        defaultMessage="Missing brevo config! Configure brevo via the config page."
                    />
                </Alert>
            </MainContent>
        );
    }

    return <>{children}</>;
}
