import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Slices } from 'src/shared/config/storeSlicesConfig';
import { SeoState } from './seo.reducer';

export const selectSeoState = createFeatureSelector<SeoState>(Slices.SEO);

export const selectRobots = createSelector(selectSeoState, (state: SeoState) => state.robots);

export const selectSeoError = createSelector(selectSeoState, (state: SeoState) => state.error);
