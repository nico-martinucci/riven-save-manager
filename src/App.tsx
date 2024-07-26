import SaveContextProvider from "./context";
import ContextContainer from "./ContextContainer";

function App() {
  return (
    <SaveContextProvider>
      <ContextContainer />
    </SaveContextProvider>
  );
}

export default App;
