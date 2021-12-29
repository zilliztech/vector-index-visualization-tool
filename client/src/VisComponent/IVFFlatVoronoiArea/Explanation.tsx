import React from "react";
import { TLevelStatus } from "Types";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { get_image_url } from "Server";
import {
  CustomCard,
  Title,
  Text,
  CustomButton,
  Highlight,
  ImgGallery,
  ImgItem
} from "Components/CustomCard";

const Explanation = ({
  levelStatus,
  isTargetLeft = true,
  changeLevel,
}: {
  levelStatus: TLevelStatus;
  isTargetLeft?: boolean;
  changeLevel: () => void;
}) => {
  return (
    <CustomCard isRight={isTargetLeft}>
      {levelStatus.level === 0 ? (
        <CoarseLevelExplanation handleClick={changeLevel} />
      ) : (
        <FineLevelExplanation handleClick={changeLevel} />
      )}
    </CustomCard>
  );
};
export default Explanation;

const FineLevelExplanation = observer(
  ({ handleClick }: { handleClick: () => void }) => {
    const store = useGlobalStore();
    const { targetId, vectors_count, searchParams, buildParams, visData, searchStatus } = store;
    const fineIds = searchStatus !== 'ok' ? [] : visData[1].fine_ids; 
    return (
      <CardContent>
        <Title>IVF Flat</Title>
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
        <Text sx={{ fontSize: 16, mb: 1.5, mt: 1.5 }} color="text.secondary">
          In Fine-search, get all vectors in these clusters and compare the
          distances between the target vector with them.
        </Text>
        <Text>
          Select the nearest <Highlight>{searchParams["k"]}</Highlight> vectors
          (k = {searchParams["k"]}).
        </Text>
        <ImgGallery>
          {fineIds.map(fineId => (
            <ImgItem key={fineId} src={get_image_url(fineId)} />
          ))}
        </ImgGallery>
        <CardActions sx={{ display: "flex", flexDirection: "row-reverse" }}>
          <CustomButton onClick={handleClick}>Previous</CustomButton>
          <CustomButton onClick={handleClick}>Project</CustomButton>
        </CardActions>
      </CardContent>
    );
  }
);

const CoarseLevelExplanation = observer(
  ({ handleClick }: { handleClick: () => void }) => {
    const store = useGlobalStore();
    const { targetId, vectors_count, searchParams, buildParams } = store;
    return (
      <CardContent>
        <Title>IVF Flat</Title>
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
        <Text>IVFFlat includes two levels: Coarse-search and Fine-search.</Text>
        <Text>
          In Coarse-search, firstly divide the whole vector space (including{" "}
          <Highlight>{vectors_count}</Highlight> vectors) into{" "}
          <Highlight>{buildParams["nlist"]}</Highlight> clusters (nlist ={" "}
          {buildParams["nlist"]}) according to distance similarity by KNN.
        </Text>
        {/* <Text
        >
          Hover the cluster-area to get more details
        </Text> */}
        <Text>
          Compare the distances between the target vector and the centroid of
          each cluster.
        </Text>
        <Text>
          Select the nearest <Highlight>{searchParams["nprobe"]}</Highlight>{" "}
          clusters (nprobe = {searchParams["nprobe"]}).
        </Text>
        <Text>Next, search the neighboring vectors among these clusters.</Text>
        <CardActions sx={{ display: "flex", flexDirection: "row-reverse" }}>
          <CustomButton onClick={handleClick}>Next</CustomButton>
        </CardActions>
      </CardContent>
    );
  }
);
