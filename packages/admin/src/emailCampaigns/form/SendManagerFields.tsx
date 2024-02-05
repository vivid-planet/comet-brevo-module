import { useQuery } from "@apollo/client";
import { Field, FinalFormSelect } from "@comet/admin";
import { FinalFormDateTimePicker } from "@comet/admin-date-time";
import { AdminComponentPaper, AdminComponentSectionGroup } from "@comet/blocks-admin";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Card, MenuItem } from "@mui/material";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { targetGroupsSelectQuery } from "./SendManagerFields.gql";
import { GQLTargetGroupsSelectQuery, GQLTargetGroupsSelectQueryVariables } from "./SendManagerFields.gql.generated";

interface SendManagerFieldsProps {
    disableScheduling?: boolean;
    scope: ContentScopeInterface;
}

const validateScheduledAt = (value: Date, now: Date) => {
    if (!value) return;

    if (value < now) {
        return (
            <FormattedMessage
                id="cometBrevoModule.emailCampaigns.sendManager.scheduledAt.validationError.pastDate"
                defaultMessage="Date must be in the future"
            />
        );
    }
};

export const SendManagerFields = ({ disableScheduling, scope }: SendManagerFieldsProps) => {
    const { data: targetGroups } = useQuery<GQLTargetGroupsSelectQuery, GQLTargetGroupsSelectQueryVariables>(targetGroupsSelectQuery, {
        variables: { scope },
        fetchPolicy: "network-only",
    });

    const now = new Date();
    return (
        <Card>
            <AdminComponentPaper>
                <AdminComponentSectionGroup
                    title={<FormattedMessage id="cometBrevoModule.emailCampaigns.sendManager.title" defaultMessage="Send Manager" />}
                >
                    <Field
                        name="scheduledAt"
                        disabled={disableScheduling}
                        fullWidth
                        clearable
                        label={<FormattedMessage id="cometBrevoModule.emailCampaigns.scheduledAt" defaultMessage="Schedule date and time" />}
                        component={FinalFormDateTimePicker}
                        validate={(value) => validateScheduledAt(value, now)}
                        componentsProps={{ datePicker: { placeholder: "DD.MM.YYYY", minDate: now }, timePicker: { placeholder: "HH:mm" } }}
                    />
                    <Field
                        label={<FormattedMessage id="cometBrevoModule.emailCampaigns.targetGroup" defaultMessage="Target group" />}
                        name="targetGroup"
                        fullWidth
                    >
                        {(props) => (
                            <FinalFormSelect {...props} fullWidth clearable>
                                {targetGroups?.targetGroups.nodes.map((option) => (
                                    <MenuItem value={option.id} key={option.id}>
                                        {option.title}
                                    </MenuItem>
                                ))}
                            </FinalFormSelect>
                        )}
                    </Field>
                </AdminComponentSectionGroup>
            </AdminComponentPaper>
        </Card>
    );
};
