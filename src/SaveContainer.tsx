import { Grid } from "@mui/material";
import { FC } from "react";
import SaveItem from "./SaveItem";

interface SaveContainerProps {
  imageSrcs: { jpg: string; fileName: string }[];
}

const SaveContainer: FC<SaveContainerProps> = ({ imageSrcs }) => {
  return (
    <Grid container>
      {imageSrcs &&
        imageSrcs.map((imageSrc) => (
          <Grid item>
            <SaveItem fileName={imageSrc.fileName} src={imageSrc.jpg} />
          </Grid>
        ))}
    </Grid>
  );
};

export default SaveContainer;
