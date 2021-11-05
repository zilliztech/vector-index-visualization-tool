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

  targetId: number;
  setTargetId: (targetId: number) => void;

  setData: (file: File) => void;
  setBuildParams: (params: { [key: string]: string | number }) => void;
  setSearchParams: (params: { [key: string]: string | number }) => void;
  setVisParams: (params: { [key: string]: string | number }) => void;

  VisData: ILevel[];

  searchById: () => void;
  searchStatus: string;
}
