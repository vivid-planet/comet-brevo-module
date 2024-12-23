import { Menu, MenuCollapsibleItem, MenuContext, MenuItemRouterLink, useWindowSize } from "@comet/admin";
import { Assets, Dashboard, Mail, PageTree, Wrench } from "@comet/admin-icons";
import * as React from "react";
import { useIntl } from "react-intl";
import { useRouteMatch } from "react-router";

const permanentMenuMinWidth = 1024;

export const MasterMenu: React.FC = () => {
    const { open, toggleOpen } = React.useContext(MenuContext);
    const windowSize = useWindowSize();
    const intl = useIntl();
    const match = useRouteMatch();

    const useTemporaryMenu: boolean = windowSize.width < permanentMenuMinWidth;

    // Open menu when changing to permanent variant and close when changing to temporary variant.
    React.useEffect(() => {
        if ((useTemporaryMenu && open) || (!useTemporaryMenu && !open)) {
            toggleOpen();
        }
        // useEffect dependencies must only include `location`, because the function should only be called once after changing the location.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    return (
        <Menu variant={useTemporaryMenu ? "temporary" : "permanent"}>
            <MenuItemRouterLink
                primary={intl.formatMessage({ id: "menu.dashboard", defaultMessage: "Dashboard" })}
                icon={<Dashboard />}
                to={`${match.url}/dashboard`}
            />
            <MenuItemRouterLink
                primary={intl.formatMessage({ id: "menu.pageTree", defaultMessage: "Page tree" })}
                icon={<PageTree />}
                to={`${match.url}/pages/pagetree/main-navigation`}
            />
            <MenuCollapsibleItem primary={intl.formatMessage({ id: "menu.newsletter", defaultMessage: "Newsletter" })} icon={<Mail />}>
                <MenuItemRouterLink
                    primary={intl.formatMessage({ id: "menu.newsletter.contacts", defaultMessage: "Contacts" })}
                    to={`${match.url}/newsletter/contacts`}
                />
                <MenuItemRouterLink
                    primary={intl.formatMessage({ id: "menu.newsletter.testContacts", defaultMessage: "Test contacts" })}
                    to={`${match.url}/newsletter/test-contacts`}
                />
                <MenuItemRouterLink
                    primary={intl.formatMessage({ id: "menu.newsletter.targetGroups", defaultMessage: "Target groups" })}
                    to={`${match.url}/newsletter/target-groups`}
                />
                <MenuItemRouterLink
                    primary={intl.formatMessage({ id: "menu.newsletter.emailCampaigns", defaultMessage: "Email campaigns" })}
                    to={`${match.url}/newsletter/email-campaigns`}
                />
            </MenuCollapsibleItem>
            <MenuItemRouterLink
                primary={intl.formatMessage({ id: "menu.dam", defaultMessage: "Assets" })}
                icon={<Assets />}
                to={`${match.url}/assets`}
            />
            <MenuCollapsibleItem primary={intl.formatMessage({ id: "menu.system", defaultMessage: "System" })} icon={<Wrench />}>
                <MenuItemRouterLink
                    primary={intl.formatMessage({ id: "menu.publisher", defaultMessage: "Publisher" })}
                    to={`${match.url}/system/publisher`}
                />
                <MenuItemRouterLink
                    primary={intl.formatMessage({ id: "menu.redirects", defaultMessage: "Redirects" })}
                    to={`${match.url}/system/redirects`}
                />
            </MenuCollapsibleItem>
        </Menu>
    );
};
