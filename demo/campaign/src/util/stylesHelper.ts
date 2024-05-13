/**
 * Helper function to enable syntax highlighting & auto-formatting for CSS strings when using the styled-components IDE plugin.
 */
export const css = (strings: TemplateStringsArray, ...rest: unknown[]): string => String.raw({ raw: strings }, ...rest);
