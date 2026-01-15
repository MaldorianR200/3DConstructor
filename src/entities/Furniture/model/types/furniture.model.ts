import { IFile } from '../../../Image/model/types';

export interface IFurniture {
  id?: number;
  name: string;
  typeId: number;
  price: number;
  typeHandle?: string;
  indentHandle?: number;
  changeIndent?: boolean;
  bracings?: Array<{
    order: number;
    x: number;
    y: number;
  }>;
  obj?: IFile[];
  active: boolean;
  comment?: string;
}

export interface IFurnitureResponse {
  content: IFurniture[];
  totalPages: number;
  totalElements: number;
}

