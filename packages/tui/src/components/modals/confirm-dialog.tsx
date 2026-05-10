import { useCallback } from "react";
import { useInput, Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";
import { useServices } from "../../services/service-context.js";

interface ConfirmDialogProps {
  taskId: string;
  title: string;
}

export function ConfirmDialog({ taskId, title }: ConfirmDialogProps) {
  const { dispatch } = useAppState();
  const theme = useTheme();
  const services = useServices();

  useInput(
    useCallback(
      (input, key) => {
        if (key.return || input === "y" || input === "Y") {
          services.taskService.delete(taskId);
          dispatch({ type: "CLOSE_MODAL" });
          dispatch({ type: "SET_STATUS", message: "Task deleted" });
          dispatch({ type: "SET_LOADING", isLoading: true });
          return;
        }

        if (key.escape || input === "n" || input === "N") {
          dispatch({ type: "CLOSE_MODAL" });
          return;
        }
      },
      [dispatch, services.taskService, taskId],
    ),
  );

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box backgroundColor={theme.modal.dangerBg} paddingX={1}>
        <Text bold color={theme.modal.dangerText}>
          Delete Task
        </Text>
      </Box>

      <Box
        flexDirection="column"
        flexGrow={1}
        paddingX={1}
        paddingY={1}
        backgroundColor={theme.modal.background}
      >
        <Box>
          <Text color={theme.modal.bodyText}>
            Delete &quot;{title}&quot;?
          </Text>
        </Box>
      </Box>

      <Box backgroundColor={theme.modal.background} paddingX={1}>
        <Text color={theme.modal.keyHint}>
          Enter/Y: Confirm | Esc/N: Cancel
        </Text>
      </Box>
    </Box>
  );
}