import { type ContentScopeInterface, useContentScope } from "@comet/cms-admin";
import { createContext, useContext } from "react";
import { DialogContent } from "@mui/material";
import { Tooltip } from "@comet/admin";

export interface BrevoConfig {
    apiUrl: string;
    scopeParts: string[];
    resolvePreviewUrlForScope: (scope: ContentScopeInterface) => string;
    allowAddingContactsWithoutDoi?: boolean;
}

const BrevoConfigContext = createContext<BrevoConfig | undefined>(undefined);

interface BrevoConfigProviderProps {
    value: BrevoConfig;
}

export const BrevoConfigProvider = ({ children, value }: React.PropsWithChildren<BrevoConfigProviderProps>) => {
    return <BrevoConfigContext.Provider value={value}>{children}</BrevoConfigContext.Provider>;
};

interface UseBrevoConfigReturn {
    apiUrl: string;
    previewUrl: string;
    scopeParts: string[];
    allowAddingContactsWithoutDoi?: boolean;
}

export const useBrevoConfig = (): UseBrevoConfigReturn => {
    const { scope } = useContentScope();

    const context = useContext(BrevoConfigContext);
    if (context === undefined) {
        throw new Error("useBrevoConfig must be used within a BrevoConfigProvider");
    }

    const previewUrl = context.resolvePreviewUrlForScope(scope);
    const allowAddingContactsWithoutDoi = context.allowAddingContactsWithoutDoi ?? false;

    return { ...context, previewUrl, allowAddingContactsWithoutDoi };
};
