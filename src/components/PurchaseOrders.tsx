import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Pencil, Trash2 } from "lucide-react";

interface PurchaseOrder {
  id: string;
  supplier_id: string;
  order_date: string;
  total_amount: number;
  status: "pending" | "approved" | "completed";
  items: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export const PurchaseOrders: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm();

  const quantity = watch("quantity");
  const unit_price = watch("unit_price");

  const handleCreateOrder = (data: any) => {
    const total = Number(data.quantity) * Number(data.unit_price);
    const newOrder: PurchaseOrder = {
      id: crypto.randomUUID(),
      supplier_id: data.supplier_id,
      order_date: new Date().toISOString(),
      total_amount: total,
      status: data.status,
      items: [
        {
          product_id: data.product_id,
          quantity: Number(data.quantity),
          unit_price: Number(data.unit_price),
        },
      ],
    };
    setOrders([newOrder, ...orders]);
    setShowForm(false);
    reset();
  };

  const handleEdit = (id: string) => {
    alert(`Editar orden: ${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta orden?")) {
      setOrders(orders.filter((order) => order.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Nueva Orden de Compra</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
          <form
            onSubmit={handleSubmit(handleCreateOrder)}
            className="space-y-4"
          >

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Producto
              </label>
              <select
                {...register("status", { required: true })}
                className="mt-1 w-full border rounded-md px-3 py-2"
              >
                <option>Seleccione un producto</option>

              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cantidad Llegada
                </label>
                <input
                  type="number"
                  min="1"
                  {...register("quantity", { required: true })}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio Unitario
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("unit_price", { required: true })}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                {...register("status", { required: true })}
                className="mt-1 w-full border rounded-md px-3 py-2"
              >
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobada</option>
                <option value="completed">Completada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total a Pagar
              </label>
              <input
                type="text"
                value={`$${
                  quantity && unit_price
                    ? (Number(quantity) * Number(unit_price)).toFixed(2)
                    : "0.00"
                }`}
                readOnly
                className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-100"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Orden
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Nueva Orden de Compra
            </button>
          </div>

          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {order.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button onClick={() => handleEdit(order.id)}>
                          <Pencil
                            size={18}
                            className="text-blue-600 hover:text-blue-800"
                          />
                        </button>
                        <button onClick={() => handleDelete(order.id)}>
                          <Trash2
                            size={18}
                            className="text-red-600 hover:text-red-800"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No hay órdenes de compra registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cartas en móviles */}
          <div className="block md:hidden space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500">
                No hay órdenes de compra registradas
              </p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 break-words">
                      Orden: <span className="text-gray-900">{order.id}</span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      <strong>Fecha:</strong>{" "}
                      {new Date(order.order_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      <strong>Estado:</strong> {order.status}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Total:</strong> ${order.total_amount.toFixed(2)}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => handleEdit(order.id)}>
                        <Pencil
                          size={20}
                          className="text-blue-600 hover:text-blue-800"
                        />
                      </button>
                      <button onClick={() => handleDelete(order.id)}>
                        <Trash2
                          size={20}
                          className="text-red-600 hover:text-red-800"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
