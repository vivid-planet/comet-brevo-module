import { useApolloClient } from "@apollo/client";
import { Field, FinalForm, FinalFormInput, FinalFormSubmitEvent, useStackSwitchApi } from "@comet/admin";
import { ContentScopeInterface } from "@comet/cms-admin";
import { FormApi } from "final-form";
import React from "react";
import { FormattedMessage } from "react-intl";

import { createTargetGroupMutation } from "./TargetGroupDialog.gql";
import { GQLCreateTargetGroupMutation, GQLCreateTargetGroupMutationVariables } from "./TargetGroupDialog.gql.generated";
import { EditTargetGroupFinalFormValues } from "./TargetGroupForm";

interface TargetGroupDialogProps {
    scope: ContentScopeInterface;
}

export function TargetGroupDialog({ scope }: TargetGroupDialogProps): React.ReactElement {
    const client = useApolloClient();
    const mode = "add";
    const stackSwitchApi = useStackSwitchApi();

    const handleSubmit = async (
        state: EditTargetGroupFinalFormValues,
        form: FormApi<EditTargetGroupFinalFormValues>,
        event: FinalFormSubmitEvent,
    ) => {
        const output = {
            ...state,
        };

        const { data: mutationResponse } = await client.mutate<GQLCreateTargetGroupMutation, GQLCreateTargetGroupMutationVariables>({
            mutation: createTargetGroupMutation,
            variables: { scope, input: output },
        });
        if (!event.navigatingBack) {
            const id = mutationResponse?.createTargetGroup.id;
            if (id) {
                setTimeout(() => {
                    stackSwitchApi.activatePage("edit", id);
                });
            }
        }
    };
    return (
        <FinalForm<EditTargetGroupFinalFormValues> onSubmit={handleSubmit} mode={mode}>
            {() => {
                return (
                    <Field
                        required
                        fullWidth
                        name="title"
                        component={FinalFormInput}
                        label={<FormattedMessage id="cometBrevoModule.targetGroup.title" defaultMessage="Title" />}
                    />
                );
            }}
        </FinalForm>
    );
}
