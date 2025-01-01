import { combineReducers, configureStore } from "@reduxjs/toolkit";
import loginReducer from "@/app/login/loginSlice";
import locationsReducer from "@/app/dashboard/locations/locationSlice";
import collectionsReducer from "@/app/dashboard/collections/collectionsSlice";
import booksReducer from "@/app/dashboard/books/booksSlice";

export const makeStore = () => {
  return configureStore({
    reducer: combineReducers({
      login: loginReducer,
      locations: locationsReducer,
      collections: collectionsReducer,
      books: booksReducer,
    }),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
