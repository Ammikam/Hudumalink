import { useRoles } from '@/contexts/Rolecontext';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function RoleSwitcher() {
  const { activeRole, setActiveRole, isDesigner, isClient, isAdmin } = useRoles();

  const roleConfig = {
    client: { icon: Users, label: 'Client', color: 'text-primary' },
    designer: { icon: Briefcase, label: 'Designer', color: 'text-secondary' },
    admin: { icon: Shield, label: 'Admin', color: 'text-destructive' },
  };

  const ActiveIcon = roleConfig[activeRole].icon;

  // Show only if user has multiple roles
  if ([isClient, isDesigner, isAdmin].filter(Boolean).length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ActiveIcon className="w-4 h-4" />
          {roleConfig[activeRole].label}
          <Badge variant="secondary" className="ml-1">
            Switch
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">Switch Role</div>
        <DropdownMenuSeparator />
        
        {isClient && (
          <DropdownMenuItem onClick={() => setActiveRole('client')}>
            <Users className="w-4 h-4 mr-2" />
            Client Dashboard
            {activeRole === 'client' && <Badge className="ml-auto">Active</Badge>}
          </DropdownMenuItem>
        )}
        
        {isDesigner && (
          <DropdownMenuItem onClick={() => setActiveRole('designer')}>
            <Briefcase className="w-4 h-4 mr-2" />
            Designer Dashboard
            {activeRole === 'designer' && <Badge className="ml-auto">Active</Badge>}
          </DropdownMenuItem>
        )}
        
        {isAdmin && (
          <DropdownMenuItem onClick={() => setActiveRole('admin')}>
            <Shield className="w-4 h-4 mr-2" />
            Admin Panel
            {activeRole === 'admin' && <Badge className="ml-auto">Active</Badge>}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}