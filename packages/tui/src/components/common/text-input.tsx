import { Text } from "ink";
import { useTheme } from "../../theme/context.js";

interface TextInputProps {
  value: string;
  placeholder?: string;
  showCursor?: boolean;
}

export function TextInput({ value, placeholder, showCursor = true }: TextInputProps) {
  const theme = useTheme();

  if (value.length === 0 && placeholder) {
    return (
      <Text color={theme.modal.inputPlaceholder}>
        {placeholder}{showCursor ? "▌" : ""}
      </Text>
    );
  }

  return (
    <Text color={theme.modal.inputText}>
      {value}
      {showCursor && <Text color={theme.modal.inputPlaceholder}>▌</Text>}
    </Text>
  );
}