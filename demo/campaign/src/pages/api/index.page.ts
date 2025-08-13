import { generateMjmlMailContent } from "@src/components/RenderedMail";
import { getMessages } from "@src/lang";
import mjml2html from "mjml";
import { type NextApiRequest, type NextApiResponse } from "next";
import { z } from "zod";

const requestQueryValidationSchema = z.object({
    content: z.object({ blocks: z.array(z.any()) }),
    title: z.string(),
    scope: z.object({ domain: z.string(), language: z.string() }),
});

export default async function getMailHtml(request: NextApiRequest, response: NextApiResponse): Promise<void> {
    // Add authentication here if needed, else this is a public endpoint

    const validationResult = requestQueryValidationSchema.safeParse(request.body);

    if (!validationResult.success) {
        response.status(400).send({ message: "Sent data not valid" });
        response.end();
        return;
    }

    const { content, scope } = request.body;

    const [messages] = await Promise.all([getMessages(scope.language)]);
    const mjmlContent = generateMjmlMailContent(content, { locale: scope.language, messages, defaultLocale: scope.language });
    const { html } = mjml2html(mjmlContent);

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.write(html);
    response.end();
}
