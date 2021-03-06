import React from "react";
import { makeStyles, Theme } from "@material-ui/core";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "absolute",
    top: "5%",
    bottom: "5%",
    width: 400,
    maxWidth: "26%",
    // background: '#fff',
    // opacity: 0.5,
    // padding: 10,
  },
  rootLeft: {
    left: "6%",
  },
  rootRight: {
    right: "4%",
  },
  // gallery: {
  //   display: "flex",
  //   flexWrap: "wrap",
  //   justifyContent: "space-between",
  // },
  gallery: {
    marginTop: 25,
    marginBottom: 30,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridColumnGap: 20,
    gridRowGap: 16,
  },
  imgItem: {
    width: "100%",
    height: 80,
    objectFit: "cover",
    cursor: "pointer",
    borderRadius: 5,
    opacity: 0.9,
    "&:hover": {
      boxShadow: "0 0 20px #06F3AF",
      opacity: 1,
    },
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
    }}
  >
    {props.children}
  </Box>
);

export const Title = (props: any) => (
  <Typography
    sx={{ fontSize: 18, fontWeight: 500 }}
    color="text.primary"
    gutterBottom
  >
    {props.children}
  </Typography>
);

export const Text = (props: any) => (
  <Typography sx={{ fontSize: 14, mb: 1.5, mt: 1.5 }} color="text.secondary">
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

export const CustomCard = (props: any) => {
  const classes = useStyles();
  const rootClass = `${classes.root} ${
    props.isRight ? classes.rootRight : classes.rootLeft
  }`;

  return (
    <div className={rootClass}>
      <Card
        sx={{
          opacity: 1,
          pt: 1,
          pl: 2,
          pr: 2,
          background: "rgba(240,240,240,0.9)",
          maxHeight: "100%",
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
