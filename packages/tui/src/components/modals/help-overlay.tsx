import { useCallback } from "react";
import { useInput, Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";
import { keybindingRegistry } from "../../keybindings/instance.js";
import type { KeybindingDef } from "../../keybindings/types.js";

export function HelpOverlay() {
  const { dispatch } = useAppState();
  const theme = useTheme();

  useInput(
    useCallback(
      (_, key) => {
        if (key.escape) {
          dispatch({ type: "CLOSE_MODAL" });
        }
      },
      [dispatch],
    ),
  );

  const globalBindings = keybindingRegistry.getBindings("global");
  const modalBindings = keybindingRegistry.getBindings("modal");
  const anytimeBindings = keybindingRegistry.getBindings("anytime");
  const searchBindings = keybindingRegistry.getBindings("search");

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box backgroundColor={theme.modal.borderColor} paddingX={1}>
        <Text bold color={theme.modal.titleText}>
          Help — Keybindings
        </Text>
      </Box>

      <Box
        flexDirection="column"
        flexGrow={1}
        paddingX={1}
        paddingY={1}
        backgroundColor={theme.modal.background}
      >
        <SectionHeader theme={theme} title="Global" />
        {globalBindings.map((b, i) => (
          <BindingRow key={i} binding={b} theme={theme} />
        ))}

        <SectionHeader theme={theme} title="Anytime View" />
        {anytimeBindings.map((b, i) => (
          <BindingRow key={i} binding={b} theme={theme} />
        ))}

        <SectionHeader theme={theme} title="Search" />
        {searchBindings.map((b, i) => (
          <BindingRow key={i} binding={b} theme={theme} />
        ))}

        <SectionHeader theme={theme} title="Modal" />
        {modalBindings.map((b, i) => (
          <BindingRow key={i} binding={b} theme={theme} />
        ))}
      </Box>

      <Box backgroundColor={theme.modal.background} paddingX={1}>
        <Text color={theme.modal.keyHint}>
          Esc: Close
        </Text>
      </Box>
    </Box>
  );
}

function SectionHeader({ theme, title }: { theme: any; title: string }) {
  return (
    <Box marginTop={1}>
      <Text bold color={theme.modal.titleText}>
        {title}
      </Text>
    </Box>
  );
}

function BindingRow({ binding, theme }: { binding: KeybindingDef; theme: any }) {
  return (
    <Box>
      <Text color={theme.modal.keyHint}>
        {binding.keys.padEnd(16)}
      </Text>
      <Text color={theme.modal.bodyText}>
        {binding.description}
      </Text>
    </Box>
  );
}