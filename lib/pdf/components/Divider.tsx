import { View } from "@react-pdf/renderer";
import { styles } from "../styles";

type DividerProps = {
  marginTop?: number;
  marginBottom?: number;
};

export function Divider({
  marginTop = 16,
  marginBottom = 16,
}: DividerProps) {
  return (
    <View
      style={[
        styles.divider,
        {
          marginTop,
          marginBottom,
        },
      ]}
    />
  );
}