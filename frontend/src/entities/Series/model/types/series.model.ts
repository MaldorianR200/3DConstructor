import { IImage } from 'src/entities/Image';

export interface ISeries {
  id?: number;
  name: string;
  active: boolean;
  comment?: string;
}

export interface ISeriesResponse {
  content: ISeries[];
  totalPages: number;
  totalElements: number;
}
