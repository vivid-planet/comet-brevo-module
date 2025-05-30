import "@fontsource-variable/roboto-flex/full.css";
import "material-design-icons/iconfont/material-icons.css";

import { ApolloProvider } from "@apollo/client";
import { ErrorDialogHandler, MasterLayout, MuiThemeProvider, RouterBrowserRouter, SnackbarProvider } from "@comet/admin";
import { BrevoConfigProvider } from "@comet/brevo-admin";
import {
    AllCategories,
    BuildInformationProvider,
    CmsBlockContextProvider,
    createHttpClient,
    CurrentUserProvider,
    LocaleProvider,
    SitePreview,
    SitesConfigProvider,
} from "@comet/cms-admin";
import { css, Global } from "@emotion/react";
import { ContentScope, ContentScopeProvider } from "@src/common/ContentScopeProvider";
import { MasterRoutes } from "@src/common/MasterMenu";
import { getMessages } from "@src/lang";
import { theme } from "@src/theme";
import * as React from "react";
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
const apiClient = createHttpClient(config.apiUrl);

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

export function App() {
    return (
        <ApolloProvider client={apolloClient}>
            <BuildInformationProvider value={{ date: config.buildDate, number: config.buildNumber, commitHash: config.commitSha }}>
                <SitesConfigProvider
                    value={{
                        configs: config.sitesConfig,
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
                >
                    <IntlProvider locale="en" defaultLocale="en" messages={getMessages()}>
                        <LocaleProvider resolveLocaleForScope={(scope: ContentScope) => scope.domain}>
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
                                                <CmsBlockContextProvider
                                                    damConfig={{
                                                        apiUrl: config.apiUrl,
                                                        apiClient,
                                                        maxFileSize: config.dam.uploadsMaxFileSize,
                                                        maxSrcResolution: config.imgproxy.maxSrcResolution,
                                                        allowedImageAspectRatios: config.dam.allowedImageAspectRatios,
                                                    }}
                                                    pageTreeCategories={categories}
                                                    pageTreeDocumentTypes={pageTreeDocumentTypes}
                                                >
                                                    <RouterBrowserRouter>
                                                        <GlobalStyle />
                                                        <ContentScopeProvider>
                                                            {({ match }) => (
                                                                <Switch>
                                                                    <Route
                                                                        path={`${match.path}/preview`}
                                                                        render={(props) => <SitePreview {...props} />}
                                                                    />
                                                                    <Route>
                                                                        <MasterLayout headerComponent={MasterHeader} menuComponent={AppMasterMenu}>
                                                                            <MasterRoutes />
                                                                        </MasterLayout>
                                                                    </Route>
                                                                </Switch>
                                                            )}
                                                        </ContentScopeProvider>
                                                    </RouterBrowserRouter>
                                                </CmsBlockContextProvider>
                                            </BrevoConfigProvider>
                                        </SnackbarProvider>
                                    </DndProvider>
                                </CurrentUserProvider>
                            </MuiThemeProvider>
                        </LocaleProvider>
                    </IntlProvider>
                </SitesConfigProvider>
            </BuildInformationProvider>
        </ApolloProvider>
    );
}
