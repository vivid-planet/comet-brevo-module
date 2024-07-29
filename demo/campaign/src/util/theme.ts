const mailWidth = 600;
const contentSpacing = 20;

export const theme = {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    colors: {
        background: {
            content: "#f6f6f6",
        },
        text: {
            main: "#000000",
        },
    },
    mailSize: {
        mailWidth,
        contentSpacing: contentSpacing,
        contentWidth: mailWidth - contentSpacing * 2,
        breakpoints: {
            desktop: mailWidth,
        },
    },
};
