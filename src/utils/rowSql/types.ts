export type RowSqlParam =
  | string
  | number
  | boolean
  | object
  | number[]
  | null
  | undefined;

export type RowSqlResult = {
  query: string;
  params: RowSqlParam[];
};
