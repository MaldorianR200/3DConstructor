import { createReducer, on } from '@ngrx/store';
import { INews } from '../types/news.model';
import * as NewsActions from './news.actions';

export interface NewsState {
  news: INews[];
  error: any;
}

export const initialState: NewsState = {
  news: [],
  error: null,
};

export const newsReducer = createReducer(
  initialState,
  // get
  on(NewsActions.getNewsSuccess, (state, { news }) => ({
    ...state,
    news,
  })),
  on(NewsActions.getNewsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // create
  on(NewsActions.createNewsSuccess, (state, { news }) => ({
    ...state,
    news: [...state.news, news],
  })),
  on(NewsActions.createNewsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // update
  on(NewsActions.updateNewsSuccess, (state, { news }) => ({
    ...state,
    news: state.news.map((item) => {
      if (item.id === news.id) {
        const sortedImages = [...news.images].sort((a, b) => a.displayOrder - b.displayOrder);
        return { ...news, images: sortedImages };
      }
      return item;
    }),
  })),
  on(NewsActions.updateNewsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  // delete
  on(NewsActions.deleteNewsSuccess, (state, { id }) => ({
    ...state,
    news: state.news.filter((p) => p.id !== id),
  })),
  on(NewsActions.deleteNewsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
