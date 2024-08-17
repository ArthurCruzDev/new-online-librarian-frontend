import ApiClient from "@/lib/api_client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { access, stat } from "fs";

export interface Location {
  id: number;
  name: string;
  user_id: number;
}

export interface GetAllLocationsState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  locations: Location[];
}

const initialGetAllLocationsState: GetAllLocationsState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  locations: [],
};

export const doGetAllLocations = createAsyncThunk(
  "locations/getAll",
  async () => {
    const response = await ApiClient.get("/v1/locations").catch(function (
      error
    ) {
      throw new Error(error.response.data.msg);
    });
    return response.data;
  }
);
//https://stackoverflow.com/questions/76987888/how-can-i-group-redux-store-slices-under-the-same-property
export const locationsSlice = createSlice({
  name: "locations",
  initialState: initialGetAllLocationsState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(doGetAllLocations.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doGetAllLocations.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.locations = action.payload.locations as Location[];
      })
      .addCase(doGetAllLocations.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.locations = [];
      });
  },
});

export default locationsSlice.reducer;
