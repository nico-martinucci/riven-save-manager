import SaveContextProvider from "./context";
import ContextContainer from "./ContextContainer";

function App() {
  console.log("top of app")
  
  return (
    <SaveContextProvider>
      <ContextContainer />
    </SaveContextProvider>
  );
}

export default App;
