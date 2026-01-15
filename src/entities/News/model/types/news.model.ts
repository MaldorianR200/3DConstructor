import { IImage } from 'src/entities/Image';

export interface INews {
  id?: number;
  name: string;
  description: string;
  images: IImage[];
}
