'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { Separator } from '@/components/ui/separator';
import { Baby, Heart, Pilcrow, ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

// Define a Product type so TypeScript knows dose can be string or null
type Product = {
  id: string;
  name: string;
  price: string;
  dose: string | null;
  dataAiHint: string;
};

// Cart item type
type CartItem = {
  product: Product;
  quantity: number;
};

const pregnancyProducts: Product[] = [
  { id: 'preg-1', name: 'Folic Acid Supplements', price: '9.99', dose: '400 mcg daily', dataAiHint: 'supplements medicine' },
  { id: 'preg-2', name: 'Iron & Calcium Tablets', price: '14.50', dose: '1 tablet daily after meals', dataAiHint: 'supplements medicine' },
  { id: 'preg-3', name: 'Maternity Pads', price: '8.00', dose: null, dataAiHint: 'maternity pads' },
  { id: 'preg-4', name: 'Stretch Mark Cream', price: '12.99', dose: null, dataAiHint: 'stretch mark cream' },
  { id: 'preg-5', name: 'Pregnancy Test Kit', price: '4.99', dose: null, dataAiHint: 'pregnancy test kit' },
  { id: 'preg-6', name: 'Maternity Support Belt', price: '25.00', dose: null, dataAiHint: 'maternity belt' },
];

const babyProducts: Product[] = [
  { id: 'baby-1', name: 'Newborn Diapers (Pampers)', price: '15.99', dose: null, dataAiHint: 'diapers baby' },
  { id: 'baby-2', name: 'Baby Wipes (Huggies)', price: '3.99', dose: null, dataAiHint: 'baby wipes' },
  { id: 'baby-3', name: 'Cerelac (Stage 1)', price: '6.49', dose: '2–3 spoonfuls mixed with water/milk', dataAiHint: 'baby food' },
  { id: 'baby-4', name: "Johnson's Baby Oil", price: '5.99', dose: null, dataAiHint: 'baby oil' },
  { id: 'baby-5', name: 'Diaper Rash Cream (Sudocrem)', price: '8.99', dose: 'Apply thin layer on affected area', dataAiHint: 'diaper rash cream' },
  { id: 'baby-6', name: 'Baby Formula (Nan Pro)', price: '22.00', dose: 'As per pediatrician’s advice (usually 30ml every 3 hrs)', dataAiHint: 'baby formula' },
  { id: 'baby-7', name: 'Gripe Water', price: '4.50', dose: '5 ml twice daily', dataAiHint: 'gripe water' },
  { id: 'baby-8', name: 'Baby Shampoo', price: '6.99', dose: null, dataAiHint: 'baby shampoo' },
];

const hygieneProducts: Product[] = [
  { id: 'hyg-1', name: 'Sanitary Pads', price: '5.99', dose: null, dataAiHint: 'sanitary pads' },
  { id: 'hyg-2', name: 'Tampons', price: '7.49', dose: null, dataAiHint: 'tampons hygiene' },
  { id: 'hyg-3', name: 'Menstrual Cup', price: '24.99', dose: null, dataAiHint: 'menstrual cup' },
  { id: 'hyg-4', name: 'Rubber Hot Water Bag', price: '3.00', dose: null, dataAiHint: 'hot water bag' },
  { id: 'hyg-5', name: 'Electric Heating Bag', price: '5.00', dose: null, dataAiHint: 'electric heating bag' },
];

const painReliefProducts: Product[] = [
  { id: 'pain-1', name: 'Meftal-Spas', price: '0.25', dose: '1 tablet every 8 hours', dataAiHint: 'painkillers medicine' },
  { id: 'pain-2', name: 'Drotin-M', price: '0.35', dose: '1 tablet twice daily', dataAiHint: 'painkillers medicine' },
  { id: 'pain-3', name: 'Cyclopam', price: '0.25', dose: '1 tablet after meals', dataAiHint: 'painkillers medicine' },
  { id: 'pain-4', name: 'Ibuprofen', price: '0.20', dose: '400 mg every 6–8 hours', dataAiHint: 'painkillers medicine' },
  { id: 'pain-5', name: 'Paracetamol', price: '0.10', dose: '500 mg every 6 hours', dataAiHint: 'painkillers medicine' },
];

const ProductGrid = ({ products, onAddToCart }: { products: Product[], onAddToCart: (product: Product) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {products.map((product) => (
      <Card key={product.id}>
        <CardHeader>
          {product.dose ? (
            <p className="text-sm text-gray-600 italic">Avg Dose: {product.dose}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No dosage info</p>
          )}
        </CardHeader>
        <CardContent>
          <CardTitle>{product.name}</CardTitle>
          <p className="text-lg font-semibold text-primary">Rs {product.price}</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => onAddToCart(product)}>Add to Cart</Button>
        </CardFooter>
      </Card>
    ))}
  </div>
);

const CartItem = ({ item, onUpdateQuantity, onRemove }: { 
  item: CartItem, 
  onUpdateQuantity: (id: string, quantity: number) => void,
  onRemove: (id: string) => void 
}) => {
  const price = parseFloat(item.product.price);
  const total = price * item.quantity;

  return (
    <div className="flex justify-between items-center py-4 border-b">
      <div className="flex-1">
        <h4 className="font-medium">{item.product.name}</h4>
        <p className="text-sm text-gray-600">Rs {item.product.price}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus size={16} />
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
        >
          <Plus size={16} />
        </Button>
      </div>
      <div className="ml-4 flex items-center gap-4">
        <p className="font-medium">Rs {total.toFixed(2)}</p>
        <Button variant="ghost" size="sm" onClick={() => onRemove(item.product.id)}>
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};

const CartSidebar = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem,
  onClearCart
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  cartItems: CartItem[], 
  onUpdateQuantity: (id: string, quantity: number) => void,
  onRemoveItem: (id: string) => void,
  onClearCart: () => void
}) => {
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const [selectedPayment, setSelectedPayment] = useState('');

  const handlePlaceOrder = () => {
    if (!selectedPayment) {
      alert("Please select a payment method before placing the order.");
      return;
    }
    alert("✅ Order placed successfully!");
    onClearCart();   // 🔹 Clear cart after successful order
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <Button variant="ghost" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            ) : (
              cartItems.map(item => (
                <CartItem 
                  key={item.product.id} 
                  item={item} 
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveItem}
                />
              ))
            )}
          </div>
          
          {cartItems.length > 0 && (
            <>
              <div className="py-4 border-t">
                <div className="flex justify-between font-semibold text-lg mb-4">
                  <span>Subtotal:</span>
                  <span>Rs {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Select Payment Method</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        id="cod" 
                        name="payment" 
                        value="cod"
                        checked={selectedPayment === 'cod'}
                        onChange={() => setSelectedPayment('cod')}
                      />
                      <label htmlFor="cod">Cash on Delivery</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        id="upi" 
                        name="payment" 
                        value="upi"
                        checked={selectedPayment === 'upi'}
                        onChange={() => setSelectedPayment('upi')}
                      />
                      <label htmlFor="upi">UPI (Paytm, GPay, PhonePe)</label>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
                  {selectedPayment === 'cod' ? 'Place Order' : 'Proceed to Pay'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default function MedicalStorePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);  // 🔹 Clears the cart
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Medical Store</h1>
          <Button 
            onClick={() => setIsCartOpen(true)}
            className="relative"
          >
            <ShoppingCart size={20} className="mr-2" />
            Cart
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </Button>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Heart className="text-pink-500" /> For Pregnant Mothers
          </h2>
          <ProductGrid products={pregnancyProducts} onAddToCart={handleAddToCart} />
        </section>

        <Separator className="my-8" />

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Baby className="text-blue-500" /> For Newborn Babies
          </h2>
          <ProductGrid products={babyProducts} onAddToCart={handleAddToCart} />
        </section>

        <Separator className="my-8" />

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Pilcrow className="text-red-500" /> Feminine Hygiene
          </h2>
          <ProductGrid products={hygieneProducts} onAddToCart={handleAddToCart} />
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">Pain & Cramp Relief</h2>
          <ProductGrid products={painReliefProducts} onAddToCart={handleAddToCart} />
        </section>

        <CartSidebar 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onClearCart={clearCart}   // 🔹 Pass clearCart function
        />
      </div>
    </AppLayout>
  );
}
