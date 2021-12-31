import React from "react";
import { makeStyles, Theme } from "@material-ui/core";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "absolute",
    width: 300,
    maxWidth: "20%",
    pointerEvents: "none",
  },
  gallery: {
    marginTop: 12,
    // marginBottom: 30,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridColumnGap: 12,
    gridRowGap: 10,
  },
  imgItem: {
    width: "100%",
    height: 60,
    objectFit: "cover",
    cursor: "pointer",
    borderRadius: 3,
    opacity: 0.9,
    "&:hover": {
      boxShadow: "0 0 20px #06F3AF",
      opacity: 1,
    },
  },
  singleImg: {
    maxWidth: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 5,
    marginTop: 12,
  },
}));

export const Highlight = (props: any) => (
  <Box
    component="span"
    sx={{
      display: "inline-block",
      color: "#02BE88",
      fontSize: 16,
      fontWeight: 500,
      textDecoration: "underline",
      ml: 1,
    }}
  >
    {props.children}
  </Box>
);

export const Text = (props: any) => (
  <Typography sx={{ fontSize: 14, mb: 0.5, mt: 0.5 }} color="text.secondary">
    {props.children}
  </Typography>
);

export const Title = (props: any) => (
  <Typography
    sx={{ fontSize: 16, fontWeight: 500 }}
    color="text.primary"
    // gutterBottom
  >
    {props.children}
  </Typography>
);

export const CustomButton = (props: any) => (
  <Button
    variant="contained"
    size="medium"
    sx={{
      backgroundColor: "#02BE88",
      "&:hover": {
        backgroundColor: "#06F3AF",
      },
      ml: 2,
    }}
    onClick={props.onClick}
  >
    {props.children}
  </Button>
);

export const CustomTooltip = (props: any) => {
  const classes = useStyles();
  const {x,y,width,height, bias=20} = props;
  const posStyle = {} as any;
  if (x > width * 0.8) {
    posStyle["right"] = width - x - bias * 0.5;
  } else {
    posStyle["left"] = x + bias;
  }
  if (y > height * 0.7) {
    posStyle["bottom"] = height - y - bias * 0.5;
  } else {
    posStyle["top"] = y + bias;
  }
  return (
    <div className={classes.root} style={posStyle}>
      <Card
        sx={{
          opacity: 1,
          pt: 0,
          pl: 0.5,
          pr: 0.5,
          background: "rgba(240,240,240,0.9)",
          maxHeight: "30%",
          minHeight: "20%",
          overflow: "auto",
        }}
      >
        {props.children}
      </Card>
    </div>
  );
};

export const ImgGallery = (props: any) => {
  const classes = useStyles();
  return <div className={classes.gallery}>{props.children}</div>;
};

export const ImgItem = (props: any) => {
  const classes = useStyles();
  const { src, highlight = "" } = props;
  const color = `5px solid ${highlight}`;
  const style =
    highlight.length === 0 ? {} : { borderRight: color, borderBottom: color };
  return <img src={src} className={classes.imgItem} style={style} />;
};

export const SingleImg = (props: any) => {
  const classes = useStyles();
  const { src } = props;
  return <img src={src} className={classes.singleImg}/>;
};

