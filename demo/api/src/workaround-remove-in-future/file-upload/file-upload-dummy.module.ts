import { Module } from "@nestjs/common";
import { FileUploadDummyResolver } from "@src/workaround-remove-in-future/file-upload/file-upload-dummy.resolver";

// necessary as a workaround for https://github.com/vivid-planet/comet/pull/2677
// can be removed once https://github.com/vivid-planet/comet/pull/2679 is released
@Module({
    providers: [FileUploadDummyResolver],
})
export class FileUploadDummyModule {}
