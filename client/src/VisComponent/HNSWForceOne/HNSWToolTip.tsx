import React from "react";
import CardContent from "@mui/material/CardContent";
import { get_image_url } from "Server";
import {
  Title,
  Text,
  Highlight,
  SingleImg,
  CustomTooltip,
} from "Components/CustomTooltip";

const HNSWToolTip = ({
  width,
  height,
  data,
}: {
  width: number;
  height: number;
  data: any;
}) => {
  const { x, y, node, level } = data;
  return (
    <CustomTooltip {...{ x, y, width, height }}>
      <NodeTooltip node={node} level={level} />
    </CustomTooltip>
  );
};

const NodeTooltip = ({ node, level }: { node: any; level: number }) => {
  const { id, dist } = node;
  return (
    <CardContent>
      <Title>Vector-{id}</Title>
      <Text>
        level: <Highlight>{level}</Highlight>
        <br />
        distance: <Highlight>{dist.toFixed(2)}</Highlight>
      </Text>
      <SingleImg key={id} src={get_image_url(id)} />
    </CardContent>
  );
};

export default HNSWToolTip;
