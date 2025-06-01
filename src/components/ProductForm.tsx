import React, { useState, useEffect} from "react";
import { useForm } from "react-hook-form";
import Webcam from "react-webcam";
import { Product, Store } from "../types";
import { supabase } from "../lib/supabase";

interface ProductFormProps {
  onSubmit: (data: Partial<Product>) => void;
  product?: Product;
  stores: Store[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  product,
  stores,
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const [scanningField, setScanningField] = useState<
    "mei_code1" | "mei_code2" | "barcode" | null
  >(null);
  const [storeList, setStoreList] = useState<Store[]>([]); // State para las tiendas

const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const webcamRef = React.useRef<Webcam>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: product || {},
  });
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("*");

        if (error) throw error;

        setStoreList(data); // Guardamos las tiendas en el estado
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores(); // Cargar las tiendas cuando el componente se monta
  }, []);

  const handleScan = (field: "mei_code1" | "mei_code2" | "barcode") => {
    setScanningField(field);
    setShowScanner(true);
  };

  const handleCapture = () => {
    if (webcamRef.current && scanningField) {
      const simulatedCode = Math.random()
        .toString(36)
        .substring(7)
        .toUpperCase();
      setValue(scanningField, simulatedCode);
      setShowScanner(false);
      setScanningField(null);
    }
  };

const handleProductSubmit = async (data: Partial<Product>) => {
  try {
    let imageUrl = product?.image || null;

    // 1. Subir imagen primero si existe
    if (selectedImage) {
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Subir la imagen con opciones explícitas
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('product-images')
        .upload(filePath, selectedImage, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedImage.type
        });

      if (uploadError) {
        console.error('Error subiendo imagen:', uploadError);
        throw new Error(`Error al subir imagen: ${uploadError.message}`);
      }

      // Obtener URL pública directamente (más eficiente)
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
      console.log('Imagen subida correctamente:', imageUrl);
    }

    // 2. Preparar datos para la base de datos
    const productData = {
      ...data,
      image: imageUrl,
      created_at: product?.created_at || new Date().toISOString()
    };

    console.log('Datos a guardar:', productData);

    // 3. Guardar en la base de datos
    let dbOperation;
    if (product) {
      dbOperation = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .select();
    } else {
      dbOperation = await supabase
        .from('products')
        .insert([productData])
        .select();
    }

    if (dbOperation.error) {
      console.error('Error en operación DB:', dbOperation.error);
      throw dbOperation.error;
    }

    console.log('Producto guardado:', dbOperation.data);
    onSubmit(productData);
    
  } catch (error) {
    console.error('Error completo:', error);
    alert(`Error al guardar: ${error.message}`);
  }
};

  return (
    <form onSubmit={handleSubmit(handleProductSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Código de Barras
            </h3>
            <button
              type="button"
              onClick={() => handleScan("barcode")}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Escanear Código de Barras
            </button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <h3 className="text-lg font-medium text-gray-900">Códigos MEI</h3>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => handleScan("mei_code1")}
                className="px-1 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                Escanear MEI 1
              </button>
              <button
                type="button"
                onClick={() => handleScan("mei_code2")}
                className="px-1 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                Escanear MEI 2
              </button>
            </div>
          </div>

          {showScanner && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full max-w-md"
                />
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Capturar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScanner(false);
                      setScanningField(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <input
                type="text"
                {...register("mei_code1")}
                placeholder="Código MEI 1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.mei_code1 && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.mei_code1.message}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                {...register("mei_code2")}
                placeholder="Código MEI 2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.mei_code2 && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.mei_code2.message}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                {...register("barcode",{ required: "Este campo es requerido" })}
                placeholder="Código de Barras"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.barcode && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.barcode.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre del Producto
          </label>
          <input
            type="text"
            {...register("name", { required: "Este campo es requerido" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
<div>
  <label className="block text-sm font-medium text-gray-700">
    Imagen del Producto
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />
</div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <input
            type="text"
            {...register("color", { required: "Este campo es requerido" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.color && (
            <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
          )}
        </div>

<div>
  <label className="block text-sm font-medium text-gray-700">RAM (GB)</label>
  <input
    type="number"
    {...register("ram", {
      required: "Este campo es requerido",
      min: { value: 0, message: "Debe ser mayor o igual a 0" },
    })}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />
  {errors.ram && (
    <p className="mt-1 text-sm text-red-600">{errors.ram.message}</p>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-gray-700">ROM (GB)</label>
  <input
    type="number"
    {...register("rom", {
      required: "Este campo es requerido",
      min: { value: 0, message: "Debe ser mayor o igual a 0" },
    })}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />
  {errors.rom && (
    <p className="mt-1 text-sm text-red-600">{errors.rom.message}</p>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-gray-700">Procesador</label>
  <input
    type="text"
    {...register("processor", {
      required: "Este campo es requerido",
      maxLength: {
        value: 100,
        message: "Máximo 100 caracteres",
      },
    })}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />
  {errors.processor && (
    <p className="mt-1 text-sm text-red-600">{errors.processor.message}</p>
  )}
</div>


        <div>
          <label className="block text-sm font-medium text-gray-700">
            Precio (USD)
          </label>
          <input
            type="number"
            step="0.01"
            {...register("cost_price", {
              required: "Este campo es requerido",
              min: { value: 0, message: "El precio debe ser mayor a 0" },
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.cost_price && (
            <p className="mt-1 text-sm text-red-600">
              {errors.cost_price.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ganancia (BOB)
          </label>
          <input
            type="number"
            step="0.01"
            {...register("profit_bob", {
              required: "Este campo es requerido",
              min: {
                value: 0,
                message: "La ganancia debe ser mayor o igual a 0",
              },
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.profit_bob && (
            <p className="mt-1 text-sm text-red-600">
              {errors.profit_bob.message}
            </p>
          )}
        </div>
          <div>
  <label className="block text-sm font-medium text-gray-700">
    Cantidad de producto
  </label>
  <input
    type="number"
    {...register("stock_quantity", {
      required: "Este campo es requerido",
      min: { value: 0, message: "El stock no puede ser negativo" },
    })}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />
  {errors.stock_quantity && (
    <p className="mt-1 text-sm text-red-600">{errors.stock_quantity.message}</p>
  )}
</div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tienda
          </label>
          <select
            {...register("store_id", { required: "Este campo es requerido" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Seleccionar tienda</option>
            {(storeList.length > 0 ? storeList : stores).map((store) => (
  <option key={store.id} value={store.id}>
    {store.name}
  </option>
))}

          </select>{" "}
          {errors.store_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.store_id.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {product ? "Actualizar Producto" : "Crear Producto"}
        </button>
      </div>
    </form>
  );
};
