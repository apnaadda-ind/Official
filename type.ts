export interface AppData {
  id: string;
  name: string;
  tagline?: string;
  launchStatus: 'Coming Soon' | 'Coming in selected date' | 'Coming in selected weeks' | 'Launched';
  launchDate?: string; // ISO string YYYY-MM-DD
  launchWeeks?: number;
  description?: string;
  externalLink?: string;
  createdAt: number;
}

export type AppFormData = Omit<AppData, 'id' | 'createdAt'>;

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}
