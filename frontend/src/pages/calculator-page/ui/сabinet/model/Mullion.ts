import { MMaterial, Size } from 'src/entities/Cabinet/model/types/cabinet.model';
import { IColor } from 'src/entities/Color';
import { Position } from './BaseModel';

export interface Mullion {
  checkBox: boolean;
  size: Size;
  material: MMaterial;
  position: Position;
}
