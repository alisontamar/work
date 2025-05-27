import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Store, Employee, Product } from "../types";
import AlertDelete from "./ModalDelete";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();


  const fromStore = watch("from_store");
  const toStore = watch("to_store");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

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
  // TODO: Definir el tipo de transferencia
  const [transfers, setTransfers] = useState<any[]>([]);

  const handleTransferSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newTransfer = {
      product_ids: selectedProducts.map((product) => product.id),
      from_store: fromStore,
      to_store: toStore,
      created_at: new Date().toISOString(),
    };
    // TODO: Falta obtener la sesión del empleado
    setTransfers([...transfers, newTransfer]);
    setSelectedProducts([]);
  };
  const searchRef = useRef<HTMLInputElement>(null);
  const handleScanner = () => {
    if (searchRef.current) {
      searchRef.current.focus();
      toast.success("Puede escanear el código", {
        duration: 3000,
        position: "top-right",
      })
      //WARNING: Revisar el tiempo de espera
      setTimeout(() => setSearchTerm(""), 5000);
    }
  }
  return (
    <>
      <Toaster/>
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
                {...register("from_store", {
                  required: "Debe seleccionar una tienda",
                })}
                className="mt-1 block w-full p-2 border cursor-pointer rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Seleccionar tienda
                </option>
                {stores.map((store) => (
                  <option key={store.id} value={store.name}>
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
                {...register("to_store", {
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
                  <option key={store.id} value={store.name}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Registrar Transferencia
            </button>
          </div>
        </form>
      </section>
      <section className="bg-white rounded-lg shadow overflow-hidden hidden sm:block my-8 p-6">
        <h2 className="text-xl font-semibold mb-6">
          Historial de Transferencias
        </h2>
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
              {transfers.map((transfer, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(transfer.created_at), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ul className="list-disc pl-4">
                      {transfer.product_ids.map((p) => (
                        <li key={p}>
                          {products.find((product) => product.id === p)?.name}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transfer.from_store}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transfer.to_store}
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
