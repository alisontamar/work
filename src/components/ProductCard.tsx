import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  exchangeRate: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete,
  exchangeRate 
}) => {
  const finalPrice = (product.cost_price * exchangeRate) + product.profit_bob;
  
  // Manejo de imagen faltante
  const getImageUrl = () => {
    if (!product.image) {
      return 'https://placehold.co/400x300?text=No+Image'; // Imagen placeholder
    }
    
    // Si la URL ya es completa (empieza con http)
    if (product.image.startsWith('http')) {
      return product.image;
    }
    
    // Si es solo el path del bucket, construye la URL completa
    return `${supabase.supabaseUrl}/storage/v1/object/public/product-images/${product.image}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={getImageUrl()}
          alt={product.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback si la imagen no carga
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
        <div className="mt-2">
          <p className="text-xl font-bold text-blue-600">
            Precio final: {Number(finalPrice).toFixed(2)} Bs
          </p>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            aria-label="Editar producto"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Eliminar producto"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};