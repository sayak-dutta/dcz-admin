import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

const statusVariants = {
  // User status
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  banned: 'bg-red-100 text-red-800 border-red-200',
  suspended: 'bg-yellow-100 text-yellow-800 border-yellow-200',

  // Verification status
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  verified: 'bg-blue-100 text-blue-800 border-blue-200',

  // Report status
  open: 'bg-red-100 text-red-800 border-red-200',
  under_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  dismissed: 'bg-gray-100 text-gray-800 border-gray-200',

  // Media status
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  flagged: 'bg-orange-100 text-orange-800 border-orange-200',

  // Chatroom status
  public: 'bg-blue-100 text-blue-800 border-blue-200',
  private: 'bg-purple-100 text-purple-800 border-purple-200',
  secret: 'bg-gray-100 text-gray-800 border-gray-200',
  live: 'bg-red-100 text-red-800 border-red-200',

  // Group status
  open: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  private: 'bg-purple-100 text-purple-800 border-purple-200',

  // Business request status
  submitted: 'bg-blue-100 text-blue-800 border-blue-200',
  under_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  // User status
  active: 'Active',
  inactive: 'Inactive',
  banned: 'Banned',
  suspended: 'Suspended',

  // Verification status
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  verified: 'Verified',

  // Report status
  open: 'Open',
  under_review: 'Under Review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',

  // Media status
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
  flagged: 'Flagged',

  // Chatroom status
  public: 'Public',
  private: 'Private',
  secret: 'Secret',
  live: 'Live',

  // Group status
  open: 'Open',
  closed: 'Closed',
  private: 'Private',

  // Business request status
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const StatusBadge = ({
  status,
  customLabel,
  className,
  ...props
}) => {
  const variant = statusVariants[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  const label = customLabel || statusLabels[status] || status;

  return (
    <Badge
      variant="outline"
      className={cn(variant, 'text-xs font-medium capitalize', className)}
      {...props}
    >
      {label}
    </Badge>
  );
};
