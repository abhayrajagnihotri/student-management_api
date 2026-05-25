import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateUser from "./pages/CreateUser";
import UpdateUser from "./pages/UpdateUser";
import DeleteUser from "./pages/DeleteUser";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/update-user" element={<UpdateUser />} />
        <Route path="/delete-user" element={<DeleteUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;