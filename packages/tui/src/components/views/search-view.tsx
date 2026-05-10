import { useState, useCallback, useEffect } from "react";
import { useInput, Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";
import { useServices } from "../../services/service-context.js";
import type { SearchResult } from "@gtd/core";

export function SearchView() {
  const { dispatch } = useAppState();
  const theme = useTheme();
  const services = useServices();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Update results when query changes
  useEffect(() => {
    const searchResults = services.searchService.search(query);
    setResults(searchResults);
    setSelectedIdx(0);
  }, [query, services.searchService]);

  useInput(
    useCallback(
      (input, key) => {
        if (key.escape) {
          dispatch({ type: "CLOSE_MODAL" });
          return;
        }

        if (key.return) {
          dispatch({ type: "CLOSE_MODAL" });
          return;
        }

        if (key.backspace) {
          setQuery((q) => q.slice(0, -1));
          return;
        }

        if (key.upArrow || input === "k") {
          setSelectedIdx((i) => Math.max(0, i - 1));
          return;
        }

        if (key.downArrow || input === "j") {
          setSelectedIdx((i) => Math.min(results.length - 1, i + 1));
          return;
        }

        // Ignore control characters and special keys
        if (key.ctrl || key.meta || input.length !== 1) return;

        // Append printable character to query
        setQuery((q) => q + input);
      },
      [dispatch, results.length],
    ),
  );

  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Search input */}
      <Box backgroundColor={theme.view.groupHeaderBg} paddingX={1}>
        <Text bold color={theme.view.headerText}>
          Search
        </Text>
      </Box>
      <Box paddingX={1} paddingY={0}>
        <Text color={theme.view.itemText}>
          /{query}
          <Text color={theme.colors.textMuted}>▌</Text>
        </Text>
      </Box>

      {/* Results count */}
      <Box paddingX={1}>
        <Text color={theme.colors.textMuted}>
          {results.length === 0
            ? query
              ? "No results"
              : "Type to search tasks..."
            : `${results.length} result${results.length !== 1 ? "s" : ""}`}
        </Text>
      </Box>

      {/* Results list */}
      <Box flexDirection="column" flexGrow={1}>
        {results.map((result, index) => {
          const isSelected = index === selectedIdx;
          return (
            <Box
              key={result.task.id}
              paddingX={1}
              backgroundColor={
                isSelected ? theme.view.selectionBg : "transparent"
              }
            >
              <Box flexGrow={1}>
                <Text
                  color={
                    isSelected
                      ? theme.view.selectionText
                      : theme.view.itemText
                  }
                >
                  {result.task.title}
                </Text>
              </Box>
              <Box
                backgroundColor={
                  result.matchField === "title"
                    ? theme.badge.background
                    : theme.badge.warningBg
                }
                paddingX={1}
              >
                <Text
                  color={
                    result.matchField === "title"
                      ? theme.badge.text
                      : theme.badge.warningText
                  }
                >
                  {result.matchField === "title" ? "title" : "notes"}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}