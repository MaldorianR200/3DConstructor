import { IImage } from 'src/entities/Image';

export interface IMaterial {
  id?: number;
  name: string;
  typeId: number;
  length: number;
  width: number;
  price: number;
  active: boolean;
  comment?: string;
  texture?: IImage;
}

export interface IMaterialResponse {
  content: IMaterial[];
  totalPages: number;
  totalElements: number;
}
