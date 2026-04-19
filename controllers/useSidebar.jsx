// controllers/useSidebar.jsx — Mobile sidebar open/close.
(function () {
  const { useState } = React;

  function useSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const openSidebar = () => setSidebarOpen(true);
    const closeSidebar = () => setSidebarOpen(false);
    return { sidebarOpen, openSidebar, closeSidebar };
  }

  HB.Controllers.useSidebar = useSidebar;
})();
