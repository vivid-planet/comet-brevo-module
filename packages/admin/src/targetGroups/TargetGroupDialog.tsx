import { useApolloClient } from "@apollo/client";
import { Field, FinalForm, FinalFormInput, FinalFormSubmitEvent, MainContent, useFormApiRef, useStackSwitchApi } from "@comet/admin";
import { AddFilled, Close } from "@comet/admin-icons";
import { ContentScopeInterface } from "@comet/cms-admin";
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { FormApi } from "final-form";
import React from "react";
import { FormattedMessage } from "react-intl";

import { createTargetGroupMutation } from "./TargetGroupDialog.gql";
import { GQLCreateTargetGroupMutation, GQLCreateTargetGroupMutationVariables } from "./TargetGroupDialog.gql.generated";
import { EditTargetGroupFinalFormValues } from "./TargetGroupForm";

interface TargetGroupDialogProps {
    open: boolean;
    handleClose: () => void;
    scope: ContentScopeInterface;
}

export function TargetGroupDialog({ scope, open, handleClose }: TargetGroupDialogProps): React.ReactElement {
    const client = useApolloClient();
    const mode = "add";
    const formApiRef = useFormApiRef<EditTargetGroupFinalFormValues>();
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
        <Dialog open={open} onClose={handleClose} maxWidth="sm">
            <DialogTitle>
                <IconButton color="inherit" onClick={handleClose}>
                    <Close />
                </IconButton>
                <FormattedMessage id="cometBrevoModule.targetGroup.createNewTargetGroup" defaultMessage="Create new target group" />
            </DialogTitle>
            <FinalForm<EditTargetGroupFinalFormValues> apiRef={formApiRef} onSubmit={handleSubmit} mode={mode}>
                {({ handleSubmit, submitting, valid }) => {
                    return (
                        <>
                            <DialogContent sx={{ padding: "20px" }}>
                                <MainContent>
                                    <Card sx={{ padding: "40px" }}>
                                        <Field
                                            required
                                            fullWidth
                                            name="title"
                                            component={FinalFormInput}
                                            label={<FormattedMessage id="cometBrevoModule.targetGroup.title" defaultMessage="Title" />}
                                        />
                                    </Card>
                                </MainContent>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    startIcon={<AddFilled />}
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        handleSubmit();
                                        handleClose();
                                    }}
                                    disabled={!valid || submitting}
                                >
                                    <FormattedMessage id="cometBrevoModule.targetGroup.create" defaultMessage="Create" />
                                </Button>
                            </DialogActions>
                        </>
                    );
                }}
            </FinalForm>
        </Dialog>
    );
}
