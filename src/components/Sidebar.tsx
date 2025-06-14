import React, { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  Truck,
  Menu,
  X,
  ShoppingCart,
  ArrowRightLeft,
  History,
  Store,
  ClipboardList,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sales", label: "Ventas", icon: ShoppingCart },
    { id: "transfers", label: "Transferencias", icon: ArrowRightLeft },
    { id: "movements", label: "Movimientos", icon: History },
    { id: "stores", label: "Tiendas", icon: Store },
    { id: "purchase-orders", label: "Órdenes de Compra", icon: ClipboardList },
    { id: "employees", label: "Empleados", icon: Users },
    { id: "products", label: "Productos", icon: Package },
    { id: "suppliers", label: "Proveedores", icon: Truck },
    { id: "exchange", label: "Tipo de Cambio", icon: DollarSign },
  ];

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    localStorage.setItem("currentPage", pageId);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      onPageChange(savedPage);
    }
  }, [onPageChange]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 right-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed left-0 top-0 h-full bg-white shadow-lg z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:w-64
      `}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Axcel</h1>
        </div>
        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left
                  ${
                    currentPage === item.id
                      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
