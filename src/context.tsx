import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

const SaveContext = createContext<{
  savePath: string | undefined;
  updateSavePath: (newValue: string) => void;
  storagePath: string | undefined;
  updateStoragePath: (newValue: string) => void;
}>({
  savePath: undefined,
  updateSavePath: () => {},
  storagePath: undefined,
  updateStoragePath: () => {},
});

interface SaveContextProviderProps {
  savePath?: string | undefined;
  storagePath?: string | undefined;
}

const SaveContextProvider: FC<PropsWithChildren<SaveContextProviderProps>> = ({
  children,
  ...props
}) => {
  const [savePath, setSavePath] = useState<string | undefined>(props.savePath);
  const [storagePath, setStoragePath] = useState<string | undefined>(
    props.storagePath
  );

  const updateSavePath = (newValue: string | undefined) => {
    setSavePath(newValue);
  };

  const updateStoragePath = (newValue: string | undefined) => {
    setStoragePath(newValue);
  };

  return (
    <SaveContext.Provider
      value={{ savePath, updateSavePath, storagePath, updateStoragePath }}
    >
      {children}
    </SaveContext.Provider>
  );
};

export default SaveContextProvider;

export const useSaveContext = () => useContext(SaveContext);
