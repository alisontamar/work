import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Store, Employee, Product } from "../types";
import AlertDelete from "./ModalDelete";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { format } from "date-fns";

interface TransferProps {
  products: Product[];
  stores: Store[];
  employees: Employee[];
}

export const TransferComponent: React.FC<TransferProps> = ({
  products,
  stores,
  employees,
}) => {
  const { register, watch } = useForm();

  const fromStore = watch("from_store_id");
  const toStore = watch("to_store_id");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  interface Product {
    product_id: string;
    product_name: string;
  }

  interface Transfer {
    transfer_id: string;
    transfer_date: string; // ISO 8601 format
    store_origin: string;
    store_destiny: string;
    employee_name: string;
    products: Product[];
  }
  const filteredProducts = searchTerm
    ? products.filter((product) => {
        const code1 = String(product.mei_code1).toLowerCase();
        const code2 = String(product.mei_code2).toLowerCase();
        const name = product.name.toLowerCase();
        const term = searchTerm.toLowerCase();
        return (
          code1.includes(term) || code2.includes(term) || name.includes(term)
        );
      })
    : [];

  const handleProductSelect = (product: Product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      const updatedProducts = [...selectedProducts, product];
      setSelectedProducts(updatedProducts);
    }
    setSearchTerm("");
  };

  const [isOpen, setIsOpen] = useState(false);
  const [productIdDelete, setProductIdDelete] = useState<string>();

  const handleDelete = (productID: string) => {
    setIsOpen(true);
    setProductIdDelete(productID);
  };
  const removeProduct = (productID: string) => {
    const updatedProducts = selectedProducts.filter(
      (product) => product.id !== productID
    );
    setSelectedProducts(updatedProducts);
    setProductIdDelete(undefined);
    setIsOpen(false);
    setSearchTerm("");
  };

  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const handleTransferSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (fromStore === toStore) {
      return toast.error("La tienda de transferencia no puede ser la misma", {
        duration: 3000,
        position: "top-right",
      });
    }
    const newTransfer = {
      product_ids: selectedProducts.map((product) => product.id),
      from_store: fromStore,
      to_store: toStore,
    };
    if (
      newTransfer.product_ids.length === 0 ||
      !newTransfer.from_store ||
      !newTransfer.to_store
    ) {
      return toast.error("Debe seleccionar al menos un producto", {
        duration: 3000,
        position: "top-right",
      });
    }
    // TODO: Falta obtener la sesión del empleado
    setSelectedProducts([]);
    const { data, error } = await supabase.rpc("insert_transfer", {
      e_id: "5fa3487c-e2f6-4730-8b49-6d81e10b8f28",
      s_o_id: newTransfer.from_store,
      s_d_id: newTransfer.to_store,
      p_ids: newTransfer.product_ids,
    });
    if (error) {
      console.error("Error al registrar la transferencia:", error.message);
      return toast.error("Error al registrar la transferencia", {
        duration: 3000,
        position: "top-right",
      });
    }
    return toast.success(data, {
      duration: 3000,
      position: "top-right",
    });
  };
  const searchRef = useRef<HTMLInputElement>(null);
  const handleScanner = () => {
    if (searchRef.current) {
      searchRef.current.focus();
      toast.success("Puede escanear el código", {
        duration: 3000,
        position: "top-right",
      });
      //WARNING: Revisar el tiempo de espera
      setTimeout(() => setSearchTerm(""), 5000);
    }
  };

  const [offset, setOffset] = useState(0);
  const [limitItems, _] = useState(5);
  const [hasMore, setHasMore] = useState(true);

  const get_transfers_paginated = async (limit: number, offset: number = 0) => {
    const { data: transfersData, error } = await supabase.rpc(
      "select_transfer_paginated",
      {
        limit_count: limit,
        offset_count: offset,
      }
    );
    if (error) {
      return toast.error("Error al obtener las transferencias", {
        duration: 3000,
        position: "top-right",
      });
    }
    return transfersData;
  };

  useEffect(() => {
    get_transfers_paginated(limitItems, offset).then((data: Transfer[]) => {
      if (data) {
        setTransfers(data);
        setHasMore(data?.length === limitItems);
      }
    });
  }, [offset]);

  return (
    <>
      <Toaster />
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Nueva Transferencia</h2>
        <form onSubmit={handleTransferSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="search"
                  ref={searchRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por código MEI o nombre del producto..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleScanner}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                >
                  Escanear Código
                </button>
              </div>
              {searchTerm && filteredProducts.length > 0 && (
                <div className="w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-4"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          MEI: {product.mei_code1} / {product.mei_code2}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedProducts.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">
                    Productos Seleccionados
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {selectedProducts.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <span>{product.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <AlertDelete
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              removeProduct={() => removeProduct(productIdDelete!)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Desde Tienda
              </label>
              <select
                {...register("from_store_id", {
                  required: "Debe seleccionar una tienda",
                })}
                className="mt-1 block w-full p-2 border cursor-pointer rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Seleccionar tienda
                </option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hacia Tienda
              </label>
              <select
                {...register("to_store_id", {
                  required: "Debe seleccionar una tienda",
                  validate: (value) =>
                    value !== fromStore || "Las tiendas deben ser diferentes",
                })}
                className="mt-1 block w-full p-2 border cursor-pointer rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Seleccionar tienda
                </option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Registrar Transferencia
            </button>
          </div>
        </form>
      </section>
      <section className="bg-white rounded-lg shadow overflow-hidden hidden sm:block my-8 p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Historial de Transferencias</h2>
          <div>
            <span>Mostrando {transfers?.length} transferencias</span>
            <div className="flex items-center gap-4 justify-center mt-4">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(offset - limitItems)}
                className={`p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors ${
                  offset === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <ArrowLeftIcon size={20} />
              </button>
              <button
                disabled={!hasMore}
                onClick={() => setOffset(offset + limitItems)}
                className={`
                  p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors
                  ${
                    !hasMore
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                  `}
              >
                <ArrowRightIcon size={20} />
              </button>
            </div>
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Desde Tienda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hacia Tienda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transfers?.map((transfer) => (
                <tr key={transfer.transfer_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(transfer.transfer_date), "dd/MM/yy HH:MM")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ul className="list-disc pl-4">
                      {transfer.products.map((p) => (
                        <li key={p.product_id}>{p.product_name}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transfer.store_origin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transfer.store_destiny}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transfer.employee_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};
