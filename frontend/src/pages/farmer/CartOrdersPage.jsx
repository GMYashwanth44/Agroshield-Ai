import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Package, Trash2, CheckCircle2, Truck, Store,
  Download, ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';

export const CartOrdersPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' or 'orders'
  const [cart, setCart] = useState({ items: [], total_amount: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' or 'pickup'
  const [shippingAddress, setShippingAddress] = useState('Ramesh Gowda Farm, Srinivaspur, Kolar');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const loadCartAndOrders = async () => {
    setLoading(true);
    try {
      const [cartData, ordersData] = await Promise.all([
        api.getCart(),
        api.getOrders()
      ]);
      setCart(cartData || { items: [], total_amount: 0 });
      setOrders(ordersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartAndOrders();
  }, []);

  const handleRemoveItem = async (itemId) => {
    try {
      await api.removeFromCart(itemId);
      const updated = await api.getCart();
      setCart(updated);
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    setPlacingOrder(true);
    try {
      const res = await api.placeOrder({
        delivery_type: deliveryType,
        shipping_address: shippingAddress,
        pickup_location: 'Kisan Seva Krishi Hub, APMC Yard, Kolar'
      });
      setOrderSuccess(res);
      const [newCart, newOrders] = await Promise.all([api.getCart(), api.getOrders()]);
      setCart(newCart);
      setOrders(newOrders);
      setActiveTab('orders');
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Tab Selector */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'cart'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>My Cart ({cart.items.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Cart & Checkout */}
      {activeTab === 'cart' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="md:col-span-2 space-y-3">
            {cart.items.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Your Cart is Empty</h3>
                <p className="text-xs text-slate-500">
                  Add certified seeds, bio-fungicides, or equipment from the agriculture marketplace.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Cart Products</h3>
                <div className="divide-y divide-slate-100">
                  {cart.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80'}
                          alt={item.title}
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                          <span className="text-[11px] text-slate-500">
                            Qty: {item.quantity} × Rs {item.price}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-900">Rs {item.subtotal}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Panel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 h-fit">
            <h3 className="text-sm font-bold text-slate-900">Order Summary</h3>

            {/* Delivery Method Selector (Prompt Spec) */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700 block">Fulfillment Option:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-3 rounded-2xl border text-center transition ${
                    deliveryType === 'delivery'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Truck className="w-4 h-4 mx-auto mb-1" />
                  <span>🚚 Farm Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-3 rounded-2xl border text-center transition ${
                    deliveryType === 'pickup'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Store className="w-4 h-4 mx-auto mb-1" />
                  <span>🏪 Local Pickup</span>
                </button>
              </div>
            </div>

            {/* Address Input */}
            <div className="text-xs space-y-1">
              <label className="font-semibold text-slate-700 block">
                {deliveryType === 'delivery' ? 'Delivery Address' : 'Pickup Center'}
              </label>
              <input
                type="text"
                value={deliveryType === 'delivery' ? shippingAddress : 'Kisan Seva Krishi Hub, APMC Yard, Kolar'}
                onChange={(e) => setShippingAddress(e.target.value)}
                disabled={deliveryType === 'pickup'}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50"
              />
            </div>

            {/* Price Details */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>Rs {cart.total_amount || 280}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="text-emerald-700 font-bold">FREE (Demo)</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t">
                <span>Total Amount</span>
                <span>Rs {cart.total_amount || 280}</span>
              </div>
            </div>

            {/* Demo Payment Notice */}
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[10px] text-amber-900 font-medium">
              * DEMO CHECKOUT: Simulated transactions only. No real payment card is charged.
            </div>

            <button
              onClick={handleCheckout}
              disabled={placingOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              <span>{placingOrder ? 'Processing Demo Order...' : 'Complete Demo Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Orders History & Digital Invoices */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orderSuccess && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">{orderSuccess.message}</h4>
                <p className="text-xs text-emerald-800">
                  Order Number: <strong>{orderSuccess.order_number}</strong> • Total: Rs {orderSuccess.total_amount} ({orderSuccess.payment_status})
                </p>
              </div>
            </div>
          )}

          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-emerald-700">Order #{order.order_number}</span>
                  <p className="text-[11px] text-slate-400">Placed on {order.created_at}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {order.status}
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1"
                    title="Print Invoice"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Digital Invoice</span>
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 text-xs">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-slate-700">
                    <span>{item.title} (x{item.quantity})</span>
                    <span className="font-bold">Rs {item.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Method: {order.delivery_type === 'delivery' ? '🚚 Farm Direct' : '🏪 Local Pickup'}</span>
                <span className="font-black text-slate-900">Total: Rs {order.total_amount} (DEMO_PAID)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartOrdersPage;
