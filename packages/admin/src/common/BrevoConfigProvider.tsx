import React from "react";

export interface BrevoConfig {
    apiUrl: string;
}

const BrevoConfigContext = React.createContext<BrevoConfig | undefined>(undefined);

interface BrevoConfigProviderProps {
    value: BrevoConfig;
}

export const BrevoConfigProvider = ({ children, value }: React.PropsWithChildren<BrevoConfigProviderProps>) => {
    return <BrevoConfigContext.Provider value={value}>{children}</BrevoConfigContext.Provider>;
};

export const useBrevoConfig = (): BrevoConfig => {
    const context = React.useContext(BrevoConfigContext);
    if (context === undefined) {
        throw new Error("useBrevoConfig must be used within a BrevoConfigProvider");
    }
    return context;
};
