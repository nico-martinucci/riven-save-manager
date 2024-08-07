import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { FC, useEffect, useState } from "react";
import { ImageSrcWithFileName } from "./types";
import SaveItem from "./SaveItem";
import {
  Alert,
  Box,
  ButtonGroup,
  Checkbox,
  ListItemIcon,
  Modal,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSaveContext } from "./context";
import { generate } from "random-words";

const SaveTransferList: FC = () => {
  const { savePath, updateSavePath, storagePath, updateStoragePath } =
    useSaveContext();

  const [storageImageSrcs, setStorageImageSrcs] =
    useState<ImageSrcWithFileName[]>();
  const [saveImageSrcs, setSaveImageSrcs] = useState<ImageSrcWithFileName[]>();
  const [storageChecked, setStorageChecked] = useState<ImageSrcWithFileName[]>(
    []
  );
  const [saveChecked, setSaveChecked] = useState<ImageSrcWithFileName[]>([]);

  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);

  const randomSave = async () => {
    // @ts-ignore
    await window.electron.createRandomSave(saveImageSrcs?.length);
    loadImagesInSaveDir();
  };

  const copyFileToStorage = async (fileName: string) => {
    const randomWords = (generate(3) as string[]).join("-");

    // @ts-ignore
    await window.electron.copyFile(
      `${savePath}/${fileName}`,
      storagePath,
      `${randomWords}.jpg`
    );
    // @ts-ignore
    await window.electron.copyFile(
      `${savePath}/${fileName.split(".")[0]}.sav`,
      storagePath,
      `${randomWords}.sav`
    );
  };

  const copyFileToSaves = async (fileName: string, num: number = 0) => {
    const fileNumber = Number(saveImageSrcs?.length) + num;

    // @ts-ignore
    await window.electron.copyFile(
      `${storagePath}/${fileName}`,
      savePath,
      `Slot${fileNumber}GameState.jpg`
    );
    // @ts-ignore
    await window.electron.copyFile(
      `${storagePath}/${fileName.split(".")[0]}.sav`,
      savePath,
      `Slot${fileNumber}GameState.sav`
    );
  };

  const loadImagesInSaveDir = async () => {
    // @ts-ignore
    const result = await window.electron.loadJpgsInDir(savePath);

    setSaveImageSrcs(
      // @ts-ignore
      result.data.map((jpg) => ({
        jpg: `data:image/jpeg;base64,${jpg.jpg}`,
        fileName: jpg.fileName,
      }))
    );
    setSaveChecked([]);
  };

  const loadImagesInStorageDir = async () => {
    // @ts-ignore
    const result = await window.electron.loadJpgsInDir(storagePath);

    setStorageImageSrcs(
      // @ts-ignore
      result.data.map((jpg) => ({
        jpg: `data:image/jpeg;base64,${jpg.jpg}`,
        fileName: jpg.fileName,
      }))
    );
    setStorageChecked([]);
  };

  const deleteSavesInDir = async (filesToDelete?: string[]) => {
    // @ts-ignore
    await window.electron.deleteFiles(savePath, ".jpg", filesToDelete);
    // @ts-ignore
    await window.electron.deleteFiles(savePath, ".sav", filesToDelete);
    loadImagesInSaveDir();
  };

  const deleteStorageInDir = async (filesToDelete?: string[]) => {
    // @ts-ignore
    await window.electron.deleteFiles(storagePath, ".jpg", filesToDelete);
    // @ts-ignore
    await window.electron.deleteFiles(storagePath, ".sav", filesToDelete);
    loadImagesInStorageDir();
  };

  useEffect(() => {
    loadImagesInSaveDir();
    loadImagesInStorageDir();
  }, [savePath, storagePath]);

  const selectSaveDirectory = async () => {
    // @ts-ignore
    const result = await window.electron.selectDirectory();
    updateSavePath(result.path);
  };

  const selectStorageDirectory = async () => {
    // @ts-ignore
    const result = await window.electron.selectDirectory();
    updateStoragePath(result.path);
    // @ts-ignore
    await window.electron.saveDirPath(result.path, "storagePath");
  };

  if (!saveImageSrcs || !storageImageSrcs) return;

  const handleToggle =
    (value: ImageSrcWithFileName, side: "storage" | "save") => () => {
      const checked = side === "storage" ? storageChecked : saveChecked;
      const setChecked =
        side === "storage" ? setStorageChecked : setSaveChecked;

      const currentIndex = checked.findIndex(
        (img) => img.fileName === value.fileName
      );
      const newChecked = [...checked];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      setChecked(newChecked);
    };

  const handleAllRight = () => {
    storageImageSrcs.forEach(async (save, idx) => {
      await copyFileToSaves(save.fileName, idx);
    });

    loadImagesInSaveDir();
    setStorageChecked([]);
  };

  const handleCheckedRight = () => {
    storageChecked.forEach(async (save, idx) => {
      await copyFileToSaves(save.fileName, idx);
    });

    loadImagesInSaveDir();
    setStorageChecked([]);
  };

  const handleCheckedLeft = () => {
    saveChecked.forEach(async (save) => {
      copyFileToStorage(save.fileName);
    });

    loadImagesInStorageDir();
    setSaveChecked([]);
  };

  const handleAllLeft = () => {
    saveImageSrcs.forEach(async (save) => {
      copyFileToStorage(save.fileName);
    });

    loadImagesInStorageDir();
    setSaveChecked([]);
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const customList = (
    items: readonly ImageSrcWithFileName[],
    side: "storage" | "save"
  ) => (
    <Paper sx={{ width: 300, height: 500, overflow: "auto" }}>
      <List dense component="div" role="list">
        {items.map((value) => {
          const checked = side === "storage" ? storageChecked : saveChecked;

          return (
            <ListItemButton
              key={value.fileName}
              role="listitem"
              onClick={handleToggle(value, side)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <SaveItem fileName={value.fileName} src={value.jpg} />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );

  return (
    <>
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item>
          <Stack spacing={2} alignItems="center">
            <Stack alignItems="center">
              <Typography variant="h6" sx={{ p: 0 }}>
                Storage
              </Typography>
              <Tooltip title={`Current: ${storagePath}`}>
                <Typography
                  sx={{ fontSize: 10 }}
                  component={Button}
                  onClick={selectStorageDirectory}
                >
                  Change Directory
                </Typography>
              </Tooltip>
            </Stack>
            {customList(storageImageSrcs, "storage")}
            <ButtonGroup>
              {!!storageChecked.length && (
                <Button
                  onClick={() =>
                    deleteStorageInDir(
                      storageChecked.map((save) => save.fileName.split(".")[0])
                    )
                  }
                  color="error"
                >
                  Delete Selected
                </Button>
              )}
              <Button onClick={loadImagesInStorageDir}>Refresh</Button>
            </ButtonGroup>
          </Stack>
          <Box sx={{ height: 50 }}></Box>
        </Grid>
        <Grid item>
          <Grid container direction="column" alignItems="center">
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleAllRight}
              disabled={storageImageSrcs.length === 0}
              aria-label="move all right"
            >
              ≫
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={storageChecked.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={saveChecked.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleAllLeft}
              disabled={saveImageSrcs.length === 0}
              aria-label="move all left"
            >
              ≪
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          <Stack spacing={2} alignItems="center">
            <Stack alignItems="center">
              <Typography variant="h6" sx={{ p: 0 }}>
                Active Saves
              </Typography>
              <Tooltip title={`Current: ${savePath}`}>
                <Typography
                  sx={{ fontSize: 10 }}
                  component={Button}
                  onClick={selectSaveDirectory}
                >
                  Change Directory
                </Typography>
              </Tooltip>
            </Stack>
            {customList(saveImageSrcs, "save")}
            <ButtonGroup>
              {saveChecked.length ? (
                <Button
                  onClick={() =>
                    deleteSavesInDir(
                      saveChecked.map((save) => save.fileName.split(".")[0])
                    )
                  }
                  color="error"
                >
                  Delete Selected
                </Button>
              ) : (
                <Button
                  onClick={() => setShowDeleteAllModal(true)}
                  color="error"
                >
                  Delete All
                </Button>
              )}
              <Button onClick={loadImagesInSaveDir}>Refresh</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button onClick={randomSave} variant="contained">
                Generate Randomized Start
              </Button>
            </ButtonGroup>
          </Stack>
        </Grid>
      </Grid>
      <Modal
        open={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Stack alignItems="center" spacing={2}>
            <Alert severity="warning">
              Are you sure you want to delete all saves?
            </Alert>
            <ButtonGroup>
              <Button onClick={() => setShowDeleteAllModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  deleteSavesInDir();
                  setShowDeleteAllModal(false);
                }}
                variant="contained"
              >
                Confirm
              </Button>
            </ButtonGroup>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default SaveTransferList;
