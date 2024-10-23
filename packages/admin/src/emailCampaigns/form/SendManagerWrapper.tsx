import { useQuery } from "@apollo/client";
import { Loading } from "@comet/admin";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Typography } from "@mui/material";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { brevoConfigQuery } from "./SendManagerWrapper.gql";
import { GQLBrevoConfigQuery, GQLBrevoConfigQueryVariables } from "./SendManagerWrapper.gql.generated";

interface SendManagerWrapperProps {
    scope: ContentScopeInterface;
}

export const SendManagerWrapper = ({ scope, children }: React.PropsWithChildren<SendManagerWrapperProps>) => {
    const {
        data: brevoConfig,
        loading,
        error,
    } = useQuery<GQLBrevoConfigQuery, GQLBrevoConfigQueryVariables>(brevoConfigQuery, {
        variables: { scope },
        fetchPolicy: "network-only",
    });

    if (loading) {
        return <Loading />;
    }

    if (error) throw error;

    if (brevoConfig?.brevoConfig?.id == undefined) {
        return (
            <Typography>
                <FormattedMessage
                    id="cometBrevoModule.emailCampaigns.missingConfig"
                    defaultMessage="Missing brevo config! Configure brevo via the brevo config page."
                />
            </Typography>
        );
    }

    return <> {children} </>;
};
