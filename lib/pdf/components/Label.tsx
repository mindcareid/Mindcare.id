import { Text } from "@react-pdf/renderer";
import { styles } from "../styles";

type LabelProps = {
  label: string;
};

export function Label({
  label,
}: LabelProps) {
  return (
    <Text style={styles.label}>
      {label}
    </Text>
  );
}