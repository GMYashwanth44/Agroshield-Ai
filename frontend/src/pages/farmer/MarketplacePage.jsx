import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Search, Filter, Star, ShieldCheck, Truck, Store,
  ShoppingCart, ArrowRight, Check, AlertTriangle, Layers
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';
import ProductCompareModal from '../../components/marketplace/ProductCompareModal';

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: '🌾' },
  { id: 'seeds', label: 'Certified Seeds', icon: '🌱' },
  { id: 'fertilizer', label: 'Fertilizers', icon: '🧪' },
  { id: 'crop_protection', label: 'Crop Protection', icon: '🌿' },
  { id: 'equipment', label: 'Farming Equipment', icon: '🚜' },
  { id: 'irrigation', label: 'Irrigation', icon: '💧' },
  { id: 'tools', label: 'Farming Tools', icon: '🧤' }
];

export const MarketplacePage = ({ onAddToCart, onOpenCart }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [compareList, setCompareList] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({ category: selectedCat, search: searchQuery });
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCat]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const toggleCompare = (prod) => {
    if (compareList.find(p => p.id === prod.id)) {
      setCompareList(compareList.filter(p => p.id !== prod.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare up to 3 products at a time.');
        return;
      }
      setCompareList([...compareList, prod]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
              Kisan Agri Marketplace
            </span>
            <span className="text-xs text-slate-400">Direct from Verified Krishi Kendras</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {t('marketplace', 'Certified Agriculture Marketplace & Inputs')}
          </h1>
          <p className="text-xs text-slate-500">
            Certified seeds, bio-fertilizers, CIBRC approved crop-protection, sprayers & tools with farm delivery or local APMC pickup.
          </p>
        </div>

        {/* Compare Floating Button if Items Selected */}
        {compareList.length > 0 && (
          <button
            onClick={() => setCompareModalOpen(true)}
            className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-2 animate-bounce"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Compare Selected ({compareList.length})</span>
          </button>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCat === cat.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t('search_products', 'Search seeds, bio-fungicides, sprayers, fertilizers...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 rounded-2xl transition"
        >
          Search
        </button>
      </form>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs animate-pulse">
          Loading agricultural catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No products found</p>
          <p className="text-xs text-slate-500">Try changing your category filter or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((prod) => {
            const isCompared = compareList.some(p => p.id === prod.id);

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={prod.image_url}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-bold bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-slate-800 shadow-xs">
                    {prod.brand}
                  </span>
                  <button
                    onClick={() => toggleCompare(prod)}
                    className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs transition ${
                      isCompared
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    {isCompared ? '✓ Comparing' : '+ Compare'}
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {prod.seller_name}
                      </span>
                      <span className="flex items-center gap-0.5 font-bold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {prod.rating}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {prod.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {prod.description}
                    </p>
                  </div>

                  {/* Safety Notice for Chemicals */}
                  {prod.safety_label && (
                    <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-[10px] text-amber-900 line-clamp-1">
                      ⚠️ {prod.safety_label}
                    </div>
                  )}

                  {/* Pricing & Add to Cart */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-emerald-700">
                        Rs {prod.price}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1">
                        / {prod.unit}
                      </span>
                    </div>

                    <button
                      onClick={() => onAddToCart(prod)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{t('add_to_cart', 'Add to Cart')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Modal */}
      <ProductCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        products={compareList}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default MarketplacePage;
