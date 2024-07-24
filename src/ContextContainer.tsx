import { useSaveContext } from "./context";
import DirectoryPicker from "./DirectoryPicker";
import SaveTransferList from "./SaveTransferList";

const ContextContainer = () => {
  const { savePath, storagePath } = useSaveContext();

  return (
    <>{savePath && storagePath ? <SaveTransferList /> : <DirectoryPicker />}</>
  );
};

export default ContextContainer;
