export interface CloudinaryUploadInfo {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
}

export interface CloudinaryUploadResult {
  event: string;
  info: CloudinaryUploadInfo;
  [key: string]: unknown;
}

export interface CloudinaryUploadError {
  status?: string | number;
  message?: string;
  [key: string]: unknown;
}

export type CloudinaryUploadCallback = (
  error: CloudinaryUploadError | null,
  result: CloudinaryUploadResult,
) => void;

export interface CloudinaryWidgetOptions {
  cloudName?: string;
  apiKey?: string;
  uploadSignature?: string;
  uploadSignatureTimestamp?: number | string;
  uploadPreset?: string;
  folder?: string;
  multiple?: boolean;
  cropping?: boolean;
  croppingAspectRatio?: number;
  croppingCoordinatesMode?: string;
  showSkipCropButton?: boolean;
  showCompletedButton?: boolean;
  singleUploadAutoClose?: boolean;
  maxFileSize?: number;
  clientAllowedFormats?: string[];
  [key: string]: unknown;
}

export interface CloudinaryWidget {
  open: () => void;
  close: () => void;
  cancel: () => void;
  hide: () => void;
  destroy: () => void;
  isVisible: () => boolean;
  isDestroyed: () => boolean;
}

export interface CloudinaryGlobal {
  createUploadWidget: (
    options: CloudinaryWidgetOptions,
    callback: CloudinaryUploadCallback,
  ) => CloudinaryWidget;
}

declare global {
  interface Window {
    cloudinary?: CloudinaryGlobal;
  }
}

export {};
