import { createStore, Store, Action, AnyAction } from "redux";

// --- State Tanımı ---
export interface AppState {
  // Şimdilik boş, ileride uygulama state'i buraya eklenecek.
  // Örneğin: registration, user, settings vs.
  registration: {
    status: "idle" | "pending" | "success" | "error";
    error: string | null;
  };
}

const initialState: AppState = {
  registration: {
    status: "idle",
    error: null,
  },
};

// --- Reducer ---
function rootReducer(
  state: AppState = initialState,
  action: AnyAction
): AppState {
  switch (action.type) {
    // İleride action'lar buraya eklenecek
    default:
      return state;
  }
}

// --- Store Yapılandırması ---
export function configureStore(): Store<AppState, AnyAction> {
  const store = createStore(rootReducer);
  return store;
}
