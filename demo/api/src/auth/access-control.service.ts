import { AbstractAccessControlService, ContentScopesForUser, PermissionsForUser, User, UserPermissions } from "@comet/cms-api";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AccessControlService extends AbstractAccessControlService {
    getPermissionsForUser(user: User): PermissionsForUser {
        return UserPermissions.allPermissions;
    }
    getContentScopesForUser(user: User): ContentScopesForUser {
        return UserPermissions.allContentScopes;
    }
}
