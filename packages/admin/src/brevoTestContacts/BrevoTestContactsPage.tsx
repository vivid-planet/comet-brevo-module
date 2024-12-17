import { GridColDef, Stack, StackPage, StackSwitch, StackToolbar } from "@comet/admin";
import { ContentScopeIndicator, useContentScope } from "@comet/cms-admin";
import { DocumentNode } from "graphql";
import * as React from "react";
import { useIntl } from "react-intl";

import { BrevoTestContactsGrid } from "./BrevoTestContactsGrid";
import { BrevoTestContactForm, EditBrevoContactFormValues } from "./form/BrevoTestContactForm";

interface CreateContactsPageOptions {
    scopeParts: string[];
    additionalAttributesFragment?: { name: string; fragment: DocumentNode };
    additionalGridFields?: GridColDef[];
    additionalFormFields?: React.ReactNode;
    input2State?: (values?: EditBrevoContactFormValues) => EditBrevoContactFormValues;
}

function createBrevoTestContactsPage({
    scopeParts,
    additionalAttributesFragment,
    additionalFormFields,
    additionalGridFields,
    input2State,
}: CreateContactsPageOptions) {
    function BrevoTestContactsPage(): JSX.Element {
        const intl = useIntl();
        const { scope: completeScope } = useContentScope();

        const scope = scopeParts.reduce((acc, scopePart) => {
            acc[scopePart] = completeScope[scopePart];
            return acc;
        }, {} as { [key: string]: unknown });

        return (
            <Stack topLevelTitle={intl.formatMessage({ id: "cometBrevoModule.brevoContacts.brevoTestContacts", defaultMessage: "Test Contacts" })}>
                <StackSwitch>
                    <StackPage name="grid">
                        <StackToolbar scopeIndicator={<ContentScopeIndicator scope={scope} />} />
                        <BrevoTestContactsGrid
                            scope={scope}
                            additionalAttributesFragment={additionalAttributesFragment}
                            additionalGridFields={additionalGridFields}
                        />
                    </StackPage>
                    <StackPage
                        name="edit"
                        title={intl.formatMessage({ id: "cometBrevoModule.brevoContacts.editBrevoContact", defaultMessage: "Edit contact" })}
                    >
                        {(selectedId) => (
                            <BrevoTestContactForm
                                additionalFormFields={additionalFormFields}
                                additionalAttributesFragment={additionalAttributesFragment}
                                input2State={input2State}
                                id={Number(selectedId)}
                                scope={scope}
                            />
                        )}
                    </StackPage>
                    <StackPage
                        name="add"
                        title={intl.formatMessage({ id: "cometBrevoModule.brevoContacts.addBrevoContact", defaultMessage: "Add contact" })}
                    >
                        <BrevoTestContactForm
                            additionalFormFields={additionalFormFields}
                            additionalAttributesFragment={additionalAttributesFragment}
                            input2State={input2State}
                            scope={scope}
                        />
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    }

    return BrevoTestContactsPage;
}

export { createBrevoTestContactsPage };
