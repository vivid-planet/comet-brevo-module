export const HIDE_IN_OUTLOOK_START_IF = "__IF_NOT_OUTLOOK__";
export const HIDE_IN_OUTLOOK_END_IF = "__END_IF__";

// Helper for hiding elements from Outlook/Windows Mail
// Replaces placeholder with conditional statement to tell the client to ignore the contained content if it's not Outlook/Windows Mail
// MJML escapes special characters, so this function replaces the placeholder after MJML generates html
export const getPreparedHtml = (html: string) => {
    return html
        .replace(new RegExp(HIDE_IN_OUTLOOK_START_IF, "g"), "<!--[if !mso]><!-- -->")
        .replace(new RegExp(HIDE_IN_OUTLOOK_END_IF, "g"), "<!--<![endif]-->");
};
