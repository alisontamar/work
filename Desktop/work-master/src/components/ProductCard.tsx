import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  exchangeRate: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onToggleActive,
  exchangeRate 
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  // Si el producto no está activo, no renderizar nada
  if (!product.active) {
    return null;
  }

  const finalPrice = (product.cost_price * exchangeRate) + product.profit_bob;

  const getImageUrl = () => {
    if (!product.image) {
      return 'https://placehold.co/400x300?text=No+Image';
    }
    if (product.image.startsWith('http')) {
      return product.image;
    }
    return `${supabase.supabaseUrl}/storage/v1/object/public/product-images/${product.image}`;
  };

  const handleToggleActive = async () => {
    await onToggleActive(product.id, false);
    setShowConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] relative">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={getImageUrl()}
          alt={product.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Image+Error';
          }}
        />
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
          Stock: {product.stock_quantity}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1">Color: {product.color}</p>
        <p className="text-xl font-bold text-blue-600 mt-2">
          Precio final: {Math.round(Number(finalPrice))} Bs
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            aria-label="Editar producto"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            aria-label="Eliminar producto"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Estás seguro de que quieres desactivar este producto?
            </h2>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleToggleActive}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};