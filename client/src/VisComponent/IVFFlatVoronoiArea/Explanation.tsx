import React from "react";
import { TLevelStatus } from "Types";
import { makeStyles, Theme } from "@material-ui/core";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { get_image_url } from "Server";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "absolute",
    top: "5%",
    bottom: "5%",
    width: "24%",
    // background: '#fff',
    // opacity: 0.5,
    // padding: 10,
  },
  rootLeft: {
    left: "6%",
  },
  rootRight: {
    right: "6%",
  },
}));

const Highlight = (props: any) => (
  <Box
    component="span"
    sx={{
      display: "inline-block",
      color: "#02BE88",
      fontSize: 18,
      fontWeight: 500,
      textDecoration: "underline",
    }}
  >
    {props.children}
  </Box>
);

const Explanation = ({
  levelStatus,
  isTargetLeft = true,
  changeLevel,
}: {
  levelStatus: TLevelStatus;
  isTargetLeft?: boolean;
  changeLevel: () => void;
}) => {
  const classes = useStyles();
  const rootClass = `${classes.root} ${
    isTargetLeft ? classes.rootRight : classes.rootLeft
  }`;

  return (
    <div className={rootClass}>
      <Card
        sx={{
          opacity: 0.9,
          pt: 1,
          pl: 2,
          pr: 2,
          background: "#ccc",
          // height: "90%"
        }}
      >
        {levelStatus.level === 0 ? (
          <CoarseLevelExplanation handleClick={changeLevel} />
        ) : (
          <FineLevelExplanation handleClick={changeLevel} />
        )}
      </Card>
    </div>
  );
};
export default Explanation;

const FineLevelExplanation = observer(
  ({ handleClick }: { handleClick: () => void }) => {
    const store = useGlobalStore();
    const { targetId, vectors_count, searchParams, buildParams } = store;

    return (
      <CardContent>
        <Typography sx={{ fontSize: 20, fontWeight: 500 }} color="text.primary" gutterBottom>
          IVF Flat
        </Typography>
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
        <Typography
          sx={{ fontSize: 16, mb: 1.5, mt: 1.5 }}
          color="text.secondary"
          gutterBottom
        >
          In Fine-search, get all vectors in these clusters and compare the
          distances between the target vector with them.
        </Typography>
        <Typography
          sx={{ fontSize: 16, mb: 1.5, mt: 1.5 }}
          color="text.secondary"
          gutterBottom
        >
          Select the nearest <Highlight>{searchParams["k"]}</Highlight> vectors
          (k = {searchParams["k"]}).
        </Typography>
        <CardActions sx={{ display: "flex", flexDirection: "row-reverse" }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "#02BE88",
              "&:hover": {
                backgroundColor: "#06F3AF",
              },
              ml: 2,
            }}
            onClick={handleClick}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "#02BE88",
              "&:hover": {
                backgroundColor: "#06F3AF",
              },
            }}
            onClick={handleClick}
          >
            Project
          </Button>
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
        <Typography sx={{ fontSize: 20 }} color="text.primary" gutterBottom>
          IVF Flat
        </Typography>
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
        <Typography
          sx={{ fontSize: 16, mb: 1.5, mt: 1.5 }}
          color="text.secondary"
          gutterBottom
        >
          IVFFlat includes two levels: Coarse-search and Fine-search.
        </Typography>
        <Typography
          sx={{ fontSize: 16, mb: 1.5, mt: 1.5 }}
          color="text.secondary"
          gutterBottom
        >
          In Coarse-search, firstly divide the whole vector space (including{" "}
          <Highlight>{vectors_count}</Highlight> vectors) into{" "}
          <Highlight>{buildParams["nlist"]}</Highlight> clusters (nlist ={" "}
          {buildParams["nlist"]}) according to distance similarity by KNN.
        </Typography>
        {/* <Typography
          sx={{ fontSize: 16, mb: 1.5, mt: 1.5 }}
          color="text.secondary"
          gutterBottom
        >
          Hover the cluster-area to get more details
        </Typography> */}
        <Typography
          sx={{ fontSize: 16, mb: 1.5, mt: 1.5 }}
          color="text.secondary"
          gutterBottom
        >
          Compare the distances between the target vector and the centroid of
          each cluster.
        </Typography>
        <Typography
          sx={{ fontSize: 16, mb: 1.5, mt: 1.5 }}
          color="text.secondary"
          gutterBottom
        >
          Select the nearest <Highlight>{searchParams["nprobe"]}</Highlight>{" "}
          clusters (nprobe = {searchParams["nprobe"]}).
        </Typography>
        <Typography
          sx={{ fontSize: 16, mb: 1.5, mt: 1.5 }}
          color="text.secondary"
          gutterBottom
        >
          Next, search most neighboring vectors among these clusters.
        </Typography>
        <CardActions sx={{ display: "flex", flexDirection: "row-reverse" }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "#02BE88",
              "&:hover": {
                backgroundColor: "#06F3AF",
              },
            }}
            onClick={handleClick}
          >
            Next
          </Button>
        </CardActions>
      </CardContent>
    );
  }
);
