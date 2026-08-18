/* eslint-disable jsx-a11y/alt-text */
import { Image } from "@react-pdf/renderer";

import { styles } from "../styles";
import { mailConfig } from "@/lib/mail/config";

type QrCodeProps = {
  value: string;
};

export function QrCode({
  value,
}: QrCodeProps) {
  return (
    <Image
      src={`${mailConfig.appUrl}/api/tickets/qr/${value}`}
      style={styles.qrImage}
    />
  );
}