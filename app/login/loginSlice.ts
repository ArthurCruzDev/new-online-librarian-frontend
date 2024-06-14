import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../lib/store";
import { stat } from "fs";
import ApiClient, { setToken } from "@/lib/api_client";

// Define a type for the slice state
export interface LoginState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
}

// Define the initial state using that type
const initialState: LoginState = {
  status: "idle",
  error: false,
  errorMsg: "",
};

interface doLoginPayload {
  email: string | undefined;
  password: string | undefined;
}

export const doLogin = createAsyncThunk(
  "login/doLogin",
  async (payload: doLoginPayload) => {
    const response = await ApiClient.post("/v1/auth/login", {
      email: payload.email,
      password: payload.password,
    }).catch(function (error) {
      throw new Error(error.response.data.msg);
    });
    return response.data;
  }
);

export const loginSlice = createSlice({
  name: "login",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(doLogin.pending, (state, action) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = "";
      })
      .addCase(doLogin.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = "";
        setToken(action.payload.access_token);
      })
      .addCase(doLogin.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
      });
  },
});

export default loginSlice.reducer;
