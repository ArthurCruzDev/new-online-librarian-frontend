import ApiClient from "@/lib/api_client";
import {
  combineReducers,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { access, stat } from "fs";

export interface Location {
  id?: number;
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
  "locations/getAllLocations",
  async () => {
    const response = await ApiClient.get("/v1/locations").catch(function (
      error
    ) {
      throw new Error(error.response.data.msg);
    });
    return response.data;
  }
);

export const getAllLocationsSlice = createSlice({
  name: "getAllLocations",
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

export interface CreateLocationState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  location?: Location;
}

const initialCreateLocationState: CreateLocationState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  location: undefined,
};

export const doCreateLocation = createAsyncThunk(
  "locations/doCreateLocation",
  async (location: Location) => {
    const response = await ApiClient.post("/v1/locations", location).catch(
      function (error) {
        throw new Error(error.response.data.msg);
      }
    );
    return response.data;
  }
);

export const createLocationSlice = createSlice({
  name: "createLocations",
  initialState: initialCreateLocationState,
  reducers: {
    resetCreateLocationState: (state, action) => {
      return initialCreateLocationState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(doCreateLocation.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doCreateLocation.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.location = action.payload.location as Location;
      })
      .addCase(doCreateLocation.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.location = undefined;
      });
  },
});

export const { resetCreateLocationState } = createLocationSlice.actions;

export interface UpdateLocationState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  location?: Location;
}

const initialUpdateLocationState: UpdateLocationState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  location: undefined,
};

export const doUpdateLocation = createAsyncThunk(
  "locations/doUpdateLocation",
  async (location: Location) => {
    const response = await ApiClient.put("/v1/locations", location).catch(
      function (error) {
        throw new Error(error.response.data.msg);
      }
    );
    return response.data;
  }
);

export const updateLocationSlice = createSlice({
  name: "UpdateLocations",
  initialState: initialUpdateLocationState,
  reducers: {
    resetUpdateLocationState: (state, action) => {
      return initialUpdateLocationState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(doUpdateLocation.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doUpdateLocation.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.location = action.payload.location as Location;
      })
      .addCase(doUpdateLocation.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.location = undefined;
      });
  },
});

export const { resetUpdateLocationState } = updateLocationSlice.actions;

export interface DeleteLocationState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  location?: Location;
}

const initialDeleteLocationState: DeleteLocationState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  location: undefined,
};

export const doDeleteLocation = createAsyncThunk(
  "locations/doUpdateLocation",
  async (location: Location) => {
    const response = await ApiClient.delete(
      "/v1/locations/" + location.id
    ).catch(function (error) {
      throw new Error(error.response.data.msg);
    });
    return response.data;
  }
);

export const deleteLocationSlice = createSlice({
  name: "DeleteLocations",
  initialState: initialDeleteLocationState,
  reducers: {
    resetDeleteLocationState: (state, action) => {
      return initialDeleteLocationState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(doDeleteLocation.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doDeleteLocation.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.location = action.payload.location as Location;
      })
      .addCase(doDeleteLocation.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.location = undefined;
      });
  },
});

export const { resetDeleteLocationState } = deleteLocationSlice.actions;

export default combineReducers({
  getAllLocationsSlice: getAllLocationsSlice.reducer,
  createLocationSlice: createLocationSlice.reducer,
  updateLocationSlice: updateLocationSlice.reducer,
  deleteLocationSlice: deleteLocationSlice.reducer,
});
