import { useContentScope } from "@comet/cms-admin";
import * as React from "react";

import { BrevoConfigForm } from "./BrevoConfigForm";

interface CreateBrevoConfigPageOptions {
    scopeParts: string[];
}

export function createBrevoConfigPage({ scopeParts }: CreateBrevoConfigPageOptions) {
    function BrevoConfigPage(): JSX.Element {
        const { scope: completeScope } = useContentScope();

        const scope = scopeParts.reduce((acc, scopePart) => {
            acc[scopePart] = completeScope[scopePart];
            return acc;
        }, {} as { [key: string]: unknown });

        return <BrevoConfigForm scope={scope} />;
    }
    return BrevoConfigPage;
}
