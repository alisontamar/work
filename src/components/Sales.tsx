import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Webcam from 'react-webcam';
import { Sale, Product, Store, Employee } from '../types';

interface SalesProps {
  products: Product[];
  stores: Store[];
  employees: Employee[];
  onSubmit: (sale: Partial<Sale>) => void;
  exchangeRate: number;
}

export const Sales: React.FC<SalesProps> = ({
  products,
  stores,
  employees,
  onSubmit,
  exchangeRate,
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);
  const webcamRef = React.useRef<Webcam>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  const handleScan = () => {
    setShowScanner(true);
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const simulatedCode = Math.random().toString(36).substring(7).toUpperCase();
      const product = products.find(p => p.mei_code1 === simulatedCode || p.mei_code2 === simulatedCode);
      if (product) {
        setValue('product_id', product.id);
      } else {
        alert('No se encontró un producto con el código escaneado.');
      }
      setShowScanner(false);
    }
  };

  const addProduct = () => {
    const productId = watch('product_id');
    const quantity = watch('quantity');
    const product = products.find(p => p.id === productId);

    if (product && quantity > 0) {
      const existingProduct = selectedProducts.find(p => p.id === product.id);
      if (existingProduct) {
        // Si el producto ya existe, solo se suma la cantidad
        existingProduct.quantity += quantity;
      } else {
        // Si el producto no existe, se agrega a la lista
        setSelectedProducts([...selectedProducts, { id: product.id, name: product.name, price: product.price_usd * exchangeRate, quantity }]);
      }
      setValue('quantity', 0); // Reset quantity input
    } else {
      alert('Seleccione un producto y una cantidad válida.');
    }
  };

  const totalPrice = selectedProducts.reduce((total, product) => total + (product.price * product.quantity), 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Nueva Venta</h2>
      
 <form onSubmit={handleSubmit((data) => onSubmit({ ...data, total_price_bob: totalPrice, products: selectedProducts }))} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Producto (Código de Barras)</label>
              <button type="button" onClick={handleScan} className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200">Escanear Código</button>
            </div>
            <select {...register('product_id', { required: 'Debe seleccionar un producto' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">Seleccionar producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name} - MEI: {product.mei_code1}</option>
              ))}
            </select>
            {errors.product_id && <p className="mt-1 text-sm text-red-600">{errors.product_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cantidad</label>
            <input type="number" min="1" {...register('quantity', { required: 'La cantidad es requerida', min: { value: 1, message: 'La cantidad debe ser mayor a 0' } })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
          </div>

          <div className="md:col-span-2">
            <button type="button" onClick={addProduct} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Agregar Producto</button>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Productos Seleccionados</h3>
            <ul className="list-disc pl-5">
              {selectedProducts.map((product, index) => (
                <li key={index} className="flex justify-between">
                  <span>{product.name} - Cantidad: {product.quantity} - Precio: Bs. {product.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <h4 className="font-semibold">Total a Pagar: Bs. {totalPrice.toFixed(2)}</h4>
            </div>
          </div>
        </div>

        {showScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg">
              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full max-w-md" />
              <div className="mt-4 flex justify-end space-x-2">
                <button type="button" onClick={handleCapture} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Capturar</button>
                <button type="button" onClick={() => setShowScanner(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Registrar Venta</button>
        </div>
      </form>
    </div>
  );
};