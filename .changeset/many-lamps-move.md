---
"@comet/brevo-admin": major
"@comet/brevo-api": major
---

Refactor brevo contact import to upload files to public uploads temporarily

The files for the brevo contact import now get temporarily stored in the public uploads until the import is concluded.
This change prepares for future imports to be handled in a separate job, allowing more than 100 contacts to be imported without exhausting api resources or blocking the event loop.

It is now necessary to import the `PublicUploadsModule` in the project's `AppModule` and configure it to accept csv files.

```ts
        PublicUploadModule.register({
            acceptedMimeTypes: ["text/csv"],
            maxFileSize: config.publicUploads.maxFileSize,
            directory: `${config.blob.storageDirectoryPrefix}-public-uploads`,
        }),
```
