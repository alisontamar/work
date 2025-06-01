import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface PurchaseOrder {
  id: string;
  supplier_id: string;
  order_date: string;
  total_amount: number;
  status: "pending" | "approved" | "completed";
  items: PurchaseOrderItem[];
  amount_paid: number; // New field for paid amount
}

interface PurchaseOrderItem {
  product_id: string;
  product_name?: string; // Nuevo campo opcional
  quantity: number;
  total_price: number;
}

// Nueva interfaz para los pagos
interface Payment {
  id: string;
  order_id: string;
  payment_amount: number;
  payment_date: string;
  created_at: string;
}

export const PurchaseOrders: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm();
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const quantity = watch("quantity");
  const price_unit = watch("price_unit");

  // ESTADOS PARA EL MODAL DE CONFIRMACIÓN
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToDeleteId, setOrderToDeleteId] = useState<string | null>(null);

  // ESTADOS PARA FILTROS Y ORDENAMIENTO
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "completed"
  >("all");
  const [monthFilter, setMonthFilter] = useState<string>("all"); // 'YYYY-MM' format
  const [filteredAndSortedOrders, setFilteredAndSortedOrders] = useState<
    PurchaseOrder[]
  >([]);

  // ESTADOS PARA LA FUNCIONALIDAD DE PAGOS EN CUOTAS Y ACTUALIZACIÓN DE PRECIO
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedOrderForInstallment, setSelectedOrderForInstallment] =
    useState<PurchaseOrder | null>(null);
  const [currentPayment, setCurrentPayment] = useState<number>(0);
  const [newTotalAmount, setNewTotalAmount] = useState<number>(0);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]); // Nuevo estado para el historial de pagos

  useEffect(() => {
    const fetchData = async () => {
      // 1. Productos
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name");

      // 2. Proveedores
      const { data: suppliersData, error: suppliersError } = await supabase
        .from("suppliers")
        .select("id, first_name, last_name");

      if (suppliersError) {
        console.error("Error al obtener proveedores:", suppliersError.message);
      }

      if (productsData) setProducts(productsData);
      if (suppliersData) setSuppliers(suppliersData);

      // 3. Órdenes con productos dentro
      const { data: ordersData, error: ordersError } = await supabase.from(
        "purchase_orders"
      ).select(`
          *,
          purchase_order_items:purchase_order_items_order_id_fkey (
            *,
            product:products ( name )
          )
        `);

      if (ordersError) {
        console.error("Error al obtener órdenes:", ordersError.message);
      } else {
        const formattedOrders = ordersData.map((order: any) => ({
          ...order,
          items: order.purchase_order_items.map((item: any) => ({
            product_id: item.product_id,
            product_name: item.product?.name || "Desconocido",
            quantity: item.quantity,
            total_price: item.total_price,
          })),
          amount_paid: order.amount_paid || 0, // Ensure amount_paid exists, default to 0
        }));

        setOrders(formattedOrders);
      }
    };

    fetchData();
  }, []);

  // useEffect para aplicar filtros y ordenamiento
  useEffect(() => {
    let currentOrders = [...orders];

    // 1. Aplicar filtro de búsqueda
    if (searchTerm !== "") {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentOrders = currentOrders.filter((order) => {
        const productNames = order.items
          .map((item) => item.product_name?.toLowerCase())
          .join(", ");
        if (productNames.includes(lowerCaseSearchTerm)) return true;

        const totalQuantity = order.items.reduce(
          (acc, item) => acc + item.quantity,
          0
        );
        if (totalQuantity.toString().includes(lowerCaseSearchTerm))
          return true;

        const orderDate = new Date(order.order_date).toLocaleDateString();
        if (orderDate.toLowerCase().includes(lowerCaseSearchTerm)) return true;

        if (order.status.toLowerCase().includes(lowerCaseSearchTerm))
          return true;

        if (
          (order.total_amount ?? 0)
            .toFixed(2)
            .includes(lowerCaseSearchTerm)
        )
          return true;

        return false;
      });
    }

    // 2. Aplicar filtro por estado
    if (statusFilter !== "all") {
      currentOrders = currentOrders.filter(
        (order) => order.status === statusFilter
      );
    }

    // 3. Aplicar filtro por mes
    if (monthFilter !== "all") {
      currentOrders = currentOrders.filter((order) => {
        const orderMonth = new Date(order.order_date)
          .toISOString()
          .substring(0, 7); // 'YYYY-MM'
        return orderMonth === monthFilter;
      });
    }

    // 4. Ordenar por fecha (del más reciente al más antiguo)
    currentOrders.sort(
      (a, b) =>
        new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );

    setFilteredAndSortedOrders(currentOrders);
  }, [searchTerm, statusFilter, monthFilter, orders]); // Dependencias

  // Función para volver a cargar las órdenes después de una operación (crear/eliminar/actualizar)
  const fetchOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase.from(
      "purchase_orders"
    ).select(`
          *,
          purchase_order_items:purchase_order_items_order_id_fkey (
            *,
            product:products ( name )
          )
        `);

    if (ordersError) {
      console.error("Error al obtener órdenes:", ordersError.message);
    } else {
      const formattedOrders = ordersData.map((order: any) => ({
        ...order,
        items: order.purchase_order_items.map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product?.name || "Desconocido",
          quantity: item.quantity,
          total_price: item.total_price,
        })),
        amount_paid: order.amount_paid || 0,
      }));
      setOrders(formattedOrders); // Esto activará el useEffect de filtrado y ordenamiento
    }
  };

  const handleCreateOrder = async (data: any) => {
    const total = Number(data.quantity) * Number(data.price_unit);

    const { data: insertedOrder, error } = await supabase
      .from("purchase_orders")
      .insert([
        {
          supplier_id: data.supplier_id,
          order_date: new Date().toISOString(),
          total_amount: total,
          status: data.status,
          amount_paid: 0, // Initialize amount_paid to 0 for new orders
        },
      ])
      .select()
      .single();

    if (error || !insertedOrder) {
      console.error("Error al guardar la orden:", error);
      return;
    }

    const { error: itemError } = await supabase
      .from("purchase_order_items")
      .insert([
        {
          order_id: insertedOrder.id,
          product_id: data.product_id,
          quantity: Number(data.quantity),
          total_price: Number(data.quantity) * Number(data.price_unit),
        },
      ]);

    if (itemError) {
      console.error("Error al guardar ítem:", itemError);
      return;
    }

    fetchOrders();
    setShowForm(false);
    reset();
  };

  const handleEdit = (id: string) => {
    alert(`Editar orden: ${id}`);
    // Aquí iría la lógica para cargar los datos de la orden en el formulario y permitir la edición
  };

  const handleDeleteClick = (id: string) => {
    setOrderToDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (orderToDeleteId) {
      // Eliminar pagos asociados primero
      const { error: paymentsError } = await supabase
        .from("purchase_order_payments")
        .delete()
        .eq("order_id", orderToDeleteId);

      if (paymentsError) {
        console.error("Error al eliminar pagos de la orden:", paymentsError.message);
        setShowConfirmModal(false);
        setOrderToDeleteId(null);
        return;
      }

      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .delete()
        .eq("order_id", orderToDeleteId);

      if (itemsError) {
        console.error("Error al eliminar ítems de la orden:", itemsError.message);
        setShowConfirmModal(false);
        setOrderToDeleteId(null);
        return;
      }

      const { error: orderError } = await supabase
        .from("purchase_orders")
        .delete()
        .eq("id", orderToDeleteId);

      if (orderError) {
        console.error("Error al eliminar orden de compra:", orderError.message);
      } else {
        console.log(`Orden ${orderToDeleteId} y sus ítems eliminados exitosamente.`);
        fetchOrders();
      }

      setShowConfirmModal(false);
      setOrderToDeleteId(null);
    }
  };

  // Handlers para la funcionalidad de pagos en cuotas
  const handleInstallmentClick = async (order: PurchaseOrder) => {
    setSelectedOrderForInstallment(order);
    setCurrentPayment(0); // Reset current payment input
    setNewTotalAmount(order.total_amount); // Initialize with current total amount
    await fetchPaymentHistory(order.id); // Fetch history when modal opens
    setShowInstallmentModal(true);
  };

  const fetchPaymentHistory = async (orderId: string) => {
    const { data, error } = await supabase
      .from("purchase_order_payments")
      .select("*")
      .eq("order_id", orderId)
      .order("payment_date", { ascending: false }); // Order by newest first

    if (error) {
      console.error("Error al obtener historial de pagos:", error.message);
      setPaymentHistory([]);
    } else {
      setPaymentHistory(data as Payment[]);
    }
  };

  const handleRecordInstallment = async () => {
    if (selectedOrderForInstallment && currentPayment > 0) {
      // 1. Insert the new payment record
      const { data: newPayment, error: paymentError } = await supabase
        .from("purchase_order_payments")
        .insert([
          {
            order_id: selectedOrderForInstallment.id,
            payment_amount: currentPayment,
            payment_date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (paymentError || !newPayment) {
        console.error("Error al registrar cuota:", paymentError?.message);
        return;
      }

      // 2. Update the total_amount_paid in the purchase_orders table
      const updatedAmountPaid = selectedOrderForInstallment.amount_paid + currentPayment;
      const newStatus = updatedAmountPaid >= selectedOrderForInstallment.total_amount ? "completed" : selectedOrderForInstallment.status;

      const { error: orderUpdateError } = await supabase
        .from("purchase_orders")
        .update({ amount_paid: updatedAmountPaid, status: newStatus })
        .eq("id", selectedOrderForInstallment.id);

      if (orderUpdateError) {
        console.error("Error al actualizar monto pagado en la orden:", orderUpdateError.message);
        // Consider rolling back the payment insertion here if this update fails
      } else {
        console.log(`Cuota de $${currentPayment.toFixed(2)} registrada para la orden ${selectedOrderForInstallment.id}`);
        // Refresh both orders and payment history
        fetchOrders();
        await fetchPaymentHistory(selectedOrderForInstallment.id);
        setCurrentPayment(0); // Clear the input field
      }
    }
  };

  const handleUpdateTotalAmount = async () => {
    if (selectedOrderForInstallment && newTotalAmount >= 0) {
      const { error } = await supabase
        .from("purchase_orders")
        .update({ total_amount: newTotalAmount })
        .eq("id", selectedOrderForInstallment.id);

      if (error) {
        console.error("Error al actualizar precio total:", error.message);
      } else {
        console.log(`Precio total de la orden ${selectedOrderForInstallment.id} actualizado a $${newTotalAmount.toFixed(2)}`);
        fetchOrders(); // Refresh orders to reflect changes
        // Keep the modal open as the user might want to record payments
      }
    }
  };

  // Generar lista de meses únicos de las órdenes existentes
  const availableMonths = [
    "all",
    ...Array.from(
      new Set(
        orders.map((order) =>
          new Date(order.order_date).toISOString().substring(0, 7)
        ) // 'YYYY-MM'
      )
    ).sort((a, b) => b.localeCompare(a)), // Sort months in descending order (latest first)
  ];

  // Helper para formatear el mes (YYYY-MM a Nombre del Mes AAAA)
  const formatMonth = (month: string) => {
    if (month === "all") return "Todos los Meses";
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleString("es-ES", { month: "long", year: "numeric" });
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
                Proveedor
              </label>
              <select
                {...register("supplier_id", { required: true })}
                className="mt-1 w-full border rounded-md px-3 py-2"
              >
                <option value="" disabled>
                  Seleccione un proveedor
                </option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Producto
              </label>
              <select
                {...register("product_id", { required: true })}
                className="mt-1 w-full border rounded-md px-3 py-2"
              >
                <option value="" disabled>
                  Seleccione un producto
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
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
                  {...register("price_unit", { required: true })}
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
                  quantity && price_unit
                    ? (Number(quantity) * Number(price_unit)).toFixed(2)
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={20} />
              Nueva Orden de Compra
            </button>
            {/* Campo de búsqueda */}
            <input
              type="text"
              placeholder="Buscar órdenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-4 sm:mt-0 w-full sm:w-64 border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtros de Estado y Mes */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {/* Select de Estado */}
            <div className="w-full sm:w-1/2">
              <label htmlFor="statusFilter" className="sr-only">
                Filtrar por Estado
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "all"
                      | "pending"
                      | "approved"
                      | "completed"
                  )
                }
                className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobada</option>
                <option value="completed">Completada</option>
              </select>
            </div>

            {/* Select de Mes */}
            <div className="w-full sm:w-1/2">
              <label htmlFor="monthFilter" className="sr-only">
                Filtrar por Mes
              </label>
              <select
                id="monthFilter"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {formatMonth(month)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      PRODUCTO
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      CANTIDAD
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
                      Pagado
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Restante
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8} // Changed colspan to 8
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No se encontraron órdenes de compra.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        {/* PRODUCTO */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.items
                            .map((item) => item.product_name)
                            .join(", ")}
                        </td>

                        {/* CANTIDAD */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.items.reduce(
                            (acc, item) => acc + item.quantity,
                            0
                          )}
                        </td>

                        {/* FECHA */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>

                        {/* ESTADO */}
                        <td className="px-6 py-4 whitespace-nowrap capitalize">
                          {order.status}
                        </td>

                        {/* TOTAL */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(order.total_amount ?? 0).toFixed(2)}
                        </td>

                        {/* PAGADO */}
                        <td className="px-6 py-4 whitespace-nowrap text-green-700 font-medium">
                          {(order.amount_paid ?? 0).toFixed(2)}
                        </td>

                        {/* RESTANTE */}
                        <td className="px-6 py-4 whitespace-nowrap text-red-700 font-medium">
                          {((order.total_amount ?? 0) - (order.amount_paid ?? 0)).toFixed(2)}
                        </td>

                        {/* ACCIONES */}
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          <button
                            onClick={() => handleInstallmentClick(order)}
                            title="Registrar Pago"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 hover:text-green-800">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.799.183 1.61.276 2.414.276h1.125m-2.25-10.5H12.75m-3 0h.008v.008H9.75ZM21.75 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 10.5V15m-3-4.5h6" />
                            </svg>
                          </button>
                          <button onClick={() => handleEdit(order.id)} title="Editar Orden">
                            <Pencil
                              size={18}
                              className="text-blue-600 hover:text-blue-800"
                            />
                          </button>
                          <button onClick={() => handleDeleteClick(order.id)} title="Eliminar Orden">
                            <Trash2
                              size={18}
                              className="text-red-600 hover:text-red-800"
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cartas en móviles */}
          <div className="block md:hidden space-y-4">
            {filteredAndSortedOrders.length === 0 ? (
              <p className="text-center text-gray-500">
                No se encontraron órdenes de compra.
              </p>
            ) : (
              filteredAndSortedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 break-words">
                      Productos:
                    </h3>
                    <ul className="text-sm text-gray-600">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.product_name} - Cantidad: {item.quantity}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-600">
                      <strong>Fecha:</strong>{" "}
                      {new Date(order.order_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      <strong>Estado:</strong> {order.status}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Total:</strong>{" "}
                      {(order.total_amount ?? 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-green-700 font-medium">
                      <strong>Pagado:</strong>{" "}
                      {(order.amount_paid ?? 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-red-700 font-medium">
                      <strong>Restante:</strong>{" "}
                      {((order.total_amount ?? 0) - (order.amount_paid ?? 0)).toFixed(2)}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => handleInstallmentClick(order)}
                        title="Registrar Pago"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600 hover:text-green-800">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.799.183 1.61.276 2.414.276h1.125m-2.25-10.5H12.75m-3 0h.008v.008H9.75ZM21.75 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 10.5V15m-3-4.5h6" />
                        </svg>
                      </button>
                      <button onClick={() => handleEdit(order.id)} title="Editar Orden">
                        <Pencil
                          size={20}
                          className="text-blue-600 hover:text-blue-800"
                        />
                      </button>
                      <button onClick={() => handleDeleteClick(order.id)} title="Eliminar Orden">
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

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Confirmar Eliminación de Orden
            </h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar esta orden de compra y todos
              sus ítems asociados? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setOrderToDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Eliminar Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PAGOS EN CUOTAS Y ACTUALIZACIÓN DE PRECIO */}
      {showInstallmentModal && selectedOrderForInstallment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Gestión de Pagos y Precio Final
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Total de la Orden:{" "}
                  <span className="font-semibold text-blue-600">
                    ${selectedOrderForInstallment.total_amount.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm font-medium text-gray-700">
                  Cantidad Pagada:{" "}
                  <span className="font-semibold text-green-600">
                    ${selectedOrderForInstallment.amount_paid.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm font-medium text-gray-700">
                  Cantidad Restante:{" "}
                  <span className="font-semibold text-red-600">
                    $
                    {(
                      selectedOrderForInstallment.total_amount -
                      selectedOrderForInstallment.amount_paid
                    ).toFixed(2)}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Registrar Cuota
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentPayment}
                  onChange={(e) => setCurrentPayment(Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  placeholder="Monto de la cuota"
                />
                <button
                  onClick={handleRecordInstallment}
                  className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Registrar Cuota
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Actualizar Precio Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newTotalAmount}
                  onChange={(e) => setNewTotalAmount(Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  placeholder="Nuevo precio total"
                />
                <button
                  onClick={handleUpdateTotalAmount}
                  className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Actualizar Precio Total
                </button>
              </div>

              {/* Historial de Pagos */}
              <div className="mt-6 border-t pt-4">
                <h4 className="text-md font-semibold mb-3">Historial de Pagos</h4>
                {paymentHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay pagos registrados para esta orden.</p>
                ) : (
                  <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {paymentHistory.map((payment) => (
                      <li key={payment.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-md">
                        <span className="font-medium text-gray-800">
                          ${payment.payment_amount.toFixed(2)}
                        </span>
                        <span className="text-gray-600 text-xs">
                          {new Date(payment.payment_date).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInstallmentModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};