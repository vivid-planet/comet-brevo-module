import * as React from "react";

type ContentScope = { domain: string; language: string };

const ContentScopeContext = React.createContext<ContentScope | undefined>(undefined);

function ContentScopeProvider({ scope, children }: React.PropsWithChildren<{ scope: ContentScope }>) {
    return <ContentScopeContext.Provider value={scope}>{children}</ContentScopeContext.Provider>;
}

function useContentScope(): ContentScope {
    const context = React.useContext(ContentScopeContext);

    if (context === undefined) {
        throw new Error("useContentScope must be used within a ContentScopeProvider");
    }

    return context;
}

export { ContentScopeProvider, useContentScope };
export type { ContentScope };
