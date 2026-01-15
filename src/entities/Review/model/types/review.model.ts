import { IImage } from 'src/entities/Image';

export interface IReview {
  id?: number;
  name: string;
  images: IImage[];
}
