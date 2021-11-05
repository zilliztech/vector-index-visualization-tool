import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { FormControl, InputLabel, Input } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      width: 120,
    },
  })
);

const CustomInput = ({
  label,
  value,
  setValue,
  type,
}: {
  label: string;
  value: number;
  setValue: (arg: any) => void;
  type: string;
}) => {
  const classes = useStyles();
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setValue(event.target.value);
  };
  return (
    <FormControl className={classes.formControl}>
      {label === "" || (
        <InputLabel htmlFor="demo-customized-textbox">{label}</InputLabel>
      )}
      <Input
        id="demo-customized-textbox"
        type={type}
        value={value}
        onChange={handleChange}
      />
    </FormControl>
  );
};

export default CustomInput;
