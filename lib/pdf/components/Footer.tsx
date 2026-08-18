import { Text, View } from "@react-pdf/renderer";

import { styles } from "../styles";

import { mailConfig } from "@/lib/mail/config";

type FooterProps = {
  showCopyright?: boolean;
};

export function Footer({
  showCopyright = true,
}: FooterProps) {
  return (
    <View
      style={{
        marginTop: 32,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        textAlign: "center",
      }}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: 10,
            color: "#9CA3AF",
            textAlign: "center",
          },
        ]}
      >
        This document was generated automatically by{" "}
        {mailConfig.appName}.
      </Text>

      <Text
        style={[
          styles.text,
          {
            marginTop: 4,
            fontSize: 10,
            color: "#9CA3AF",
            textAlign: "center",
          },
        ]}
      >
        Please do not reply to this document.
      </Text>

      {showCopyright && (
        <Text
          style={[
            styles.text,
            {
              marginTop: 10,
              fontSize: 9,
              color: "#D1D5DB",
              textAlign: "center",
            },
          ]}
        >
          © {new Date().getFullYear()} {mailConfig.appName}. All rights
          reserved.
        </Text>
      )}
    </View>
  );
}