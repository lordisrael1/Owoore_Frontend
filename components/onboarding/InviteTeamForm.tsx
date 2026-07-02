'use client';
import * as React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { api } from '@/lib/api/client';

interface Invite {
  name:   string;
  email:  string;
  role:   'TREASURER' | 'ADMIN';
  sent:   boolean;
}

interface InviteTeamFormProps {
  orgId:     string;
  onInvited?: () => void;
}

export const InviteTeamForm: React.FC<InviteTeamFormProps> = ({
  orgId,
  onInvited,
}) => {
  const { success, error } = useToast();
  const [name,    setName]    = React.useState('');
  const [email,   setEmail]   = React.useState('');
  const [role,    setRole]    = React.useState<'TREASURER' | 'ADMIN'>('TREASURER');
  const [loading, setLoading] = React.useState(false);
  const [invites, setInvites] = React.useState<Invite[]>([]);

  const handleSend = async () => {
    if (!name.trim() || !email.includes('@')) {
      error('Fill in name and a valid email');
      return;
    }

    setLoading(true);
    try {
      await api.post(
        '/admin-users/invite',
        { email: email.trim(), name: name.trim(), role },
        { tokenType: 'admin' },
      );
      setInvites((prev) => [...prev, { name: name.trim(), email: email.trim(), role, sent: true }]);
      setName('');
      setEmail('');
      success(`Invite sent to ${name.trim()}`, `They'll receive an email to set their password.`);
      onInvited?.();
    } catch (err: any) {
      error('Could not send invite', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Role picker */}
      <div>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Role</p>
        <div className="grid grid-cols-2 gap-2">
          {(['TREASURER', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                'p-3 rounded-xl border text-left transition-colors text-xs',
                role === r
                  ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800',
              )}
            >
              <p className={cn('font-medium', role === r ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-200')}>
                {r === 'TREASURER' ? 'Treasurer' : 'Admin'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {r === 'TREASURER'
                  ? 'Can initiate payouts, not approve their own'
                  : 'Full access — same as you'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Their name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Bro. Emmanuel"
        required
      />
      <Input
        label="Their email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="treasurer@yourchurch.org"
        required
      />

      <Button fullWidth loading={loading} onClick={handleSend}>
        Send invite email
      </Button>

      {/* Sent invites */}
      {invites.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Invites sent</p>
          {invites.map((inv) => (
            <div key={inv.email} className="flex items-center gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Avatar name={inv.name} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{inv.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{inv.email}</p>
              </div>
              <Badge variant="new" size="xs">Invite sent</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};