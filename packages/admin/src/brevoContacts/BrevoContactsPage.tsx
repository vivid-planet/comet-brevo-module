import { useContentScope } from "@comet/cms-admin";
import { GridColDef } from "@mui/x-data-grid";
import { DocumentNode } from "graphql";
import * as React from "react";

import { BrevoContactsGrid } from "./BrevoContactsGrid";

interface CreateContactsPageOptions {
    scopeParts: string[];
    additionalAttributesFragment?: { name: string; fragment: DocumentNode };
    additionalGridFields?: GridColDef[];
}

function createBrevoContactsPage({ scopeParts, additionalAttributesFragment, additionalGridFields }: CreateContactsPageOptions) {
    function BrevoContactsPage(): JSX.Element {
        const { scope: completeScope } = useContentScope();

        const scope = scopeParts.reduce((acc, scopePart) => {
            acc[scopePart] = completeScope[scopePart];
            return acc;
        }, {} as { [key: string]: unknown });

        return (
            <BrevoContactsGrid
                scope={scope}
                additionalAttributesFragment={additionalAttributesFragment}
                additionalGridFields={additionalGridFields}
            />
        );
    }

    return BrevoContactsPage;
}

export { createBrevoContactsPage };
