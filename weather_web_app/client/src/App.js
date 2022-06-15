import { Route, Routes, Navigate } from "react-router-dom"
import Main from "./components/Main"
import Signup from "./components/Signup"
import Login from "./components/Login"
import Weather from "./components/Weather"
import Stats from "./components/Stats"
import MySearchHistory from "./components/MySearchHistory"
import DataManager from "./components/DataManager"

function App() {
  const user = sessionStorage.getItem("token")
  return (
    <Routes>
      {user && <Route path="/" exact element={<Main />} />}
      <Route path="/signup" exact element={<Signup />} />
      <Route path="/login" exact element={<Login />} />
      <Route path="/" element={<Navigate replace to="/login" />} />

      {user && <Route path="/weather" exact element={<Weather />} />}
      <Route path="/weather" element={<Navigate replace to="/login" />} />
      
      {user && <Route path="/stats" exact element={<Stats />} />}
      <Route path="/stats" element={<Navigate replace to="/login" />} />

      {user && <Route path="/mySearchHistory" exact element={<MySearchHistory />} />}
      <Route path="/mySearchHistory" element={<Navigate replace to="/login" />} />

      {user && <Route path="/dataManager" exact element={<DataManager/>} />}
      <Route path="/dataManager" element={<Navigate replace to="/login" />} />
    </Routes>
  )
}

export default App;
