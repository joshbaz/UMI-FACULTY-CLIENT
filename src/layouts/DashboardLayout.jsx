import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';  

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
    <Sidebar />  {/* Use Sidebar component here */}

    <main className="flex-1 overflow-auto">
      <div className="">
        <Outlet />
      </div>
    </main>
  </div>
  )
}

export default DashboardLayout