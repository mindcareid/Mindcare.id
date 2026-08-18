import { View } from "@react-pdf/renderer";
import { ReactNode } from "react";
import { styles } from "../styles";

type CardProps = {
  children: ReactNode;
  marginTop?: number;
};

export function Card({
  children,
  marginTop = 20,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          marginTop,
        },
      ]}
    >
      {children}
    </View>
  );
}