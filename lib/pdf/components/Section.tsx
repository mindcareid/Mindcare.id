import { View } from "@react-pdf/renderer";
import { ReactNode } from "react";

import { Heading } from "./Heading";
import { Divider } from "./Divider";

type SectionProps = {
  title: string;
  children: ReactNode;
  marginTop?: number;
  marginBottom?: number;
};

export function Section({
  title,
  children,
  marginTop = 0,
  marginBottom = 20,
}: SectionProps) {
  return (
    <View
      style={{
        marginTop, marginBottom,
      }}
    >
      <Heading
        size={18}
        marginBottom={0}
      >
        {title}
      </Heading>

      <Divider marginTop={12} marginBottom={5} />

      {children}
    </View>
  );
}