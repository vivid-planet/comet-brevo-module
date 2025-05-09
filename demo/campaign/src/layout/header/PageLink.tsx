import { LinkBlock } from "@src/common/blocks/LinkBlock";
import { gql } from "graphql-request";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";

import { GQLPageLinkFragment } from "./PageLink.generated";

const pageLinkFragment = gql`
    fragment PageLink on PageTreeNode {
        path
        documentType
        document {
            __typename
            ... on Link {
                content
            }
        }
    }
`;

interface Props {
    page: GQLPageLinkFragment;
    children: ((active: boolean) => React.ReactElement) | React.ReactElement;
}

function PageLink({ page, children }: Props): JSX.Element | null {
    const router = useRouter();
    const active = router.asPath === page.path;

    if (page.documentType === "Link") {
        if (page.document === null || page.document.__typename !== "Link") {
            return null;
        }

        return <LinkBlock data={page.document.content}>{typeof children === "function" ? children(active) : children}</LinkBlock>;
    } else if (page.documentType === "Page") {
        return (
            <Link href={page.path} passHref>
                {typeof children === "function" ? children(active) : children}
            </Link>
        );
    } else {
        if (process.env.NODE_ENV === "development") {
            throw new Error(`Unknown documentType "${page.documentType}"`);
        }

        return null;
    }
}

export { PageLink, pageLinkFragment };
