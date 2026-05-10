import { useState, useEffect, useCallback } from "react";
import { useInput, Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";
import { useServices } from "../../services/service-context.js";
import { TextInput } from "../common/text-input.js";
import { parseNaturalDate } from "@gtd/core";
import type { Task } from "@gtd/core";

interface TaskDetailProps {
  taskId: string;
}

type EditField = "title" | "notes" | "deadline";

export function TaskDetail({ taskId }: TaskDetailProps) {
  const { dispatch } = useAppState();
  const theme = useTheme();
  const services = useServices();

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [deadline, setDeadline] = useState("");
  const [activeField, setActiveField] = useState<EditField>("title");

  useEffect(() => {
    const t = services.taskService.findById(taskId);
    if (t) {
      setTask(t);
      setTitle(t.title);
      setNotes(t.notes);
      setDeadline(t.deadline ? formatDateInput(t.deadline) : "");
    }
  }, [taskId, services.taskService]);

  useInput(
    useCallback(
      (input, key) => {
        if (key.escape) {
          dispatch({ type: "CLOSE_MODAL" });
          return;
        }

        if (key.return) {
          const deadlineDate = deadline.trim()
            ? parseNaturalDate(deadline.trim()) ?? null
            : null;

          services.taskService.update(taskId, {
            title: title.trim(),
            notes: notes.trim(),
            deadline: deadlineDate ?? undefined,
          });

          dispatch({ type: "CLOSE_MODAL" });
          dispatch({ type: "SET_STATUS", message: "Task updated" });
          dispatch({ type: "SET_LOADING", isLoading: true });
          return;
        }

        if (key.tab) {
          const fields: EditField[] = ["title", "notes", "deadline"];
          const idx = fields.indexOf(activeField);
          if (key.shift) {
            setActiveField(fields[(idx - 1 + fields.length) % fields.length]);
          } else {
            setActiveField(fields[(idx + 1) % fields.length]);
          }
          return;
        }

        if (key.backspace) {
          if (activeField === "title") setTitle((v) => v.slice(0, -1));
          else if (activeField === "notes") setNotes((v) => v.slice(0, -1));
          else if (activeField === "deadline") setDeadline((v) => v.slice(0, -1));
          return;
        }

        if (key.ctrl || key.meta || input.length !== 1) return;

        if (activeField === "title") setTitle((v) => v + input);
        else if (activeField === "notes") setNotes((v) => v + input);
        else if (activeField === "deadline") setDeadline((v) => v + input);
      },
      [dispatch, services.taskService, taskId, title, notes, deadline, activeField],
    ),
  );

  if (!task) {
    return (
      <Box flexDirection="column" flexGrow={1} backgroundColor={theme.modal.background}>
        <Box backgroundColor={theme.modal.borderColor} paddingX={1}>
          <Text bold color={theme.modal.titleText}>
            Edit Task
          </Text>
        </Box>
        <Box flexGrow={1} justifyContent="center" alignItems="center">
          <Text color={theme.modal.bodyText}>Loading task...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box backgroundColor={theme.modal.borderColor} paddingX={1}>
        <Text bold color={theme.modal.titleText}>
          Edit Task
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
          <TextInput
            value={title}
            placeholder="Task title"
            showCursor={activeField === "title"}
          />
        </Box>

        <Box marginTop={1}>
          <Text color={theme.modal.labelText}>Notes: </Text>
          <TextInput
            value={notes}
            placeholder="Task notes"
            showCursor={activeField === "notes"}
          />
        </Box>

        <Box marginTop={1}>
          <Text color={theme.modal.labelText}>Deadline: </Text>
          <TextInput
            value={deadline}
            placeholder="e.g. tomorrow, next Friday"
            showCursor={activeField === "deadline"}
          />
        </Box>

        {task.createdAt && (
          <Box marginTop={1}>
            <Text color={theme.modal.labelText}>Created: </Text>
            <Text color={theme.modal.bodyText}>
              {new Date(task.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </Box>
        )}
      </Box>

      <Box backgroundColor={theme.modal.background} paddingX={1}>
        <Text color={theme.modal.keyHint}>
          Tab: Next field | Shift+Tab: Prev | Enter: Save | Esc: Cancel
        </Text>
      </Box>
    </Box>
  );
}

function formatDateInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}