import { createAction, props } from '@ngrx/store';

export const getRobots = createAction('[SEO] Get Robots');
export const getRobotsSuccess = createAction(
  '[SEO] Get Robots Success',
  props<{ robots: string }>(),
);
export const getRobotsFailure = createAction('[SEO] Get Robots Failure', props<{ error: any }>());

export const updateRobots = createAction('[SEO] Update Robots', props<{ robots: string }>());
export const updateRobotsSuccess = createAction(
  '[SEO] Update Robots Success',
  props<{ robots: string }>(),
);
export const updateRobotsFailure = createAction(
  '[SEO] Update Robots Failure',
  props<{ error: any }>(),
);

export const generateSiteMap = createAction('[SEO] Generate SiteMap');
export const generateSiteMapSuccess = createAction('[SEO] Generate SiteMap Success');
export const generateSiteMapFailure = createAction(
  '[SEO] Generate SiteMap Failure',
  props<{ error: any }>(),
);
