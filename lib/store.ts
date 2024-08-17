import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "@/app/login/loginSlice";
import locationsReducer from "@/app/dashboard/locations/locationSlice";
export const makeStore = () => {
  return configureStore({
    reducer: {
      login: loginReducer,
      locations: locationsReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
