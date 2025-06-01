import React from 'react';
import { Product, Store } from '../types';

interface StoreProductsProps {
  store: Store;
  products: Product[];
}

export const StoreProducts: React.FC<StoreProductsProps> = ({ store, products }) => {
  const storeProducts = products.filter(product => product.store_id === store.id);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Productos en {store.name}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {storeProducts.map(product => (
          <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="aspect-w-1 aspect-h-1 mb-4">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <h4 className="font-medium text-gray-900">{product.name}</h4>
            <p className="text-sm text-gray-500">Color: {product.color}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
            <p className="mt-2 text-lg font-semibold text-blue-600">
              Bs. {(product.cost_price * 6.96 + product.profit_bob).toFixed(2)}
            </p>
          </div>
        ))}
        {storeProducts.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-4">
            No hay productos asignados a esta tienda
          </p>
        )}
      </div>
    </div>
  );
};