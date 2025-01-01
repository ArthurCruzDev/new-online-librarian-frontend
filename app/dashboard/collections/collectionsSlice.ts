import ApiClient from "@/lib/api_client";
import {
  combineReducers,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

export interface Collection {
  id?: number;
  name: string;
  user_id: number;
}

export interface GetAllCollectionsState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  collections: Collection[];
}

const initialGetAllCollectionsState: GetAllCollectionsState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  collections: [],
};

export const doGetAllCollections = createAsyncThunk(
  "collections/getAllCollections",
  async () => {
    const response = await ApiClient.get("/v1/collections").catch(function (
      error
    ) {
      throw new Error(error.response.data.msg);
    });
    return response.data;
  }
);

export const getAllCollectionsSlice = createSlice({
  name: "getAllCollections",
  initialState: initialGetAllCollectionsState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(doGetAllCollections.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doGetAllCollections.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.collections = action.payload.collections as Collection[];
      })
      .addCase(doGetAllCollections.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.collections = [];
      });
  },
});

export interface CreateCollectionState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  collection?: Collection;
}

const initialCreateCollectionState: CreateCollectionState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  collection: undefined,
};

export const doCreateCollection = createAsyncThunk(
  "collections/doCreateCollection",
  async (collection: Collection) => {
    const response = await ApiClient.post("/v1/collections", collection).catch(
      function (error) {
        throw new Error(error.response.data.msg);
      }
    );
    return response.data;
  }
);

export const createCollectionSlice = createSlice({
  name: "createCollections",
  initialState: initialCreateCollectionState,
  reducers: {
    resetCreateCollectionState: (state, action) => {
      return initialCreateCollectionState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(doCreateCollection.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doCreateCollection.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.collection = action.payload.collection as Collection;
      })
      .addCase(doCreateCollection.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.collection = undefined;
      });
  },
});

export const { resetCreateCollectionState } = createCollectionSlice.actions;

export interface UpdateCollectionState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  collection?: Collection;
}

const initialUpdateCollectionState: UpdateCollectionState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  collection: undefined,
};

export const doUpdateCollection = createAsyncThunk(
  "collections/doUpdateCollection",
  async (collection: Collection) => {
    const response = await ApiClient.put("/v1/collections", collection).catch(
      function (error) {
        throw new Error(error.response.data.msg);
      }
    );
    return response.data;
  }
);

export const updateCollectionSlice = createSlice({
  name: "UpdateCollections",
  initialState: initialUpdateCollectionState,
  reducers: {
    resetUpdateCollectionState: (state, action) => {
      return initialUpdateCollectionState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(doUpdateCollection.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doUpdateCollection.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.collection = action.payload.collection as Collection;
      })
      .addCase(doUpdateCollection.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.collection = undefined;
      });
  },
});

export const { resetUpdateCollectionState } = updateCollectionSlice.actions;

export interface DeleteCollectionState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  collection?: Collection;
}

const initialDeleteCollectionState: DeleteCollectionState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  collection: undefined,
};

export const doDeleteCollection = createAsyncThunk(
  "collections/doUpdateCollection",
  async (collection: Collection) => {
    const response = await ApiClient.delete(
      "/v1/collections/" + collection.id
    ).catch(function (error) {
      throw new Error(error.response.data.msg);
    });
    return response.data;
  }
);

export const deleteCollectionSlice = createSlice({
  name: "DeleteCollections",
  initialState: initialDeleteCollectionState,
  reducers: {
    resetDeleteCollectionState: (state, action) => {
      return initialDeleteCollectionState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(doDeleteCollection.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doDeleteCollection.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.collection = action.payload.collection as Collection;
      })
      .addCase(doDeleteCollection.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.collection = undefined;
      });
  },
});

export const { resetDeleteCollectionState } = deleteCollectionSlice.actions;

export default combineReducers({
  getAllCollectionsSlice: getAllCollectionsSlice.reducer,
  createCollectionSlice: createCollectionSlice.reducer,
  updateCollectionSlice: updateCollectionSlice.reducer,
  deleteCollectionSlice: deleteCollectionSlice.reducer,
});
