import { Button, Stack, Typography } from "@mui/material";
import { useSaveContext } from "./context";
import { useEffect } from "react";
import os from "os";

const DirectoryPicker = () => {
  const { savePath, updateSavePath, storagePath, updateStoragePath } =
    useSaveContext();

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

  useEffect(() => {
    const checkForDirectories = async () => {
      let result;

      if (os.platform() === "darwin") {
        // @ts-ignore
        result = await window.electron.checkDirExists(
          "~/Library/Application Support/Epic/Riven/Saved/SaveGames"
        );
      }

      if (os.platform() === "win32") {
        // @ts-ignore
        result = await window.electron.checkDirExists(
          "~/AppData/Local/Riven/Saved/SaveGames"
        );
      }

      if (result.expandedDir) updateSavePath(result.expandedDir);

      // @ts-ignore
      const result2 = await window.electron.loadDirPath("storagePath");

      if (result2.dirPath.storagePath)
        updateStoragePath(result2.dirPath.storagePath);
    };

    checkForDirectories();
  }, []);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button onClick={selectSaveDirectory}>Select Save Directory</Button>
        <Typography>{savePath}</Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button onClick={selectStorageDirectory}>
          Select Storage Directory
        </Button>
        <Typography>{storagePath}</Typography>
      </Stack>
    </Stack>
  );
};

export default DirectoryPicker;
