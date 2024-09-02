import { SitePreviewParams } from "@comet/cms-site";
import { ContentScope } from "@src/common/contentScope/ContentScope";
import { defaultLanguage, domain as configuredDomain, domain } from "@src/config";
import { Page as PageTypePage, pageQuery as PageTypePageQuery } from "@src/documents/pages/Page";
import { GQLPage, GQLPageTreeNodeScopeInput } from "@src/graphql.generated";
import { getLayout } from "@src/layout/Layout";
import NotFound404 from "@src/pages/404.page";
import { createGraphQLClient } from "@src/util/createGraphQLClient";
import { gql } from "graphql-request";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { ParsedUrlQuery } from "querystring";
import * as React from "react";

import { GQLPagesQuery, GQLPagesQueryVariables, GQLPageTypeQuery, GQLPageTypeQueryVariables } from "./[[...path]].page.generated";

interface PageProps {
    documentType: string;
    id: string;
    pageTreeNode: { path: string; name: string };
    breadcrumbs: string[];
    scope: ContentScope;
}
export type PageUniversalProps = PageProps & GQLPage;

export default function Page(props: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
    if (!pageTypes[props.documentType]) {
        return (
            <NotFound404>
                <div>
                    unknown documentType: <em>{props.documentType}</em>
                </div>
            </NotFound404>
        );
    }
    const { component: Component } = pageTypes[props.documentType];

    return <Component {...props} />;
}

const pageTypeQuery = gql`
    query PageType($path: String!, $scope: PageTreeNodeScopeInput!) {
        pageTreeNodeByPath(path: $path, scope: $scope) {
            id
            documentType
            parentNodes {
                id
                documentType
                name
            }
        }
    }
`;

export const pageTypes = {
    Page: {
        query: PageTypePageQuery,
        component: PageTypePage,
    },
};

export const getStaticProps: GetStaticProps<PageUniversalProps, ParsedUrlQuery, SitePreviewParams & { scope: GQLPageTreeNodeScopeInput }> = async (
    context,
) => {
    const path = context.params?.path ?? "";

    const { scope, previewData } = context.previewData ?? { scope: { domain, language: context.locale ?? defaultLanguage }, previewData: undefined };

    const client = createGraphQLClient({
        includeInvisiblePages: context.preview,
        includeInvisibleBlocks: previewData?.includeInvisible,
        previewDamUrls: context.preview,
    });

    //fetch pageType
    const data = await client.request<GQLPageTypeQuery, GQLPageTypeQueryVariables>(pageTypeQuery, {
        path: `/${Array.isArray(path) ? path.join("/") : path}`,
        scope,
    });
    if (!data.pageTreeNodeByPath?.documentType) {
        // eslint-disable-next-line no-console
        console.log("got no data from api", data, path);
        return { notFound: true };
    }
    const pageId = data.pageTreeNodeByPath.id;

    const pageType = data.pageTreeNodeByPath.documentType;

    //pageType dependent query
    const { query: queryForPageType } = pageTypes[pageType];

    const [layout, pageTypeData] = await Promise.all([getLayout(client, scope), client.request(queryForPageType, { pageId })]);

    return {
        props: {
            layout,
            ...pageTypeData,
            documentType: data.pageTreeNodeByPath.documentType,
            id: pageId,
            scope,
        },
    };
};

const pagesQuery = gql`
    query Pages($contentScope: PageTreeNodeScopeInput!) {
        pageTreeNodeList(scope: $contentScope) {
            id
            path
            documentType
        }
    }
`;

export const getStaticPaths: GetStaticPaths = async ({ locales = [] }) => {
    const paths: Array<{ params: { path: string[] }; locale: string }> = [];
    if (process.env.SITE_IS_PREVIEW !== "true") {
        for (const locale of locales) {
            if (locale === "default") {
                continue;
            }
            const data = await createGraphQLClient().request<GQLPagesQuery, GQLPagesQueryVariables>(pagesQuery, {
                contentScope: { domain: configuredDomain, language: locale },
            });

            paths.push(
                ...data.pageTreeNodeList
                    .filter((page) => page.documentType === "Page")
                    .map((page) => {
                        const path = page.path.split("/");
                        path.shift(); // Remove "" caused by leading slash
                        return { params: { path }, locale };
                    }),
            );
        }
    }
    return {
        paths,
        fallback: false,
    };
};
