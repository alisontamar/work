import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AlertDelete from "./ModalDelete";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

interface Product {
  id_producto: string;
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

interface SalesProps {
  exchangeRate: number;
}

interface SaleComplete {
  sale_id: string;
  date: string;
  details: Array<Record<string, string>>;
  total_sale: number;
  seller_first_name: string;
  seller_last_name: string;
}

// const products: Product[] = [
//   {
//     id_producto: "fb3c0fd3-0a82-47cf-b0f1-c09817439f09",
//     nombre_producto: "Laptop Lenovo ThinkPad",
//     color_prodcuto: "Negro",
//     precio_dolar: 1,
//     granancia_boliviano: 10,
//     stock_producto: 10,
//     fecha_hora_creacion_producto: new Date().toISOString(),
//     imagen_producto: "https://images.pexels.com/photos/18105/pexels-photo.jpg",
//     codigo_MEI1: "MEI123456",
//     codigo_MEI2: "MEI789012",
//     id_empleado: 1,
//   },
//   {
//     id_producto: "2546593a-5301-41d4-9a1f-2f99d441948e",
//     nombre_producto: "iPhone 13 Pro",
//     color_prodcuto: "Azul",
//     precio_dolar: 1,
//     granancia_boliviano: 10,
//     stock_producto: 15,
//     fecha_hora_creacion_producto: new Date().toISOString(),
//     imagen_producto:
//       "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg",
//     codigo_MEI1: "MEI345678",
//     codigo_MEI2: "MEI901234",
//     id_empleado: 1,
//   },
// ];

export const Sales: React.FC<SalesProps> = ({ exchangeRate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const get_products = async (barcode: string) => {
    const { data: infoProducts, error } = await supabase
      .from("products")
      .select("id, name, cost_price, stock_quantity, image, color")
      .eq("barcode", barcode);

    if (error) {
      toast.error("Error al obtener los productos", {
        duration: 3000,
        position: "top-right",
      });
      return [];
    }
    return infoProducts;
  };
  // const filteredProducts = searchTerm
  //   ? products.filter(
  //       (product) =>
  //         product.codigo_MEI1
  //           .toLowerCase()
  //           .includes(searchTerm.toLowerCase()) ||
  //         product.codigo_MEI2
  //           .toLowerCase()
  //           .includes(searchTerm.toLowerCase()) ||
  //         product.nombre_producto
  //           .toLowerCase()
  //           .includes(searchTerm.toLowerCase())
  //     )
  //   : [];

  const [totalSale, setTotalSale] = useState<number>(0); // total de la venta

  const calculateTotal = (products: Product[]) => {
    const total = products.reduce(
      (total, product) =>
        total +
        (product.precio_dolar * exchangeRate + product.granancia_boliviano),
      0
    );
    setTotalSale(total);
  };
  // Revisar el tipo de dato de los productos
  const handleProductSelect = (product: any) => {
    if (!selectedProducts.find((p) => p.id_producto === product.id_producto)) {
      const updatedProducts = [...selectedProducts, product];
      setSelectedProducts(
        updatedProducts.map((p) => ({
          ...p,
          id_producto: p.id_producto.toString(),
        }))
      ); // <-- Agregar id_producto
      calculateTotal(updatedProducts);
    }
    setSearchTerm("");
  };

  const removeProduct = (productId: string) => {
    const updated = selectedProducts.filter((p) => p.id_producto !== productId);
    setSelectedProducts(updated);
    calculateTotal(updated);
  };

  const [productsSale, setProductsSale] = useState<SaleComplete[]>([]);
  const handleSaleSubmit = async () => {
    const { data: message, error } = await supabase.rpc(
      "insert_sale_original",
      {
        p_type_of_payment: "cash",
        p_quantity_products: selectedProducts.length,
        p_total_sale: totalSale,
        p_employee_id: "5fa3487c-e2f6-4730-8b49-6d81e10b8f28",
        p_product_ids: selectedProducts.map((p) => p.id_producto),
      }
    );
    if (error) {
      return toast.error("Error al registrar la venta", {
        duration: 3000,
        position: "top-right",
      });
    }

    toast.success(message, {
      duration: 3000,
      position: "top-right",
    });
    setSelectedProducts([]);
    setTotalSale(0);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [productIdDelete, setProductIdDelete] = useState<string>();
  const searchRef = React.useRef<HTMLInputElement>(null);

  const handleDelete = (productID: string) => {
    setIsOpen(true);
    setProductIdDelete(productID);
  };

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
  
  useEffect(() => {
    if (searchTerm !== "") {
      const scannedProduct = get_products(searchTerm);

      scannedProduct.then((data) => {
        if (data && data.length > 0) {
          const productSelected = data[0];
          const { id, name, color, cost_price, stock_quantity, image } =
            productSelected;
          handleProductSelect({
            id_producto: id,
            nombre_producto: name,
            color_prodcuto: color,
            precio_dolar: cost_price,
            granancia_boliviano: stock_quantity,
            stock_producto: stock_quantity,
            imagen_producto: image
          });
        } else {
          toast.error("Producto no encontrado", {
            duration: 3000,
            position: "top-right",
          });
        }
      });
    }
  }, [searchTerm]);

  const [offset, setOffset] = useState(0);
  const [limitItems, _] = useState(5);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const get_sales_paginated = async (limit: number, offset: number = 0) => {
      const { data: infoSales, error } = await supabase.rpc(
        "get_sales_paginated",
        {
          limit_count: limit,
          offset_count: offset,
        }
      );

      if (error) {
        return toast.error("Error al obtener las ventas", {
          duration: 3000,
          position: "top-right",
        });
      }

      return infoSales;
    };

    get_sales_paginated(limitItems, offset).then((data) => {
      if (data) {
        setProductsSale(data);
        setHasMore(data?.length === limitItems);
      }
    });
  }, [offset]);

  return (
    <>
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Nueva Venta</h2>
        <Toaster />
        <div className="space-y-6">
          <div className="relative">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="search"
                value={searchTerm}
                ref={searchRef}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código de barras"
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
            {searchTerm && selectedProducts.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {selectedProducts.map((product) => (
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
                        Código de Barras {product.codigo_MEI1}
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
              <div className="d-flex justify-end">
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
      <section className="bg-white rounded-lg shadow overflow-hidden sm:block my-8 p-6">
        <header className="flex justify-between items-center mb-6 ">
          <h2 className="text-xl font-semibold">Historial de Ventas</h2>
          <div>
            <span>Mostrando {productsSale?.length} transferencias</span>
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
                  Precio de Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {}
              {productsSale?.map((sale) => (
                <tr key={sale?.sale_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(sale?.date), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ul className="list-disc pl-4">
                      {sale.details.map((p) => (
                        <li key={p?.product_id}>{p?.name_product}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Bs. {sale?.total_sale.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sale?.seller_first_name + " " + sale?.seller_last_name}
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
