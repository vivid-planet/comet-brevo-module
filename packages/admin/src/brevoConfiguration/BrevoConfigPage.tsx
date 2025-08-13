import { useContentScope } from "@comet/cms-admin";

import { useBrevoConfig } from "../common/BrevoConfigProvider";
import { BrevoConfigForm } from "./BrevoConfigForm";
import { DialogContent } from "@mui/material";
import { Tooltip } from "@comet/admin";

export function BrevoConfigPage(): JSX.Element {
    const { scopeParts } = useBrevoConfig();
    const { scope: completeScope } = useContentScope();

    const scope = scopeParts.reduce(
        (acc, scopePart) => {
            acc[scopePart] = completeScope[scopePart];
            return acc;
        },
        {} as { [key: string]: unknown },
    );

    return <BrevoConfigForm scope={scope} />;
}
