import { createAction, props } from '@ngrx/store';
import { ISpecification } from '../types/specification.model';

export const getSpecifications = createAction('[Specification] Get Specifications');
export const getSpecificationsSuccess = createAction(
  '[Specification] Get Specifications Success',
  props<{ specifications: ISpecification[] }>(),
);
export const getSpecificationsFailure = createAction(
  '[Specification] Get Specifications Failure',
  props<{ error: any }>(),
);

export const createSpecification = createAction(
  '[Specification] Create Specification',
  props<{ specification: ISpecification }>(),
);
export const createSpecificationSuccess = createAction(
  '[Specification] Create Specification Success',
  props<{ specification: ISpecification }>(),
);
export const createSpecificationFailure = createAction(
  '[Specification] Create Specification Failure',
  props<{ error: any }>(),
);

export const updateSpecification = createAction(
  '[Specification] Update Specification',
  props<{ specification: ISpecification }>(),
);
export const updateSpecificationSuccess = createAction(
  '[Specification] Update Specification Success',
  props<{ specification: ISpecification }>(),
);
export const updateSpecificationFailure = createAction(
  '[Specification] Update Specification Failure',
  props<{ error: any }>(),
);

export const deleteSpecification = createAction(
  '[Specification] Delete Specification',
  props<{ id: number }>(),
);
export const deleteSpecificationSuccess = createAction(
  '[Specification] Delete Specification Success',
  props<{ id: number }>(),
);
export const deleteSpecificationFailure = createAction(
  '[Specification] Delete Specification Failure',
  props<{ error: any }>(),
);
