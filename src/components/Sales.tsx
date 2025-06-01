import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import AlertDelete from "./ModalDelete";
import { format } from "date-fns";
import { Sale } from "../types";

interface Product {
  id_producto: number;
  nombre_producto: string;
  color_prodcuto: string;
  precio_dolar: number;
  granancia_boliviano: number;
  stock_producto: number;
  fecha_hora_creacion_producto: string;
  imagen_producto: string;
  codigo_MEI1: string;
  codigo_MEI2: string;
  id_empleado: number;
}

const products: Product[] = [
  {
    id_producto: 1,
    nombre_producto: "Laptop Lenovo ThinkPad",
    color_prodcuto: "Negro",
    precio_dolar: 1,
    granancia_boliviano: 10,
    stock_producto: 10,
    fecha_hora_creacion_producto: new Date().toISOString(),
    imagen_producto: "https://images.pexels.com/photos/18105/pexels-photo.jpg",
    codigo_MEI1: "MEI123456",
    codigo_MEI2: "MEI789012",
    id_empleado: 1,
  },
  {
    id_producto: 2,
    nombre_producto: "iPhone 13 Pro",
    color_prodcuto: "Azul",
    precio_dolar: 1,
    granancia_boliviano: 10,
    stock_producto: 15,
    fecha_hora_creacion_producto: new Date().toISOString(),
    imagen_producto:
      "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg",
    codigo_MEI1: "MEI345678",
    codigo_MEI2: "MEI901234",
    id_empleado: 1,
  },
  {
    id_producto: 3,
    nombre_producto: "Samsung Galaxy S21",
    color_prodcuto: "Plata",
    precio_dolar: 799.99,
    granancia_boliviano: 450,
    stock_producto: 20,
    fecha_hora_creacion_producto: new Date().toISOString(),
    imagen_producto:
      "https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg",
    codigo_MEI1: "MEI567890",
    codigo_MEI2: "MEI123456",
    id_empleado: 1,
  },
];

interface SalesProps {
  onSubmit: (sale: Partial<Sale>) => void
  exchangeRate: number;
}

export const Sales: React.FC<SalesProps> = ({ onSubmit, exchangeRate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const { handleSubmit } = useForm();

  const filteredProducts = searchTerm
    ? products.filter(
        (product) =>
          product.codigo_MEI1
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.codigo_MEI2
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.nombre_producto
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  const [totalSale, setTotalSale] = useState<number>(0); // total con descuento
  const [originalTotal, setOriginalTotal] = useState<number>(0); // total sin descuento
  const [discount, setDiscount] = useState<number>(0);

  const calculateTotal = (products: Product[]) => {
    const total = products.reduce(
      (total, product) =>
        total +
        (product.precio_dolar * exchangeRate + product.granancia_boliviano),
      0
    );
    setOriginalTotal(total);
    setTotalSale(total - discount);
  };

  const handleProductSelect = (product: Product) => {
    if (!selectedProducts.find((p) => p.id_producto === product.id_producto)) {
      const updatedProducts = [...selectedProducts, product];
      setSelectedProducts(updatedProducts);
      calculateTotal(updatedProducts);
    }
    setSearchTerm("");
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.id_producto !== productId)
    );
  };
  interface VentaCompleta {
    fecha_hora_venta: string;
    total_venta: number;
    descuento: number;
    productos: Product[];
    vendedor: string; // puedes dejarlo fijo por ahora
  }
  const [productsSale, setProductsSale] = useState<VentaCompleta[]>([]);
  const handleSaleSubmit = () => {
    onSubmit({
      created_at: new Date().toISOString(),
      total_price_bob: totalSale,
    });
    const nuevaVenta = {
      fecha_hora_venta: new Date().toISOString(),
      total_venta: totalSale,
      descuento: discount,
      productos: selectedProducts,
      vendedor: "Empleado #1",
    };
    setProductsSale((prevProductsSale) => [...prevProductsSale, nuevaVenta]);
    toast.success("¡Venta registrada exitosamente!", {
      duration: 3000,
      position: "top-right",
    });
    setSelectedProducts([]);
    setDiscount(0);
    setOriginalTotal(0);
    setTotalSale(0);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [productIdDelete, setProductIdDelete] = useState<number>();
  const handleDelete = (productID: number) => {
    setIsOpen(true);
    setProductIdDelete(productID);
  };
  const handleDiscount = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (isNaN(value) || value <= 0) {
      e.target.value = "";
      return toast.error("El descuento no puede ser negativo", {
        duration: 3000,
        position: "top-right",
      });
    }

    setDiscount(value);

    if (e.target.value === "") {
      setTotalSale(originalTotal);
    }
    if (value > originalTotal) setTotalSale(originalTotal);
    else setTotalSale(originalTotal - value);
  };
  return (
    <>
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Nueva Venta</h2>
        <Toaster />
        <div className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código MEI o nombre del producto..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />

            {searchTerm && filteredProducts.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id_producto}
                    onClick={() => handleProductSelect(product)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-4"
                  >
                    <img
                      src={product.imagen_producto}
                      alt={product.nombre_producto}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{product.nombre_producto}</p>
                      <p className="text-sm text-gray-600">
                        MEI: {product.codigo_MEI1} / {product.codigo_MEI2}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedProducts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">
                Productos Seleccionados
              </h3>
              <div className="space-y-4">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id_producto}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.imagen_producto}
                        alt={product.nombre_producto}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">
                          {product.nombre_producto}
                        </h4>
                        <p className="text-sm text-gray-600">
                          MEI: {product.codigo_MEI1}
                        </p>
                        <p className="text-sm text-gray-600">
                          Precio: Bs.{" "}
                          {(
                            product.precio_dolar * exchangeRate +
                            product.granancia_boliviano
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(product.id_producto)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
              <AlertDelete
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                removeProduct={() => removeProduct(productIdDelete!)}
              />

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total a pagar:</span>
                  <span className="text-xl font-bold text-blue-600">
                    Bs. {totalSale.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <input
                  type="number"
                  placeholder="Descuento"
                  min={10}
                  onInput={handleDiscount}
                  className="py-1 px-2 text-center max-w-28 border-2 boder-black rounded-md"
                />
                <button
                  onClick={handleSaleSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrar Venta
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="bg-white rounded-lg shadow overflow-hidden hidden sm:block my-8 p-6">
        <h2 className="text-xl font-semibold mb-6">Historial de Ventas</h2>
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
                  Precio de Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {}
              {productsSale.map((venta, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(
                      new Date(venta.fecha_hora_venta),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ul className="list-disc pl-4">
                      {venta.productos.map((p) => (
                        <li key={p.id_producto}>{p.nombre_producto}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Bs. {venta.total_venta.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Bs. {venta.descuento.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {venta.vendedor}
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
