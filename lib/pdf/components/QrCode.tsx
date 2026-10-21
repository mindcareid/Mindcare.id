/* eslint-disable jsx-a11y/alt-text */
import { Image } from "@react-pdf/renderer";

import { mailConfig } from "@/lib/mail/config";

type QrCodeProps = {
  value: string;
  size?: number;
};

export function QrCode({ value, size = 95 }: QrCodeProps) {
  return (
    <Image
      src={`${mailConfig.appUrl}/api/tickets/qr/${value}`}
      style={{ width: size, height: size }}
    />
  );
}