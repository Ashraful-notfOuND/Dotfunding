import { useMemo } from 'react';
import { useAuth } from './useAuth';

export type ProjectRole = 'creator' | 'backer' | 'visitor' | 'admin';

interface UseProjectRoleResult {
  role: ProjectRole;
  isCreator: boolean;
  isBacker: boolean;
  isVisitor: boolean;
  isAdmin: boolean;
  canManageProject: boolean;
  canViewAnalytics: boolean;
  canViewBackers: boolean;
  canEditProject: boolean;
}

/**
 * Hook to determine user's role in relation to a project
 * Scalable for future roles (moderator, collaborator, etc.)
 */
export function useProjectRole(
  projectCreatorId: string | null,
  userHasBacked?: boolean
): UseProjectRoleResult {
  const { user } = useAuth();

  const role = useMemo<ProjectRole>(() => {
    if (!user) return 'visitor';
    
    // Check for admin role (can be extended with actual admin check from user metadata)
    if ((user as any).role === 'admin' || (user as any).isAdmin) return 'admin';
    
    // Check if user is the creator
    if (user.id === projectCreatorId) return 'creator';
    
    // Check if user has backed the project
    if (userHasBacked) return 'backer';
    
    // Default to visitor for logged-in users who haven't backed
    return 'visitor';
  }, [user, projectCreatorId, userHasBacked]);

  const permissions = useMemo(() => ({
    role,
    isCreator: role === 'creator',
    isBacker: role === 'backer',
    isVisitor: role === 'visitor',
    isAdmin: role === 'admin',
    canManageProject: role === 'creator' || role === 'admin',
    canViewAnalytics: role === 'creator' || role === 'admin',
    canViewBackers: role === 'creator' || role === 'admin',
    canEditProject: role === 'creator' || role === 'admin',
  }), [role]);

  return permissions;
}
