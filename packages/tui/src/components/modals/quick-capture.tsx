import { useState, useCallback } from "react";
import { useInput, Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";
import { useServices } from "../../services/service-context.js";
import { TextInput } from "../common/text-input.js";
import { parseNaturalDate } from "@gtd/core";
import { resolveQuickCaptureDeadline } from "./quick-capture-deadline.js";

export function QuickCapture() {
  const { state, dispatch } = useAppState();
  const theme = useTheme();
  const services = useServices();

  const [title, setTitle] = useState("");

  const parsedDeadline = title.trim() ? parseNaturalDate(title.trim()) : null;

  useInput(
    useCallback(
      (input, key) => {
        if (key.escape) {
          dispatch({ type: "CLOSE_MODAL" });
          return;
        }

        if (key.return) {
          const trimmed = title.trim();
          if (trimmed.length === 0) return;

          services.taskService.create({
            title: trimmed,
            deadline: resolveQuickCaptureDeadline(state.currentView, parsedDeadline),
            isInInbox: state.currentView === "inbox",
            isSomeday: state.currentView === "someday",
          });

          dispatch({ type: "CLOSE_MODAL" });
          dispatch({ type: "SET_STATUS", message: "Task created" });
          dispatch({ type: "SET_LOADING", isLoading: true });
          return;
        }

        if (key.backspace) {
          setTitle((t) => t.slice(0, -1));
          return;
        }

        if (key.ctrl || key.meta || input.length !== 1) return;

        setTitle((t) => t + input);
      },
      [dispatch, services.taskService, title, parsedDeadline, state.currentView],
    ),
  );

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box backgroundColor={theme.modal.borderColor} paddingX={1}>
        <Text bold color={theme.modal.titleText}>
          New Task
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
          <Text color={theme.modal.labelText}>Title: </Text>
          <TextInput value={title} placeholder="Type task title..." />
        </Box>

        {parsedDeadline && (
          <Box marginTop={1}>
            <Text color={theme.modal.labelText}>Deadline: </Text>
            <Text color={theme.modal.bodyText}>
              {parsedDeadline.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </Box>
        )}

        {title.trim().length > 0 && !parsedDeadline && (
          <Box marginTop={1}>
            <Text color={theme.modal.labelText}>Deadline: </Text>
            <Text color={theme.modal.inputPlaceholder}>None detected</Text>
          </Box>
        )}
      </Box>

      <Box backgroundColor={theme.modal.background} paddingX={1}>
        <Text color={theme.modal.keyHint}>
          Enter: Create | Esc: Cancel | Inbox/Today w/o date defaults to today
        </Text>
      </Box>
    </Box>
  );
}
