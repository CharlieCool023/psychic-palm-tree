import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import SuperAdminDashboard from './pages/dashboard/SuperAdmin'
import StateCommandantDashboard from './pages/dashboard/StateCommandant'
import CampCommandantDashboard from './pages/dashboard/CampCommandant'
import PlatoonInstructorDashboard from './pages/dashboard/PlatoonInstructor'
import ManOWarDashboard from './pages/dashboard/ManOWar'
import SoldierDashboard from './pages/dashboard/Soldier'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard/super-admin/*" element={<SuperAdminDashboard />} />
      <Route path="/dashboard/state-commandant/*" element={<StateCommandantDashboard />} />
      <Route path="/dashboard/commandant/*" element={<CampCommandantDashboard />} />
      <Route path="/dashboard/instructor/*" element={<PlatoonInstructorDashboard />} />
      <Route path="/dashboard/man-o-war/*" element={<ManOWarDashboard />} />
      <Route path="/dashboard/soldier/*" element={<SoldierDashboard />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
