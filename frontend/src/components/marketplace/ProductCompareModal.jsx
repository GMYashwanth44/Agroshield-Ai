import React from 'react';
import { X, Check, ShoppingCart, ShieldCheck } from 'lucide-react';

export const ProductCompareModal = ({ isOpen, onClose, products = [], onAddToCart }) => {
  if (!isOpen || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Side-by-Side Product Comparison</h3>
            <p className="text-xs text-slate-500">Compare specifications, prices, active ingredients, and safety labels</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 font-semibold text-slate-600 w-1/4">Feature</th>
                {products.map((p) => (
                  <th key={p.id} className="p-3 font-bold text-slate-900 text-center w-1/3">
                    <img src={p.image_url} alt={p.title} className="w-20 h-20 object-cover rounded-xl mx-auto mb-2" />
                    <span className="block text-xs line-clamp-2">{p.title}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              <tr>
                <td className="p-3 font-semibold text-slate-600">Price & Unit</td>
                {products.map(p => (
                  <td key={p.id} className="p-3 text-center font-bold text-emerald-700 text-sm">
                    Rs {p.price} <span className="text-[11px] font-normal text-slate-500">/ {p.unit}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600">Brand / Maker</td>
                {products.map(p => (
                  <td key={p.id} className="p-3 text-center font-medium text-slate-800">{p.brand}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600">Verified Seller</td>
                {products.map(p => (
                  <td key={p.id} className="p-3 text-center text-slate-700">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {p.seller_name || 'Kisan Seva Krishi Hub'}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600">Rating & Reviews</td>
                {products.map(p => (
                  <td key={p.id} className="p-3 text-center text-amber-600 font-bold">
                    ★ {p.rating} <span className="text-[10px] text-slate-400 font-normal">(Verified)</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600">Target Diseases</td>
                {products.map(p => (
                  <td key={p.id} className="p-3 text-center text-slate-700">{p.target_diseases || 'General Vigor'}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600">Safety & Label Guide</td>
                {products.map(p => (
                  <td key={p.id} className="p-3 text-slate-600 text-[11px] bg-slate-50 rounded-lg">
                    {p.safety_label}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600">Action</td>
                {products.map(p => (
                  <td key={p.id} className="p-3 text-center">
                    <button
                      onClick={() => { onAddToCart(p); onClose(); }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductCompareModal;
