// React Router importieren
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Seiten importieren
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wenn URL = /login → zeige Login Komponente */}
        <Route path="/login" element={<Login />} />

        {/* Wenn URL = /register → zeige Register Komponente */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
