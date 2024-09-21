import ApiClient from "@/lib/api_client";
import {
  combineReducers,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { access, stat } from "fs";
import { Collection } from "../collections/collectionsSlice";
import { Location } from "../locations/locationSlice";

export interface Author {
  name: string;
  url?: string;
}

export interface Genre {
  name: string;
}

export interface Language {
  name: string;
  code?: string;
}

export interface Book {
  id?: number;
  title: string;
  authors: Author[];
  publisher: string;
  languages: Language[];
  edition?: string;
  isbn?: string;
  year?: string;
  genres?: Genre[];
  cover?: string;
  collection?: Collection;
  location: Location;
  user_id: number;
}

export interface GetAllBooksState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  books: Book[];
}

const initialGetAllBooksState: GetAllBooksState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  books: [],
};

export interface GetAllBooksFromUserParams {
  page: number;
  pageSize: number;
}

export const doGetAllBooksFromUser = createAsyncThunk(
  "books/getAllBooks",
  async (params: GetAllBooksFromUserParams) => {
    const response = await ApiClient.get(
      `/v1/books?page=${params.page ?? 0}&pageSize=${params.pageSize ?? 10}`
    ).catch(function (error) {
      throw new Error(error.response.data.msg);
    });
    return response.data;
  }
);

export const getAllBooksSlice = createSlice({
  name: "getAllBooks",
  initialState: initialGetAllBooksState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(doGetAllBooksFromUser.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doGetAllBooksFromUser.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.books = action.payload.items as Book[];
      })
      .addCase(doGetAllBooksFromUser.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.books = [];
      });
  },
});

export interface CreateBookState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  book?: Book;
}

const initialCreateBookState: CreateBookState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  book: undefined,
};

export const doCreateBook = createAsyncThunk(
  "books/doCreateBook",
  async (book: Book) => {
    const response = await ApiClient.post("/v1/books", book).catch(function (
      error
    ) {
      throw new Error(error.response.data.msg);
    });
    return response.data;
  }
);

export const createBookSlice = createSlice({
  name: "createBooks",
  initialState: initialCreateBookState,
  reducers: {
    resetCreateBookState: (state, action) => {
      return initialCreateBookState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(doCreateBook.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doCreateBook.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.book = action.payload.book as Book;
      })
      .addCase(doCreateBook.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.book = undefined;
      });
  },
});

export const { resetCreateBookState } = createBookSlice.actions;

export interface UpdateBookState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  book?: Book;
}

const initialUpdateBookState: UpdateBookState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  book: undefined,
};

export const doUpdateBook = createAsyncThunk(
  "books/doUpdateBook",
  async (book: Book) => {
    const response = await ApiClient.put("/v1/books", book).catch(function (
      error
    ) {
      throw new Error(error.response.data.msg);
    });
    return response.data;
  }
);

export const updateBookSlice = createSlice({
  name: "UpdateBooks",
  initialState: initialUpdateBookState,
  reducers: {
    resetUpdateBookState: (state, action) => {
      return initialUpdateBookState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(doUpdateBook.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doUpdateBook.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.book = action.payload.book as Book;
      })
      .addCase(doUpdateBook.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.book = undefined;
      });
  },
});

export const { resetUpdateBookState } = updateBookSlice.actions;

export interface DeleteBookState {
  status: "idle" | "loading" | "success" | "failure";
  error: boolean;
  errorMsg: string | undefined;
  book?: Book;
}

const initialDeleteBookState: DeleteBookState = {
  status: "idle",
  error: false,
  errorMsg: undefined,
  book: undefined,
};

export const doDeleteBook = createAsyncThunk(
  "books/doUpdateBook",
  async (book: Book) => {
    const response = await ApiClient.delete("/v1/books/" + book.id).catch(
      function (error) {
        throw new Error(error.response.data.msg);
      }
    );
    return response.data;
  }
);

export const deleteBookSlice = createSlice({
  name: "DeleteBooks",
  initialState: initialDeleteBookState,
  reducers: {
    resetDeleteBookState: (state, action) => {
      return initialDeleteBookState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(doDeleteBook.pending, (state, _) => {
        state.status = "loading";
        state.error = false;
        state.errorMsg = undefined;
      })
      .addCase(doDeleteBook.fulfilled, (state, action) => {
        state.status = "success";
        state.error = false;
        state.errorMsg = undefined;
        state.book = action.payload.book as Book;
      })
      .addCase(doDeleteBook.rejected, (state, action) => {
        state.status = "failure";
        state.error = true;
        state.errorMsg = action.error.message;
        state.book = undefined;
      });
  },
});

export const { resetDeleteBookState } = deleteBookSlice.actions;

export default combineReducers({
  getAllBooksSlice: getAllBooksSlice.reducer,
  createBookSlice: createBookSlice.reducer,
  updateBookSlice: updateBookSlice.reducer,
  deleteBookSlice: deleteBookSlice.reducer,
});
