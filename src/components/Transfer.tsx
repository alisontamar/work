import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Webcam from 'react-webcam';
import { Transfer, Product, Store, Employee } from '../types';

interface TransferProps {
  products: Product[];
  stores: Store[];
  employees: Employee[];
  onSubmit: (transfer: Partial<Transfer>) => void;
}

export const TransferComponent: React.FC<TransferProps> = ({
  products,
  stores,
  onSubmit,
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const webcamRef = React.useRef<Webcam>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  const handleScan = () => {
    setShowScanner(true);
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      // Here you would process the image to get the MEI code
      // For now, we'll just simulate it with a random code
      const simulatedCode = Math.random().toString(36).substring(7).toUpperCase();
      const product = products.find(p => p.mei_code1 === simulatedCode || p.mei_code2 === simulatedCode);
      if (product) {
        setValue('product_id', product.id);
      }
      setShowScanner(false);
    }
  };

  const selectedProduct = products.find(p => p.id === watch('product_id'));
  const fromStore = watch('from_store_id');
  const toStore = watch('to_store_id');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Nueva Transferencia</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Producto (Código de Barras)
              </label>
              <button
                type="button"
                onClick={handleScan}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                Escanear Código
              </button>
            </div>
            <select
              {...register('product_id', { required: 'Debe seleccionar un producto' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccionar producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - MEI: {product.mei_code1}
                </option>
              ))}
            </select>
            {errors.product_id && (
              <p className="mt-1 text-sm text-red-600">{errors.product_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Desde Tienda</label>
            <select
              {...register('from_store_id', { required: 'Debe seleccionar una tienda' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccionar tienda</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            {errors.from_store_id && (
              <p className="mt-1 text-sm text-red-600">{errors.from_store_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hacia Tienda</label>
            <select
              {...register('to_store_id', {
                required: 'Debe seleccionar una tienda',
                validate: value => value !== fromStore || 'Las tiendas deben ser diferentes'
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccionar tienda</option>
              {stores.map(store => (
                <option key={store.id} value={store.id} disabled={store.id === fromStore}>
                  {store.name}
                </option>
              ))}
            </select>
            {errors.to_store_id && (
              <p className="mt-1 text-sm text-red-600">{errors.to_store_id.message}</p>
            )}
          </div>


          {selectedProduct && (
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detalles del producto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Producto</p>
                    <p className="text-lg font-medium">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock actual</p>
                    <p className="text-lg font-medium">{selectedProduct.stock_quantity} unidades</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                  onClick={() => setShowScanner(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Registrar Transferencia
          </button>
        </div>
      </form>
    </div>
  );
};