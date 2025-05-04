import React, { useState } from "react";
import { format } from "date-fns";
import { Sale, Transfer, Product, Store, Employee } from "../types";

interface MovementsProps {
  sales: Sale[];
  transfers: Transfer[];
  products: Product[];
  stores: Store[];
  employees: Employee[];
}

export const Movements: React.FC<MovementsProps> = ({
  sales,
  transfers,
  products,
  stores,
  employees,
}) => {
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedType, setSelectedType] = useState<
    "all" | "sales" | "transfers"
  >("all");

  const getProductName = (id: string) => {
    const product = products.find((p) => p.id === id);
    return product ? product.name : "Producto no encontrado";
  };

  const getStoreName = (id: string) => {
    const store = stores.find((s) => s.id === id);
    return store ? store.name : "Tienda no encontrada";
  };

  const getEmployeeName = (id: string) => {
    const employee = employees.find((e) => e.id === id);
    return employee
      ? `${employee.first_name} ${employee.last_name}`
      : "Empleado no encontrado";
  };

  const filteredMovements = [
    ...sales.map((sale) => ({
      type: "sale" as const,
      date: sale.created_at,
      product: getProductName(sale.product_id),
      quantity: sale.quantity,
      store: getStoreName(sale.store_id),
      employee: getEmployeeName(sale.employee_id),
    })),
    ...transfers.map((transfer) => ({
      type: "transfer" as const,
      date: transfer.created_at,
      product: getProductName(transfer.product_id),
      quantity: transfer.quantity,
      fromStore: getStoreName(transfer.from_store_id),
      toStore: getStoreName(transfer.to_store_id),
      employee: getEmployeeName(transfer.employee_id),
    })),
  ]
    .filter((movement) => {
      if (selectedStore) {
        if (movement.type === "sale") {
          return movement.store === getStoreName(selectedStore);
        } else {
          return (
            movement.fromStore === getStoreName(selectedStore) ||
            movement.toStore === getStoreName(selectedStore)
          );
        }
      }
      if (selectedType !== "all") {
        return movement.type === selectedType;
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
              onChange={(e) =>
                setSelectedType(e.target.value as "all" | "sales" | "transfers")
              }
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="sales">Ventas</option>
              <option value="transfers">Transferencias</option>
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        movement.type === "sale"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {movement.type === "sale" ? "Venta" : "Transferencia"}
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
                      : `De: ${movement.fromStore} → A: ${movement.toStore}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {movement.employee}
                  </td>
                </tr>
              ))}
              {filteredMovements.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No hay movimientos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 sm:hidden">
        {filteredMovements.length === 0 ? (
          <div className="text-center text-gray-500">
            No hay movimientos registrados
          </div>
        ) : (
          filteredMovements.map((movement, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow space-y-2"
            >
              <div className="text-sm text-gray-600">
                {format(new Date(movement.date), "dd/MM/yyyy HH:mm")}
              </div>
              <div className="text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    movement.type === "sale"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {movement.type === "sale" ? "Venta" : "Transferencia"}
                </span>
              </div>
              <div>
                <strong>Producto:</strong> {movement.product}
              </div>
              <div>
                <strong>Cantidad:</strong> {movement.quantity}
              </div>
              <div>
                <strong>
                  {movement.type === "sale" ? "Tienda" : "De / A"}:
                </strong>{" "}
                {movement.type === "sale"
                  ? movement.store
                  : `${movement.fromStore} → ${movement.toStore}`}
              </div>
              <div>
                <strong>Empleado:</strong> {movement.employee}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
