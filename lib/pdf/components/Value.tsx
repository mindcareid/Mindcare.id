import { Text } from "@react-pdf/renderer";
import { styles } from "../styles";

type ValueProps = {
  children: React.ReactNode;
};

export function Value({
  children,
}: ValueProps) {
  return (
    <Text style={styles.value}>
      {children}
    </Text>
  );
}