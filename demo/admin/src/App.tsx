import "@fontsource-variable/roboto-flex/full.css";
import "material-design-icons/iconfont/material-icons.css";

import { ApolloProvider } from "@apollo/client";
import { ErrorDialogHandler, MasterLayout, MuiThemeProvider, RouterBrowserRouter, SnackbarProvider } from "@comet/admin";
import { BrevoConfigProvider } from "@comet/brevo-admin";
import { type AllCategories, CometConfigProvider, type ContentScope, ContentScopeProvider, CurrentUserProvider, SitePreview } from "@comet/cms-admin";
import { css, Global } from "@emotion/react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { MasterRoutes } from "@src/common/MasterMenu";
import { getMessages } from "@src/lang";
import { theme } from "@src/theme";
import { enUS } from "date-fns/locale";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FormattedMessage, IntlProvider } from "react-intl";
import { Route, Switch } from "react-router";

import { createApolloClient } from "./common/apollo/createApolloClient";
import { MasterHeader } from "./common/MasterHeader";
import { AppMasterMenu } from "./common/MasterMenu";
import { createConfig } from "./config";
import { Link } from "./documents/links/Link";
import { Page } from "./documents/pages/Page";
import { type GQLPermission } from "./graphql.generated";

const GlobalStyle = () => (
    <Global
        styles={css`
            body {
                margin: 0;
            }
        `}
    />
);
const config = createConfig();
const apolloClient = createApolloClient(config.apiUrl);

const categories: AllCategories = [
    {
        category: "MainNavigation",
        label: <FormattedMessage id="menu.pageTree.mainNavigation" defaultMessage="Main navigation" />,
    },
];

const pageTreeDocumentTypes = {
    Page,
    Link,
};

declare module "@comet/cms-admin" {
    export interface PermissionOverrides {
        permission: GQLPermission;
    }
}

export function App() {
    return (
        <CometConfigProvider
            {...config}
            graphQLApiUrl={`${config.apiUrl}/graphql`}
            pageTree={{
                categories: categories,
                documentTypes: pageTreeDocumentTypes,
            }}
            redirects={{ scopeParts: ["domain"] }}
            siteConfigs={{
                configs: config.siteConfigs,
                resolveSiteConfigForScope: (configs, scope: ContentScope) => {
                    const siteConfig = configs[scope.domain];
                    return {
                        ...siteConfig,
                        previewUrl: `${siteConfig.blockPreviewBaseUrl}/${scope.language}`,
                        blockPreviewBaseUrl: `${siteConfig.url}/block-preview`,
                        sitePreviewApiUrl: `${siteConfig.url}/api/site-preview`,
                    };
                },
            }}
            buildInformation={{ date: config.buildDate, number: config.buildNumber, commitHash: config.commitSha }}
            contentLanguage={{ resolveContentLanguageForScope: (scope: ContentScope) => scope.domain }}
        >
            <ApolloProvider client={apolloClient}>
                <IntlProvider locale="en" defaultLocale="en" messages={getMessages()}>
                    <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        /*
                         * TODO: If the application uses internationalization or another language than enUS,
                         * the locale must be adapted to the correct one from date-fns/locale
                         */
                        adapterLocale={enUS}
                    >
                        <MuiThemeProvider theme={theme}>
                            <ErrorDialogHandler />
                            <CurrentUserProvider>
                                <DndProvider backend={HTML5Backend}>
                                    <SnackbarProvider>
                                        <BrevoConfigProvider
                                            value={{
                                                scopeParts: ["domain", "language"],
                                                apiUrl: config.apiUrl,
                                                resolvePreviewUrlForScope: (scope: ContentScope) => {
                                                    return `${config.campaignUrl}/block-preview/${scope.domain}/${scope.language}`;
                                                },
                                                allowAddingContactsWithoutDoi: config.allowAddingContactsWithoutDoi,
                                            }}
                                        >
                                            <RouterBrowserRouter>
                                                <GlobalStyle />
                                                <ContentScopeProvider>
                                                    {({ match }) => (
                                                        <Switch>
                                                            <Route path={`${match.path}/preview`} render={(props) => <SitePreview {...props} />} />
                                                            <Route>
                                                                <MasterLayout headerComponent={MasterHeader} menuComponent={AppMasterMenu}>
                                                                    <MasterRoutes />
                                                                </MasterLayout>
                                                            </Route>
                                                        </Switch>
                                                    )}
                                                </ContentScopeProvider>
                                            </RouterBrowserRouter>
                                        </BrevoConfigProvider>
                                    </SnackbarProvider>
                                </DndProvider>
                            </CurrentUserProvider>
                        </MuiThemeProvider>
                    </LocalizationProvider>
                </IntlProvider>
            </ApolloProvider>
        </CometConfigProvider>
    );
}
