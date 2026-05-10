import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { AppState, AppAction } from "./types.js";
import { INITIAL_STATE } from "./types.js";
import { appReducer } from "./reducer.js";

interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}