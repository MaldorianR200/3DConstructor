import { IGrid } from 'src/entities/Grid';
import { IImage } from 'src/entities/Image';

export interface ICategory {
  id?: number;
  name: string;
  images: IImage[];
  grid?: IGrid;
}
