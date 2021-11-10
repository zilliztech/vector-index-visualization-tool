import React from "react";
import {
  createStyles,
  makeStyles,
  Theme,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      marginRight: theme.spacing(3),
      marginBottom: theme.spacing(1),
      minWidth: 120,
    },
  })
);

const CustomSelect = ({
  label,
  value,
  setValue,
  options,
  labels = [],
}: {
  label: string;
  value: number | string;
  setValue: (arg: any) => void;
  options: any[];
  labels?: any[];
}) => {
  const classes = useStyles();
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setValue(event.target.value);
  };
  if (labels.length === 0) {
    labels = options;
  }
  return (
    <FormControl className={classes.formControl}>
      {label === "" || (
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
      )}
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={value}
        onChange={handleChange}
      >
        {options.map((value: any, i) => (
          <MenuItem key={value} value={value}>
            {labels[i]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelect;
