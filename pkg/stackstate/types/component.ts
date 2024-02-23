import { ConfigureTypeOptions, HeaderOptions } from '@rancher/shell/core/types';

export type ComponentType = {
  id: string;
  name: string;
};

export type UITypeDef = {
  name: string;
  typeDef: (store: any) => any;
  headers: HeaderOptions[];
  config: ConfigureTypeOptions;
};
