import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from './pages/Profile';
import Home from './pages/Home';
import Group from './pages/Group';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/profile' element={<Profile />}></Route>
        <Route path='/home' element={<Home />}></Route>
        <Route path="/group/:id" element={<Group />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;