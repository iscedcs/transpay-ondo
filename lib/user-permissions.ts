import type { SystemUser } from "@/types/users";
import { USER_ROLES } from "@/lib/constants";
import { User } from "@prisma/client";

export interface UserPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canResetPassword: boolean;
  canSuspend: boolean;
  canChangeRole: boolean;
  canChangeLGA: boolean;
  canChangeState: boolean;
  editableRoles: string[];
}

export function getUserPermissions(
  currentUser: User,
  targetUser: SystemUser
): UserPermissions {
  const basePermissions: UserPermissions = {
    canView: false,
    canEdit: false,
    canDelete: false,
    canResetPassword: false,
    canSuspend: false,
    canChangeRole: false,
    canChangeLGA: false,
    canChangeState: false,
    editableRoles: [],
  };

  // Super Admin has full access to all users
  if (currentUser.role === USER_ROLES.SUPERADMIN) {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canResetPassword: true,
      canSuspend: true,
      canChangeRole: true,
      canChangeLGA: true,
      canChangeState: true,
      editableRoles: Object.values(USER_ROLES),
    };
  }

  // Admin has access to users within their state
  if (currentUser.role === USER_ROLES.ADMIN) {
    const sameState =
      currentUser.lgaId === targetUser.stateId || targetUser.stateId === "1"; // Assuming state ID 1 for now

    if (sameState && targetUser.role !== USER_ROLES.SUPERADMIN) {
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canResetPassword: true,
        canSuspend: true,
        canChangeRole: true,
        canChangeLGA: true,
        canChangeState: false, // Admin can't change state assignment
        editableRoles: [
          USER_ROLES.ADMIN,
          USER_ROLES.AGENCY_ADMIN,
          USER_ROLES.AGENCY_AGENT,
          USER_ROLES.ODIRS_C_AGENT,
          USER_ROLES.VEHICLE_OWNER,
        ],
      };
    }
  }

  // LGA Admin has limited access to users within their LGA
  if (currentUser.role === USER_ROLES.AGENCY_ADMIN) {
    const sameLGA = currentUser.lgaId === targetUser.lgaId;

    if (sameLGA) {
      // Can view all users in same LGA
      const permissions: UserPermissions = {
        ...basePermissions,
        canView: true,
        canResetPassword: true,
        canSuspend: true,
      };

      // Can edit only LGA agents and compliance officers
      if (
        targetUser.role === USER_ROLES.AGENCY_AGENT ||
        targetUser.role === USER_ROLES.ODIRS_C_AGENT
      ) {
        permissions.canEdit = true;
        permissions.canChangeRole = true;
        permissions.editableRoles = [
          USER_ROLES.AGENCY_AGENT,
          USER_ROLES.ODIRS_C_AGENT,
        ];
      }

      // Cannot edit other LGA admins, admins, or super admins
      if (
        targetUser.role === USER_ROLES.AGENCY_ADMIN ||
        targetUser.role === USER_ROLES.ADMIN ||
        targetUser.role === USER_ROLES.SUPERADMIN
      ) {
        permissions.canEdit = false;
        permissions.canChangeRole = false;
      }

      return permissions;
    }
  }

  return basePermissions;
}

export function canAccessUserProfile(
  currentUser: User,
  targetUserId: string
): boolean {
  // Super Admin and Admin can access any user profile
  if (
    currentUser.role === USER_ROLES.SUPERADMIN ||
    currentUser.role === USER_ROLES.ADMIN
  ) {
    return true;
  }

  // LGA Admin can access users in their LGA
  if (currentUser.role === USER_ROLES.AGENCY_ADMIN) {
    // This would need to be checked against the actual user data
    return true; // Will be validated in the component
  }

  return false;
}
