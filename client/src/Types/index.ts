export enum NodeType {
  Corase = 0,
  Candidate,
  Fine,
  Target,
}

export enum LinkType {
  Visited = 0,
  Extended,
  Searched,
  Fine,
}

export interface INode {
  id: string;
  type: NodeType;
  projection?: [number, number];
  dist?: number;
  cluster_id?: number;
}

export interface ILink {
  source: string;
  target: string;
  type: LinkType;
}

export interface ILevel {
  entry_ids: string[];
  fine_ids: string[];
  nodes: INode[];
  links: ILink[];
}

export interface IVisRes {
  msg: string;
  data: ILevel[];
}

export interface IStore {
  indexTypeList: string[];
  indexType: string;
  setIndexType: (indexType: string) => void;

  visTypeList: string[];
  visType: string;
  setVisType: (visType: string) => void;

  targetId: number;
  setTargetId: (targetId: number) => void;

  setData: (file: File) => void;
  buildParams: { [key: string]: string | number };
  searchParams: { [key: string]: string | number };
  setBuildParams: (params: { [key: string]: string | number }) => void;
  setSearchParams: (params: { [key: string]: string | number }) => void;

  visParams: { [key: string]: string | number };
  setVisParams: (params: { [key: string]: string | number }) => void;

  VisData: ILevel[];

  searchById: () => void;
  searchStatus: string;
}

export interface IIndexParam {
  label: string;
  value: string;
  type: string;
  optionLabels?: string[] | number[];
  optionValues: string[] | number[];
}

export interface IIndexParams {
  build: IIndexParam[];
  search: IIndexParam[];
  vis: IIndexParam[];
}
