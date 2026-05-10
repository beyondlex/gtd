import { Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";
import { useServices } from "../../services/service-context.js";
import { TaskList } from "../common/task-list.js";

export function SomedayView() {
  const { state } = useAppState();
  const theme = useTheme();
  const services = useServices();

  const somedayData = services.somedayView.getData();
  const projects = somedayData.projects;
  const tasks = state.items;

  const projectsStart = tasks.length;

  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Tasks section */}
      <Box backgroundColor={theme.view.groupHeaderBg} paddingX={1}>
        <Text bold color={theme.view.groupHeader}>
          Tasks ({tasks.length})
        </Text>
      </Box>
      {tasks.length === 0 ? (
        <Box paddingX={1}>
          <Text color={theme.colors.textMuted}>No someday tasks</Text>
        </Box>
      ) : (
        tasks.map((task, index) => {
          const isSelected = index === state.selectedIndex;
          return (
            <Box
              key={task.id}
              paddingX={1}
              backgroundColor={isSelected ? theme.view.selectionBg : "transparent"}
            >
              <Text
                color={
                  isSelected ? theme.view.selectionText : theme.view.itemText
                }
              >
                {"  "}[ ] {task.title}
              </Text>
            </Box>
          );
        })
      )}

      {/* Projects section */}
      <Box backgroundColor={theme.view.groupHeaderBg} paddingX={1}>
        <Text bold color={theme.view.groupHeader}>
          Projects ({projects.length})
        </Text>
      </Box>
      {projects.length === 0 ? (
        <Box paddingX={1}>
          <Text color={theme.colors.textMuted}>No someday projects</Text>
        </Box>
      ) : (
        projects.map((project, index) => {
          const globalIndex = projectsStart + index;
          const isSelected = globalIndex === state.selectedIndex;
          return (
            <Box
              key={project.id}
              paddingX={1}
              backgroundColor={isSelected ? theme.view.selectionBg : "transparent"}
            >
              <Text
                color={
                  isSelected ? theme.view.selectionText : theme.view.itemText
                }
              >
                {"  "}# {project.title}
              </Text>
            </Box>
          );
        })
      )}
    </Box>
  );
}