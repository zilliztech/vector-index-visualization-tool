import React, { useState } from "react";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { get_image_url } from "Server";
import { NodeType } from "Types";
import {
  CustomCard,
  Title,
  Text,
  CustomButton,
  Highlight,
  ImgGallery,
  ImgItem,
} from "Components/CustomCard";
import Typography from "@mui/material/Typography";

const Explanation = observer(
  ({ replay = () => {} }: { replay?: () => void }) => {
    const store = useGlobalStore();
    const { targetId, vectors_count, visData, searchStatus } = store;
    const [status, setStatus] = useState(0);
    const changeStatus = () => setStatus(1 - status);

    const galleries = visData.map((levelData) =>
      levelData.nodes
        .filter(
          (node) =>
            node.type === NodeType.Candidate || node.type === NodeType.Fine
        )
        .map((node) => node.id)
    );
    const fineIds =
      visData.length > 0 ? visData[visData.length - 1].fine_ids : [];

    return (
      <CustomCard isRight>
        <CardContent>
          <Title>HNSW</Title>
          <Divider />
          <img
            src={get_image_url(targetId)}
            style={{
              maxHeight: 200,
              maxWidth: "100%",
              marginTop: 18,
              marginBottom: 8,
            }}
          />
          {status === 0 ? (
            <Introduction replay={replay} changeStatus={changeStatus} />
          ) : (
            <DetailPaths
              changeStatus={changeStatus}
              vectors_count={vectors_count}
              numLayers={visData.length}
              galleries={galleries}
              fineIds={fineIds}
            />
          )}
        </CardContent>
      </CustomCard>
    );
  }
);

const DetailPaths = ({
  changeStatus,
  vectors_count,
  numLayers,
  galleries,
  fineIds,
}: {
  changeStatus: () => void;
  vectors_count: number;
  numLayers: number;
  galleries: string[][];
  fineIds: string[];
}) => {
  return (
    <>
      <Text>
        All Vectors: <Highlight>{vectors_count}</Highlight>
        <br />
        Visited Vectors: <Highlight></Highlight>
        <br />
        Num of Layers: <Highlight>{numLayers}</Highlight>
      </Text>
      {galleries.map((gallery, level) => (
        <React.Fragment key={level}>
          <Typography
            sx={{ fontSize: 14, mb: 1.5, mt: 1.5 }}
            color="text.secondary"
          >
            Level {level}
          </Typography>
          <ImgGallery>
            {gallery.map((id) => (
              <ImgItem
                key={id}
                src={get_image_url(id)}
                highlight={fineIds.indexOf(id) !== -1 && "#06AFF2"}
              />
            ))}
          </ImgGallery>
        </React.Fragment>
      ))}
      <Text>Back to the introduction.</Text>
      <CardActions sx={{ display: "flex", flexDirection: "row-reverse" }}>
        <CustomButton onClick={changeStatus}>Introduction</CustomButton>
      </CardActions>
    </>
  );
};

const Introduction = ({
  replay,
  changeStatus,
}: {
  replay: () => void;
  changeStatus: () => void;
}) => (
  <>
    <Text>HNSW is a tree structure consisting of multiple NSW layers.</Text>

    <Text>
      In each layer, the search will start from the entry point and constantly
      look for the closer vector among all the reachable nodes.
    </Text>
    <Text>
      As the vector space is large, the target is often far from the entrance
      and the search path will be complicated.
    </Text>
    <Text>
      HNSW provides "highways" by abstracting its graph structure layer by
      layer, the number of nodes becomes smaller and the node spacing becomes
      longer.{" "}
    </Text>
    <Text>
      The endpoint in the higher level will be the entry point of the lower
      level for finer-grained search.
    </Text>
    <Text>Replay the animation or explore the detailed search path.</Text>
    <CardActions sx={{ display: "flex", flexDirection: "row-reverse" }}>
      <CustomButton onClick={changeStatus}>Details</CustomButton>
      {/* <CustomButton onClick={replay}>RePlay</CustomButton> */}
    </CardActions>
  </>
);

export default Explanation;
