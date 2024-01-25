import { useContentScope } from "@comet/cms-admin";
import * as React from "react";

import { BrevoContactsGrid } from "./BrevoContactsGrid";

interface CreateContactsPageOptions {
    scopeParts: string[];
}

function createBrevoContactsPage({ scopeParts }: CreateContactsPageOptions) {
    function BrevoContactsPage(): JSX.Element {
        const { scope: completeScope } = useContentScope();

        const scope = scopeParts.reduce((acc, scopePart) => {
            acc[scopePart] = completeScope[scopePart];
            return acc;
        }, {} as { [key: string]: unknown });

        return <BrevoContactsGrid scope={scope} />;
    }

    return BrevoContactsPage;
}

export { createBrevoContactsPage };
