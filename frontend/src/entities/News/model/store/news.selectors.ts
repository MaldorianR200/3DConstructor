import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NewsState } from './news.reducer';
import { Slices } from 'src/shared/config/storeSlicesConfig';

export const selectNewsState = createFeatureSelector<NewsState>(Slices.NEWS);

export const selectAllNews = createSelector(selectNewsState, (state: NewsState) => state.news);

export const selectNewsById = (newsId: number) =>
  createSelector(selectNewsState, (state: NewsState) =>
    state.news.find((news) => news.id === newsId),
  );

export const selectNewsCount = createSelector(
  selectNewsState,
  (state: NewsState) => state.news.length,
);

export const selectNewsError = createSelector(selectNewsState, (state: NewsState) => state.error);
