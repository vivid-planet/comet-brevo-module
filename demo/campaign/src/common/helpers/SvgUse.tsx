import { type FunctionComponent, type SVGProps } from "react";

interface SvgUseProps extends SVGProps<SVGSVGElement> {
    href: string;
}

export const SvgUse: FunctionComponent<SvgUseProps> = ({ href, ...props }) => {
    const assetUrl = createAssetUrl(href);
    return (
        <svg {...props}>
            <use href={assetUrl} xlinkHref={assetUrl} />
        </svg>
    );
};

function createAssetUrl(url: string): string {
    if (process.env.NEXT_PUBLIC_CAMPAIGN_IS_PREVIEW !== "true") {
        return url;
    } else {
        return `/site${url}`;
    }
}
