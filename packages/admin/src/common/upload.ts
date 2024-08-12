import { createConfig } from "../config";
import { GQLEmailCampaignContentScopeInput } from "../graphql.generated";

const config = createConfig();

export function upload(file: File, scope: GQLEmailCampaignContentScopeInput, listIds?: number[]): Promise<Response> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("scope", JSON.stringify(scope));
    if (listIds) formData.append("listIds", JSON.stringify(listIds));

    return fetch(`${config.apiUrl}/brevo-contacts-csv/upload`, {
        method: "POST",
        body: formData,
    });
}
