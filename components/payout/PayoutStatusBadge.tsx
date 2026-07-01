import * as React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { PayoutStatus } from '@/lib/api/payouts.api';

interface PayoutStatusBadgeProps {
  status:    PayoutStatus;
  size?:     'xs' | 'sm';
  dot?:      boolean;
  className?: string;
}

export const PayoutStatusBadge: React.FC<PayoutStatusBadgeProps> = ({
  status,
  size  = 'sm',
  dot   = true,
  className,
}) => (
  <Badge status={status} size={size} dot={dot} className={className} />
);