import { legacyPagesRouterSitePreviewApiHandler } from "@comet/site-nextjs";
import { createGraphQLClient } from "@src/util/createGraphQLClient";
import { NextApiHandler } from "next";

const SitePreviewApiHandler: NextApiHandler = async (req, res) => {
    await legacyPagesRouterSitePreviewApiHandler(req, res, createGraphQLClient());
};

export default SitePreviewApiHandler;
