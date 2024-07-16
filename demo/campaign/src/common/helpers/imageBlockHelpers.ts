export const validSizes: number[] = (process.env.DAM_ALLOWED_IMAGE_SIZES as string)
    .split(",")
    .map((value) => parseInt(value))
    .sort((a, b) => a - b);

export const getDamAllowedImageWidth = (minimumWidth: number): number => {
    let width: number = validSizes[validSizes.length - 1];

    validSizes.forEach((validWidth) => {
        if (validWidth >= minimumWidth) {
            width = validWidth;
        }
    });

    return width;
};
