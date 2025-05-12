import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

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

interface Sale {
  fecha_hora_venta: string;
  total_venta: number;
}

const products: Product[] = [
  {
    id_producto: 1,
    nombre_producto: "Laptop Lenovo ThinkPad",
    color_prodcuto: "Negro",
    precio_dolar: 899.99,
    granancia_boliviano: 500,
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
    precio_dolar: 999.99,
    granancia_boliviano: 700,
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
  onSubmit: (sale: Partial<Sale>) => void;
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

  const handleProductSelect = (product: Product) => {
    if (!selectedProducts.find((p) => p.id_producto === product.id_producto)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setSearchTerm("");
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.id_producto !== productId)
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce(
      (total, product) =>
        total +
        (product.precio_dolar * exchangeRate + product.granancia_boliviano),
      0
    );
  };

  const handleSaleSubmit = () => {
    const totalVenta = calculateTotal();
    onSubmit({
      fecha_hora_venta: new Date().toISOString(),
      total_venta: totalVenta,
    });
    toast.success("¡Venta registrada exitosamente!", {
      duration: 3000,
      position: "top-right",
    });
    setSelectedProducts([]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
                      <h4 className="font-medium">{product.nombre_producto}</h4>
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
                    onClick={() => removeProduct(product.id_producto)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total a pagar:</span>
                <span className="text-xl font-bold text-blue-600">
                  Bs. {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
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
    </div>
  );
};
