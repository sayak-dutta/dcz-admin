import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Modal } from './modal';
import { cn } from '@/lib/utils';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'destructive',
  loading = false,
  icon: Icon = AlertTriangle,
  className,
  ...props
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      className={className}
      {...props}
    >
      <div className="space-y-4">
        {Icon && (
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        )}

        {description && (
          <p className="text-sm text-gray-600 text-center">
            {description}
          </p>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
