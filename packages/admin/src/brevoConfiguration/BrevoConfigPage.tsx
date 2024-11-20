import { useContentScope } from "@comet/cms-admin";
import * as React from "react";

import { useBrevoConfig } from "../common/BrevoConfigProvider";
import { BrevoConfigForm } from "./BrevoConfigForm";

export function BrevoConfigPage(): JSX.Element {
    const { scopeParts } = useBrevoConfig();
    const { scope: completeScope } = useContentScope();

    const scope = scopeParts.reduce((acc, scopePart) => {
        acc[scopePart] = completeScope[scopePart];
        return acc;
    }, {} as { [key: string]: unknown });

    return <BrevoConfigForm scope={scope} />;
}
