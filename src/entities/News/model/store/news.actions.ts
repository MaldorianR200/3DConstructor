import { createAction, props } from '@ngrx/store';
import { INews } from '../types/news.model';

export const getNews = createAction('[News] Get News');
export const getNewsSuccess = createAction('[News] Get News Success', props<{ news: INews[] }>());
export const getNewsFailure = createAction('[News] Get News Failure', props<{ error: any }>());

export const createNews = createAction('[News] Create News', props<{ news: INews }>());
export const createNewsSuccess = createAction(
  '[News] Create News Success',
  props<{ news: INews }>(),
);
export const createNewsFailure = createAction(
  '[News] Create News Failure',
  props<{ error: any }>(),
);

export const updateNews = createAction('[News] Update News', props<{ news: INews }>());
export const updateNewsSuccess = createAction(
  '[News] Update News Success',
  props<{ news: INews }>(),
);
export const updateNewsFailure = createAction(
  '[News] Update News Failure',
  props<{ error: any }>(),
);

export const deleteNews = createAction('[News] Delete News', props<{ id: number }>());
export const deleteNewsSuccess = createAction(
  '[News] Delete News Success',
  props<{ id: number }>(),
);
export const deleteNewsFailure = createAction(
  '[News] Delete News Failure',
  props<{ error: any }>(),
);
