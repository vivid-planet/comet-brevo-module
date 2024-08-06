export const validSizes: number[] = (process.env.DAM_ALLOWED_IMAGE_SIZES as string)
    .split(",")
    .map((value) => parseInt(value))
    .sort((a, b) => a - b);

export const getDamAllowedImageWidth = (minimumWidth: number, contentWidth): number => {
    let width: number | null = null;
    const largestPossibleWidth = validSizes[validSizes.length - 1];

    validSizes.forEach((validWidth) => {
        if (minimumWidth === contentWidth) {
            width = contentWidth * 2;
        } else if (!width && validWidth >= minimumWidth * 2) {
            width = validWidth;
        }
    });

    if (!width) {
        return largestPossibleWidth;
    }

    return width;
};
