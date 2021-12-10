export enum NodeType {
  None = -1,
  Coarse = 0,
  Candidate,
  Fine,
  Target,
}

export enum LinkType {
  None = -1,
  Visited = 0,
  Extended,
  Searched,
  Fine,
}

export enum LevelStatus {
  Init = 0,
  Enter,
  Exit,
  End,
}

export type TNodeProjection = [number, number];

export interface INodesData {
  id: string;
  type: NodeType[];
  projection: TNodeProjection[];
  isEntry: boolean[];
  cluster_id: string[] | number[];

  color: string[];
  opacity: number[];
  size: number[];
  shape: string[];
  transition: string[];
}

export interface INode {
  id: string;
  type: NodeType;
  projection?: TNodeProjection;
  dist?: number;
  cluster_id?: number;
  count?: number;
}

export interface IIVFNode extends INode {
  projection: TNodeProjection;
  x: number;
  y: number;
}

export interface IIVFVoronoiAreaFineNode extends INode {
  dist: number;
  x: number;
  y: number;
  r: number;
  color: string;

  centroidX: number;
  centroidY: number;
}

export interface IIVFVoronoiAreaNode extends INode {
  projection: TNodeProjection;
  x: number;
  y: number;
  r: number;
  count: number;
  countP: number;
  countArea: number;
  pathD: string;
  polygonCentroid: [number, number];
  polarPolyCentroid: [number, number];
  translate: [number, number];
  color: string;
  polarPathD: string;
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

  visData: ILevel[];

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

export interface ILayoutMap {
  [key: string | number]: [number, number];
}
