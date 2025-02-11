import { CopyToClipboardButton } from "@comet/admin";
import { createRichTextBlock } from "@comet/cms-admin";
import { Box, FormLabel, List, ListItem, ListItemText, Paper } from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";

import { LinkBlock } from "./LinkBlock";

const placeholders = [
    {
        placeholder: "{{SALUTATION}}",
        helper: <FormattedMessage id="cometBrevoModule.richText.placeholder.salutation" defaultMessage="Dear Mr./Ms. LASTNAME" />,
    },
];

export function createNewsletterRichTextBlock(): ReturnType<typeof createRichTextBlock> {
    const RichTextBlock = createRichTextBlock({
        link: LinkBlock,
        rte: { supports: ["bold", "italic", "header-one", "header-two", "header-three", "header-four", "header-five", "header-six"] },
    });

    return {
        ...RichTextBlock,
        AdminComponent: (rteAdminComponentProps) => (
            <>
                <Box mb={2}>
                    <RichTextBlock.AdminComponent {...rteAdminComponentProps} />
                </Box>
                <FormLabel>
                    <FormattedMessage id="cometBrevoModule.richText.placeholder.info" defaultMessage="Placeholders available in the text" />
                </FormLabel>
                <Paper variant="outlined">
                    <List>
                        {placeholders.map(({ placeholder, helper }) => {
                            const placeholderText = <Box sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{placeholder}</Box>;
                            return (
                                <ListItem key={placeholder} secondaryAction={<CopyToClipboardButton copyText={placeholder} />}>
                                    <ListItemText primary={placeholderText} secondary={helper} />
                                </ListItem>
                            );
                        })}
                    </List>
                </Paper>
            </>
        ),
    };
}

export const RichTextBlock = createNewsletterRichTextBlock();
