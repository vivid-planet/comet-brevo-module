import { Assets, Dashboard, Mail, PageTree, Wrench } from "@comet/admin-icons";
import {
    BrevoConfigPage,
    createBrevoContactsPage,
    createBrevoTestContactsPage,
    createEmailCampaignsPage,
    createTargetGroupsPage,
} from "@comet/brevo-admin";
import {
    type AllCategories,
    ContentScopeIndicator,
    createRedirectsPage,
    DamPage,
    type DocumentInterface,
    MasterMenu,
    type MasterMenuData,
    MasterMenuRoutes,
    PagesPage,
    PublisherPage,
} from "@comet/cms-admin";
import { type BrevoContactConfig, getBrevoContactConfig } from "@src/common/brevoModuleConfig/brevoContactsPageAttributesConfig";
import { additionalFormConfig } from "@src/common/brevoModuleConfig/targetGroupFormConfig";
import { DashboardPage } from "@src/dashboard/DashboardPage";
import { Link } from "@src/documents/links/Link";
import { Page } from "@src/documents/pages/Page";
import { EmailCampaignContentBlock } from "@src/emailCampaigns/blocks/EmailCampaignContentBlock";
import { useMemo } from "react";
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
const RedirectsPage = createRedirectsPage();

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

    const BrevoTestContactsPage = createBrevoTestContactsPage({
        additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
        additionalGridFields: brevoContactConfig.additionalGridFields,
        additionalFormFields: brevoContactConfig.additionalFormFields,
        input2State: brevoContactConfig.input2State,
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
                    primary: <FormattedMessage id="menu.newsletter.testContacts" defaultMessage="Test contacts" />,
                    route: {
                        path: "/newsletter/test-contacts",
                        render: () => <BrevoTestContactsPage />,
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
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.newsletter.config" defaultMessage="Config" />,
                    route: {
                        path: "/newsletter/config",
                        render: () => <BrevoConfigPage />,
                    },
                    requiredPermission: "brevoNewsletterConfig",
                },
            ],
            requiredPermission: "brevoNewsletter",
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

    const masterMenuDataForScope = useMemo(() => getMasterMenuData({ brevoContactConfig: getBrevoContactConfig(intl) }), [intl]);

    return <MasterMenu menu={masterMenuDataForScope} />;
};

export const MasterRoutes = () => {
    const intl = useIntl();

    const masterMenuDataForScope = useMemo(() => getMasterMenuData({ brevoContactConfig: getBrevoContactConfig(intl) }), [intl]);

    return <MasterMenuRoutes menu={masterMenuDataForScope} />;
};
