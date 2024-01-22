import { Stack, StackPage, StackSwitch } from "@comet/admin";
import * as React from "react";
import { useIntl } from "react-intl";

import { BrevoContactForm } from "./BrevoContactForm";
import { BrevoContactsGrid } from "./BrevoContactsGrid";

export function BrevoContactsPage(): React.ReactElement {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "brevoContacts.brevoContacts", defaultMessage: "Brevo Contacts" })}>
            <StackSwitch>
                <StackPage name="grid">
                    <BrevoContactsGrid />
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "brevoContacts.editBrevoContact", defaultMessage: "Edit Brevo Contact" })}>
                    {(selectedId) => <BrevoContactForm id={selectedId} />}
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "brevoContacts.addBrevoContact", defaultMessage: "Add Brevo Contact" })}>
                    <BrevoContactForm />
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}
