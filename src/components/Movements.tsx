import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "../lib/supabase"; // Ajusta esta ruta según tu proyecto

export const Movements: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"all" | "sales" | "transfers" | "purchase_orders">("all");

  useEffect(() => {
    const fetchData = async () => {
      const [
  { data: salesData },
  { data: transfersData },
  { data: purchaseData },
  { data: purchaseItemsData },
  { data: productsData },
  { data: storesData },
  { data: employeesData }
] = await Promise.all([
supabase
  .from("transfer_items")
  .select(`
    *,
    transfers (
      id,
      transfer_date,
      employee_id,
      from_store_id,
      to_store_id
    ),
    products (
      id,
      name
    )
  `),


supabase
  .from("sale_items")
 .select('*, sales(id, sale_date, employee_id, store_id), products(id, name)'),

  supabase.from("purchase_orders").select("*"),
  supabase.from("purchase_order_items").select("*"),
  supabase.from("products").select("*"),
  supabase.from("stores").select("*"),
  supabase.from("employees").select("*"),
]);


      setSales(salesData || []);
      setTransfers(transfersData || []);
      setPurchaseOrders(purchaseData || []);
      setProducts(productsData || []);
      setStores(storesData || []);
      setEmployees(employeesData || []);
      setPurchaseOrderItems(purchaseItemsData || []);

    };

    fetchData();
    
  }, []);

  const getProductName = (id: string) => {
  const product = products.find((p) => p.id === id);
  if (!product) console.warn("Producto no encontrado para id:", id);
  return product?.name || "Producto no encontrado";
};

  const getStoreName = (id: string) => stores.find((s) => s.id === id)?.name || "Tienda no encontrada";
  const getEmployeeName = (id: string) => {
    const e = employees.find((emp) => emp.id === id);
    return e ? `${e.first_name} ${e.last_name}` : "Empleado no encontrado";
  };

  const filteredMovements = [
    ...sales.map((item) => ({
      type: "sale" as const,
      date: item.sales.created_at,
      product: getProductName(item.product_id),
      quantity: item.quantity,
      store: getStoreName(item.sales.store_id),
      employee: getEmployeeName(item.sales.employee_id),
    })),
    ...transfers.map((item) => ({
      type: "transfer" as const,
      date: item.transfers.transfer_date,
      product: getProductName(item.product_id),
      quantity: item.quantity,
      fromStore: getStoreName(item.transfers.from_store_id),
      toStore: getStoreName(item.transfers.to_store_id),
      employee: getEmployeeName(item.transfers.employee_id),
    })),
    ...purchaseOrders.map((order) => {
  const items = purchaseOrderItems.filter(item => item.purchase_order_id === order.id);
  const productSummary = items.map(item => {
    const productName = getProductName(item.product_id);
    return `${productName} (${item.quantity})`;
  }).join(", ");

  return {
    type: "purchase_order" as const,
    date: order.order_date,
    product: productSummary || "-",
    quantity: items.reduce((sum, item) => sum + item.quantity, 0) || "-",
    store: "-", // puedes asignar tienda si tienes ese dato
    employee: getEmployeeName(order.employee_id),
    status: order.status,
  };
}),

  ]
    .filter((movement) => {
      if (selectedType !== "all" && movement.type !== selectedType) return false;
      if (selectedStore) {
        if (movement.type === "sale") return movement.store === getStoreName(selectedStore);
        if (movement.type === "transfer") return (
          movement.fromStore === getStoreName(selectedStore) ||
          movement.toStore === getStoreName(selectedStore)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Tienda
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las tiendas</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Movimiento
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="sales">Ventas</option>
              <option value="transfers">Transferencias</option>
              <option value="purchase_orders">Órdenes de Compra</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.map((movement, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {format(new Date(movement.date), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      movement.type === "sale"
                        ? "bg-green-100 text-green-800"
                        : movement.type === "transfer"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {movement.type === "sale"
                        ? "Venta"
                        : movement.type === "transfer"
                        ? "Transferencia"
                        : "Orden de Compra"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {movement.product}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {movement.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {movement.type === "sale"
                      ? `Tienda: ${movement.store}`
                      : movement.type === "transfer"
                      ? `De: ${movement.fromStore} → A: ${movement.toStore}`
                      : `Estado: ${movement.status}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {movement.employee}
                  </td>
                </tr>
              ))}
              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hay movimientos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
