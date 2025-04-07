import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo2.png";
import { AuthContext } from "../store/context/AuthContext.jsx";
// import { RiLogoutBoxRLine, RiUserLine } from "react-icons/ri";
import { useGetFacultyProfile } from "../store/tanstackStore/services/queries";
import { Icon } from "@iconify-icon/react";
import { useContext, useMemo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Sidebar = () => {
  const navigate = useNavigate();
  let { logout } = useContext(AuthContext);
  const { data } = useGetFacultyProfile();

  const menuItems = useMemo(() => [
    {
      label: "Dashboard",
      icon: "material-symbols-light:browse-sharp", 
      path: "/dashboard",
    },
    {
      label: "Students Management",
      icon: "material-symbols-light:person-raised-hand",
      path: "/students",
    },
    {
      label: "Grade Management", 
      icon: "heroicons-solid:calendar",
      path: "/grades",
    },
    {
      label: "Notifications",
      icon: "material-symbols:deployed-code-sharp",
      path: "/notifications",
    },
    {
      label: "Faculty Statistics",
      icon: "material-symbols:analytics",
      path: "/statistics",
    },
    {
      label: "Settings",
      icon: "material-symbols:manufacturing",
      path: "/settings",
    },
  ], []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const getLinkClassName = useCallback(({ isActive }) => {
    return `flex items-center px-3 py-2 min-h-[40px] gap-2 text-xs font-[Inter-Medium] rounded-md ${
      isActive
        ? "!text-[#23388F]  bg-[#ECF6FB] [&_svg]:opacity-100 [&_span]:!text-[#23388F]"
        : "text-gray-400   hover:bg-[#ECF6FB]  [&_span]:text-gray-700"
    }`;
  }, []);

  const renderMenuItem = useCallback((item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={getLinkClassName}
    >
      <Icon icon={item.icon} width="24" height="24" />
      <span>{item.label}</span>
    </NavLink>
  ), [getLinkClassName]);

  return (
    <aside className="w-64 bg-white shadow-lg h-screen">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-[#ECF6FB]">
          <img src={Logo} alt="UMI Logo" className="w-full h-14" />
        </div>

        <div className="p-4 border-b border-[#ECF6FB]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Avatar>
                <AvatarImage
                  src={data?.faculty?.profile_image}
                  alt="profile"
                />
                <AvatarFallback>
                  {data?.faculty?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="text-sm font-[Inter-Medium] text-gray-700">
                {data?.faculty?.name}
              </h3>
              <p className="text-xs font-[Inter-Regular] text-gray-500">
                {data?.faculty?.designation}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            <h3 className="px-3 text-xs mb-2 font-[Inter-Medium] text-gray-500 tracking-wider">
              Main Activities
            </h3>
            <div className="flex flex-col gap-2 ">
              {menuItems.slice(0, 4).map(renderMenuItem)}
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <h3 className="mt-4 px-3 text-xs font-[Inter-Medium] text-gray-500 tracking-wider">
                Other Options
              </h3>

              {menuItems.slice(4).map(renderMenuItem)}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-[#E5E7EB]">
          <button
            onClick={handleLogout}
            className="flex items-center justify-between gap-3 px-4 py-2 rounded-md w-full text-[#070B1D] hover:bg-[#ECF6FB]"
          >
            <span className="text-sm font-[Roboto-Medium] text-red-700">
              Logout
            </span>
            <span className="rounded-[6px] w-9 h-7 p-2 border border-[#FB3836] bg-red-100 flex items-center justify-center overflow-hidden">
             <Icon icon="material-symbols:chip-extraction" width="24" height="24" className="text-[#FB3836]" />
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
