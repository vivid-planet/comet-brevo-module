// temporary copy from https://github.com/vivid-planet/comet/pull/2115/files
// remove as soon as it's available in COMET

import { Button, Dialog, Tooltip } from "@comet/admin";
import { MoreVertical } from "@comet/admin-icons";
// TODO v8: remove eslint-disable-next-line
import {
    Chip,
    type ChipProps,
    Divider,
    type DividerProps,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    type MenuListProps,
    type MenuProps,
    Typography,
    type TypographyProps, DialogContent } from "@mui/material";
import { type Maybe } from "graphql/jsutils/Maybe";
import { type ComponentProps, type PropsWithChildren, useState } from "react";
import { FormattedMessage } from "react-intl";

function CrudMoreActionsDivider(props: DividerProps) {
    return <Divider sx={{ margin: "8px 10px", borderColor: (theme) => theme.palette.grey[50] }} {...props} />;
}

interface CrudMoreActionsGroupProps {
    groupTitle: React.ReactNode;
    menuListProps?: MenuListProps;
    typographyProps?: React.ComponentProps<typeof Typography>;
}

function CrudMoreActionsGroup({ groupTitle, children, menuListProps, typographyProps }: PropsWithChildren<CrudMoreActionsGroupProps>) {
    return (
        <>
            <Typography variant="subtitle2" color={(theme) => theme.palette.grey[500]} fontWeight="bold" pt="20px" px="15px" {...typographyProps}>
                {groupTitle}
            </Typography>
            <MenuList {...menuListProps}>{children}</MenuList>
        </>
    );
}

export interface ActionItem extends ComponentProps<typeof MenuItem> {
    type: "action";
    label: React.ReactNode;
    startAdornment?: React.ReactNode;
}

export interface DividerItem extends ComponentProps<typeof Divider> {
    type: "divider";
}

export type CrudMoreActionsItem = ActionItem | DividerItem;

export interface CrudMoreActionsMenuProps {
    selectionSize?: number;
    buttonProps?: React.ComponentProps<typeof Button>;
    menuProps?: Partial<MenuProps>;
    chipProps?: Partial<ChipProps>;
    groupTypographyProps?: Partial<TypographyProps>;
    overallItems?: Maybe<CrudMoreActionsItem>[];
    selectiveItems?: Maybe<CrudMoreActionsItem>[];
}

function SelectedItemsChip({ label, ...restProps }: Partial<ChipProps>) {
    return (
        <Chip
            size="small"
            color="primary"
            sx={{ width: 20, height: 20, flexShrink: 0, borderRadius: 20, marginLeft: 1 }}
            {...restProps}
            label={label}
        />
    );
}

export function CrudMoreActionsMenu({
    overallItems,
    selectiveItems,
    buttonProps,
    menuProps,
    chipProps,
    groupTypographyProps,
    selectionSize,
}: CrudMoreActionsMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);

    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <Button
                variant="textDark"
                color="inherit"
                endIcon={<MoreVertical />}
                sx={{ mx: 2 }}
                {...buttonProps}
                onClick={(event) => {
                    handleClick(event);
                    buttonProps?.onClick?.(event);
                }}
            >
                <FormattedMessage id="comet.pages.dam.moreActions" defaultMessage="More actions" />
                {!!selectionSize && <SelectedItemsChip {...chipProps} label={selectionSize} />}
            </Button>
            <Menu
                keepMounted={false}
                PaperProps={{ sx: { minWidth: 220, borderRadius: "4px" } }}
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                {...menuProps}
                onClose={(event, reason) => {
                    handleClose();
                    menuProps?.onClose?.(event, reason);
                }}
            >
                {!!overallItems?.length && (
                    <CrudMoreActionsGroup
                        groupTitle={<FormattedMessage id="comet.dam.moreActions.overallActions" defaultMessage="Overall actions" />}
                        typographyProps={groupTypographyProps}
                        menuListProps={menuProps?.MenuListProps}
                    >
                        {overallItems.map((item, index) => {
                            if (!item) return null;
                            const { type } = item;
                            if (type === "action") {
                                const { label, startAdornment, onClick, ...rest } = item;

                                return (
                                    <MenuItem
                                        key={index}
                                        disabled={!!selectionSize}
                                        {...rest}
                                        onClick={(e) => {
                                            onClick?.(e);
                                            handleClose();
                                        }}
                                    >
                                        {!!startAdornment && <ListItemIcon>{startAdornment}</ListItemIcon>}
                                        <ListItemText primary={label} />
                                    </MenuItem>
                                );
                            } else if (type === "divider") {
                                return <CrudMoreActionsDivider {...item} key={index} />;
                            }
                        })}
                    </CrudMoreActionsGroup>
                )}

                {!!overallItems?.length && !!selectiveItems?.length && <CrudMoreActionsDivider />}

                {!!selectiveItems?.length && (
                    <CrudMoreActionsGroup
                        groupTitle={<FormattedMessage id="comet.dam.moreActions.selectiveActions" defaultMessage="Selective actions" />}
                        typographyProps={groupTypographyProps}
                        menuListProps={menuProps?.MenuListProps}
                    >
                        {selectiveItems.map((item, index) => {
                            if (!item) return;

                            const { type } = item;
                            if (type === "action") {
                                const { label, startAdornment, onClick, ...rest } = item;

                                return (
                                    <MenuItem
                                        key={index}
                                        disabled={!selectionSize}
                                        {...rest}
                                        onClick={(e) => {
                                            onClick?.(e);
                                            handleClose();
                                        }}
                                    >
                                        {!!startAdornment && <ListItemIcon>{startAdornment}</ListItemIcon>}
                                        <ListItemText primary={label} />
                                        {!!selectionSize && <SelectedItemsChip {...chipProps} label={selectionSize} />}
                                    </MenuItem>
                                );
                            } else if (item.type === "divider") {
                                return <CrudMoreActionsDivider {...item} key={index} />;
                            }
                        })}
                    </CrudMoreActionsGroup>
                )}
            </Menu>
        </>
    );
}
