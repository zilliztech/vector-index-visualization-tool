import React from "react";
import { TLevelStatus,EIVFFineLevelLayout } from "Types";
import CardContent from "@mui/material/CardContent";
import { generateRandomSamples } from "Utils";
import { get_image_url } from "Server";
import {
  Title,
  Text,
  Highlight,
  ImgGallery,
  ImgItem,
  SingleImg,
  CustomTooltip,
} from "Components/CustomTooltip";

const IVFToolTip = ({
  levelStatus,
  node,
  width,
  height,
  fineLevelLayout = EIVFFineLevelLayout.Polar,
}: {
  levelStatus: TLevelStatus;
  node: any;
  width: number;
  height: number;
  fineLevelLayout?: EIVFFineLevelLayout;
}) => {
  const x = (levelStatus.level === 1 && fineLevelLayout !== EIVFFineLevelLayout.Polar) ? node.projectX : node.x;
  const y = (levelStatus.level === 1 && fineLevelLayout !== EIVFFineLevelLayout.Polar) ? node.projectY : node.y;

  return (
    <CustomTooltip {...{ x, y, width, height }}>
      {levelStatus.level === 0 ? (
        <ClusterTooltip node={node} />
      ) : (
        <NodeTooltip node={node} />
      )}
    </CustomTooltip>
  );
};

const ClusterTooltip = ({ node }: { node: any }) => {
  const { cluster_id, count, dist, ids } = node;
  const samplesNum = 9;
  const samples = generateRandomSamples(count, samplesNum);
  const sampleIds = samples.map((i) => ids[i]);
  return (
    <CardContent>
      <Title>Cluster-{cluster_id}</Title>
      <Text>
        vectors: <Highlight>{count}</Highlight>
        <br />
        distance: <Highlight>{dist.toFixed(2)}</Highlight>
      </Text>
      <ImgGallery>
        {sampleIds.map((id) => (
          <ImgItem key={id} src={get_image_url(id)} />
        ))}
      </ImgGallery>
    </CardContent>
  );
};

const NodeTooltip = ({ node }: { node: any }) => {
  const { id, dist, cluster_id } = node;
  return (
    <CardContent>
      <Title>Vector-{id}</Title>
      <Text>
        cluster: <Highlight>{cluster_id}</Highlight>
        <br />
        distance: <Highlight>{dist.toFixed(2)}</Highlight>
      </Text>
      <SingleImg key={id} src={get_image_url(id)} />
    </CardContent>
  );
};

export default IVFToolTip;
