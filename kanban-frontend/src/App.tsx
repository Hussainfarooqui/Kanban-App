
import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Board from "./pages/Board";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/board" element={<Board />} />
    </Routes>
  );
}

export default App;
