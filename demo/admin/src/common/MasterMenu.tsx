import { Assets, Dashboard, Mail, PageTree, Wrench } from "@comet/admin-icons";
import { createBrevoContactsPage, createEmailCampaignsPage, createTargetGroupsPage } from "@comet/brevo-admin";
import {
    AllCategories,
    ContentScopeIndicator,
    createRedirectsPage,
    DamPage,
    DocumentInterface,
    MasterMenu,
    MasterMenuData,
    MasterMenuRoutes,
    PagesPage,
    PublisherPage,
} from "@comet/cms-admin";
import { BrevoContactConfig, getBrevoContactConfig } from "@src/common/brevoModuleConfig/brevoContactsPageAttributesConfig";
import { additionalFormConfig } from "@src/common/brevoModuleConfig/targetGroupFormConfig";
import { DashboardPage } from "@src/dashboard/DashboardPage";
import { Link } from "@src/documents/links/Link";
import { Page } from "@src/documents/pages/Page";
import { EmailCampaignContentBlock } from "@src/emailCampaigns/blocks/EmailCampaignContentBlock";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

export const pageTreeCategories: AllCategories = [
    {
        category: "MainNavigation",
        label: <FormattedMessage id="menu.pageTree.mainNavigation" defaultMessage="Main navigation" />,
    },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pageTreeDocumentTypes: Record<string, DocumentInterface<any, any>> = {
    Page,
    Link,
};
const RedirectsPage = createRedirectsPage({ scopeParts: ["domain"] });

const getMasterMenuData = ({ brevoContactConfig }: { brevoContactConfig: BrevoContactConfig }): MasterMenuData => {
    const BrevoContactsPage = createBrevoContactsPage({
        additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
        additionalGridFields: brevoContactConfig.additionalGridFields,
        additionalFormFields: brevoContactConfig.additionalFormFields,
        input2State: brevoContactConfig.input2State,
    });

    const TargetGroupsPage = createTargetGroupsPage({
        additionalFormFields: additionalFormConfig.additionalFormFields,
        exportTargetGroupOptions: {
            additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
            exportFields: brevoContactConfig.exportFields,
        },
        nodeFragment: additionalFormConfig.nodeFragment,
        input2State: additionalFormConfig.input2State,
    });

    const CampaignsPage = createEmailCampaignsPage({
        EmailCampaignContentBlock,
    });

    return [
        {
            type: "route",
            primary: <FormattedMessage id="menu.dashboard" defaultMessage="Dashboard" />,
            icon: <Dashboard />,
            route: {
                path: "/dashboard",
                component: DashboardPage,
            },
        },
        {
            type: "route",
            primary: <FormattedMessage id="menu.pageTree" defaultMessage="Page tree" />,
            icon: <PageTree />,
            route: {
                path: "/pages/pagetree/main-navigation",
                render: () => (
                    <PagesPage
                        path="/pages/pagetree/main-navigation"
                        allCategories={pageTreeCategories}
                        documentTypes={pageTreeDocumentTypes}
                        category="MainNavigation"
                        renderContentScopeIndicator={(scope) => <ContentScopeIndicator scope={scope} />}
                    />
                ),
            },
            requiredPermission: "pageTree",
        },
        {
            type: "collapsible",
            primary: <FormattedMessage id="menu.newsletter" defaultMessage="Newsletter" />,
            icon: <Mail />,
            items: [
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.newsletter.emailCampaigns" defaultMessage="Email campaigns" />,
                    route: {
                        path: "/newsletter/email-campaigns",
                        component: CampaignsPage,
                    },
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.newsletter.emailCampaigns" defaultMessage="Contacts" />,
                    route: {
                        path: "/newsletter/contacts",
                        render: () => <BrevoContactsPage />,
                    },
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.newsletter.targetGroups" defaultMessage="Target groups" />,
                    route: {
                        path: "/newsletter/target-groups",
                        render: () => <TargetGroupsPage />,
                    },
                },
            ],
            requiredPermission: "brevo-newsletter",
        },
        {
            type: "route",
            primary: <FormattedMessage id="menu.dam" defaultMessage="Assets" />,
            icon: <Assets />,
            route: {
                path: "/assets",
                component: DamPage,
            },
            requiredPermission: "dam",
        },
        {
            type: "collapsible",
            primary: <FormattedMessage id="menu.system" defaultMessage="System" />,
            icon: <Wrench />,
            items: [
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.publisher" defaultMessage="Publisher" />,
                    route: {
                        path: "/system/publisher",
                        component: PublisherPage,
                    },
                    requiredPermission: "builds",
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.redirects" defaultMessage="Redirects" />,
                    route: {
                        path: "/system/redirects",
                        render: () => <RedirectsPage redirectPathAfterChange="/system/redirects" />,
                    },
                    requiredPermission: "pageTree",
                },
            ],
            requiredPermission: "pageTree",
        },
    ];
};

export const AppMasterMenu = () => {
    const intl = useIntl();

    const masterMenuDataForScope = React.useMemo(() => getMasterMenuData({ brevoContactConfig: getBrevoContactConfig(intl) }), [intl]);

    return <MasterMenu menu={masterMenuDataForScope} />;
};

export const MasterRoutes = () => {
    const intl = useIntl();

    const masterMenuDataForScope = React.useMemo(() => getMasterMenuData({ brevoContactConfig: getBrevoContactConfig(intl) }), [intl]);

    return <MasterMenuRoutes menu={masterMenuDataForScope} />;
};
