
import React from 'react';
import { type Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.176 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.25 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
      {halfStar && (
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.176 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.25 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
          <path d="M10 3.25v13.5l-4.25-3.08-1.5 4.63 5.75-4.18V3.25z" fill="#374151" />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
         <svg key={`empty-${i}`} className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.176 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.25 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
    </div>
  );
};


const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 w-64 shadow-md flex-shrink-0">
      <div className="relative">
        <img
          src={`https://picsum.photos/seed/${product.id}/250/150`}
          alt={product.name}
          className="rounded-md w-full h-32 object-cover"
        />
        <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${product.in_stock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {product.in_stock ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
        <p className="text-xs text-gray-400 capitalize">{product.category}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-base font-bold text-teal-400">${product.price.toFixed(2)}</p>
          <div className="flex items-center">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-400 ml-1">({product.rating})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
