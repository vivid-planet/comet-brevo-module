import { useQuery } from "@apollo/client";
import { MainContent, StackLink, Toolbar, ToolbarActions, ToolbarFillSpace, ToolbarItem, useStackApi } from "@comet/admin";
import { Add as AddIcon, ArrowLeft } from "@comet/admin-icons";
import { useContentScopeConfig } from "@comet/cms-admin";
import { Button, Grid, IconButton } from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";

import { emailCampaignStatistics } from "./EmailCampaignStatistics.gql";
import { GQLEmailCampaignStatisticsQuery, GQLEmailCampaignStatisticsQueryVariables } from "./EmailCampaignStatistics.gql.generated";
import { PercentageCard } from "./PercentageCard";

interface Props {
    id: string;
}

export const EmailCampaignStatistics = ({ id }: Props): React.ReactElement => {
    const stackApi = useStackApi();
    useContentScopeConfig({ redirectPathAfterChange: "/newsletter/email-campaigns" });

    const { data: campaignStatistics } = useQuery<GQLEmailCampaignStatisticsQuery, GQLEmailCampaignStatisticsQueryVariables>(
        emailCampaignStatistics,
        {
            variables: { id },
            fetchPolicy: "network-only",
        },
    );

    return (
        <>
            <Toolbar>
                <ToolbarItem>
                    <IconButton onClick={stackApi?.goBack} size="large">
                        <ArrowLeft />
                    </IconButton>
                </ToolbarItem>
                <ToolbarFillSpace />
                <ToolbarActions>
                    <Button startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add" variant="contained" color="primary">
                        <FormattedMessage id="cometBrevoModule.emailCampaign.newEmailCampaign" defaultMessage="New email campaign" />
                    </Button>
                </ToolbarActions>
            </Toolbar>
            <MainContent>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <PercentageCard
                            title={
                                <FormattedMessage id="cometBrevoModule.emailCampaignStatistics.overallDelivery" defaultMessage="Overall delivery" />
                            }
                            currentNumber={campaignStatistics?.emailCampaignStatistics?.delivered}
                            targetNumber={campaignStatistics?.emailCampaignStatistics?.sent}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <PercentageCard
                            title={
                                <FormattedMessage
                                    id="cometBrevoModule.emailCampaignStatistics.overallFailedDelivery"
                                    defaultMessage="Overall failed delivery"
                                />
                            }
                            currentNumber={
                                campaignStatistics?.emailCampaignStatistics
                                    ? campaignStatistics.emailCampaignStatistics?.sent - campaignStatistics.emailCampaignStatistics?.delivered
                                    : undefined
                            }
                            targetNumber={campaignStatistics?.emailCampaignStatistics?.sent}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <PercentageCard
                            title={<FormattedMessage id="cometBrevoModule.emailCampaignStatistics.uniqueViews" defaultMessage="Unique views" />}
                            variant="circle"
                            currentNumber={campaignStatistics?.emailCampaignStatistics?.uniqueViews}
                            targetNumber={campaignStatistics?.emailCampaignStatistics?.sent}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <PercentageCard
                            title={<FormattedMessage id="cometBrevoModule.emailCampaignStatistics.overallClicked" defaultMessage="Overall clicked" />}
                            variant="circle"
                            currentNumber={campaignStatistics?.emailCampaignStatistics?.uniqueClicks}
                            targetNumber={campaignStatistics?.emailCampaignStatistics?.sent}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <PercentageCard
                            title={<FormattedMessage id="cometBrevoModule.emailCampaignStatistics.overallBounce" defaultMessage="Overall bounce" />}
                            currentNumber={
                                campaignStatistics?.emailCampaignStatistics
                                    ? campaignStatistics.emailCampaignStatistics.softBounces + campaignStatistics.emailCampaignStatistics.hardBounces
                                    : undefined
                            }
                            targetNumber={campaignStatistics?.emailCampaignStatistics?.sent}
                            variant="circle"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <PercentageCard
                            title={
                                <FormattedMessage id="cometBrevoModule.emailCampaignStatistics.unsubscriptions" defaultMessage="Unsubscriptions" />
                            }
                            currentNumber={campaignStatistics?.emailCampaignStatistics?.unsubscriptions}
                            targetNumber={campaignStatistics?.emailCampaignStatistics?.sent}
                            variant="circle"
                        />
                    </Grid>
                </Grid>
            </MainContent>
        </>
    );
};
