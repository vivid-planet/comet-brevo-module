import { createListBlock } from "@comet/cms-admin";

import { TextLinkBlock } from "./TextLinkBlock";

export const LinkListBlock = createListBlock({ name: "LinkList", block: TextLinkBlock });
