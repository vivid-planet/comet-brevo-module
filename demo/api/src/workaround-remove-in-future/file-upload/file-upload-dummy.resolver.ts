import { FileUpload, RequiredPermission } from "@comet/cms-api";
import { Query, Resolver } from "@nestjs/graphql";

// dummy resolver, necessary as a workaround for https://github.com/vivid-planet/comet/pull/2677
// can be removed once https://github.com/vivid-planet/comet/pull/2679 is released
@Resolver(() => FileUpload)
@RequiredPermission(["fileUploads"], { skipScopeCheck: true })
export class FileUploadDummyResolver {
    @Query(() => FileUpload, { nullable: true })
    dontUseFileUploadDummy(): FileUpload | undefined {
        return undefined;
    }
}
