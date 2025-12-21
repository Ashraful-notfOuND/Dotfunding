import { ReactNode } from 'react';
import { ProjectRole } from '@/hooks/useProjectRole';

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: ProjectRole[];
  currentRole: ProjectRole;
  fallback?: ReactNode;
}

/**
 * Composition-based role gating component
 * Prevents prop-drilling and scattered if(isCreator) checks
 */
export function RoleGate({ 
  children, 
  allowedRoles, 
  currentRole, 
  fallback = null 
}: RoleGateProps) {
  if (!allowedRoles.includes(currentRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Specialized gates for common use cases
export function CreatorOnly({ 
  children, 
  currentRole, 
  fallback 
}: Omit<RoleGateProps, 'allowedRoles'>) {
  return (
    <RoleGate 
      allowedRoles={['creator', 'admin']} 
      currentRole={currentRole}
      fallback={fallback}
    >
      {children}
    </RoleGate>
  );
}

export function BackerOnly({ 
  children, 
  currentRole, 
  fallback 
}: Omit<RoleGateProps, 'allowedRoles'>) {
  return (
    <RoleGate 
      allowedRoles={['backer', 'creator', 'admin']} 
      currentRole={currentRole}
      fallback={fallback}
    >
      {children}
    </RoleGate>
  );
}

export function AuthenticatedOnly({ 
  children, 
  currentRole, 
  fallback 
}: Omit<RoleGateProps, 'allowedRoles'>) {
  return (
    <RoleGate 
      allowedRoles={['creator', 'backer', 'admin']} 
      currentRole={currentRole}
      fallback={fallback}
    >
      {children}
    </RoleGate>
  );
}
