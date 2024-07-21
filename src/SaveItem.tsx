import { FC } from "react";

interface SaveItemProps {
  fileName: string;
  src: string;
}

const SaveItem: FC<SaveItemProps> = ({ fileName, src }) => {
  return (
    <div>
      <p>{fileName}</p>
      <img src={src} alt="Loaded" height={100} />
    </div>
  );
};

export default SaveItem;
