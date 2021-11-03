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
  projection?: [number, number];
  dist?: number;
  type: NodeType;
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
