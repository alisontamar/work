import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { products as initialProducts } from './data/products';
import { ProductCard } from './components/ProductCard';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Employees } from './components/Employees';
import { Suppliers } from './components/Suppliers';
import { ExchangeRateComponent } from './components/ExchangeRate';
import { ProductForm } from './components/ProductForm';
import { Sales } from './components/Sales';
import { TransferComponent } from './components/Transfer';
import { Movements } from './components/Movements';
import { Stores } from './components/Stores';
import { PurchaseOrders } from './components/PurchaseOrders';
import { Login } from './components/Login';
import { supabase } from './lib/supabase';
import { Product, Store, Employee, Sale, Transfer } from './types';

const initialStores: Store[] = [];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [exchangeRate, setExchangeRate] = useState(6.96);

  useEffect(() => {
  const fetchData = async () => {
    // Cambiar esta línea para filtrar solo productos activos
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('active', true); // ← Solo traer productos con active=true

    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else {
      setProducts(productsData);
    }
  };

  fetchData();
}, []);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!session);
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const handleProductSubmit = async (data: Partial<Product>) => {
  try {
    let operation;
    
    if (selectedProduct) {
      // Actualización
      operation = await supabase
        .from('products')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedProduct.id)
        .select(); // Añade .select() para obtener el registro actualizado
    } else {
      // Inserción
      operation = await supabase
        .from('products')
        .insert([{
          ...data,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          active: true // Asegúrate de incluir este campo
        }])
        .select(); // Añade .select() para obtener el nuevo registro
    }

    if (operation.error) {
      throw operation.error;
    }

    // Actualiza el estado local con el producto devuelto por Supabase
    if (operation.data) {
      const updatedProduct = operation.data[0];
      setProducts(prevProducts => 
        selectedProduct
          ? prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
          : [...prevProducts, updatedProduct]
      );
    }

    setShowProductForm(false);
    setSelectedProduct(undefined);
    
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Error al guardar el producto');
  }
};
  

  const handleStoreCreate = (data: Partial<Store>) => {
    const newStore = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Store;
    setStores([...stores, newStore]);
  };

  const handleStoreUpdate = (id: string, data: Partial<Store>) => {
    setStores(stores.map(store => 
      store.id === id ? { ...store, ...data, updated_at: new Date().toISOString() } : store
    ));
  };

  const handleStoreDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta tienda? Los productos asignados quedarán sin tienda.')) {
      setStores(stores.filter(store => store.id !== id));
      setProducts(products.map(product => 
        product.store_id === id ? { ...product, store_id: '' } : product
      ));
    }
  };

  const handleProductAssign = (storeId: string, productId: string) => {
    setProducts(products.map(product =>
      product.id === productId ? { ...product, store_id: storeId } : product
    ));
  };

  const handleSaleSubmit = (data: Partial<Sale>) => {
    const newSale = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    } as Sale;
    setSales([newSale, ...sales]);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

const handleToggleActive = async (id: string) => {
  try {
    // 1. Actualizar en Supabase (cambiar active a false)
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;

    // 2. Actualizar el estado local (filtrar o marcar como inactive)
    setProducts(prevProducts => 
      //prevProducts.filter(p => p.id !== id) // Opción 1: Eliminar del estado
      // Opción 2: Marcar como inactive (si quieres conservarlo para posible recuperación)
      prevProducts.map(p => p.id === id ? { ...p, active: false } : p)
    );
    
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

const filteredProducts = products
  .filter(product => product.active) 
  .filter(product => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.barcode.toLowerCase().includes(term) ||
      product.color.toLowerCase().includes(term)
    );
  });


  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onSaleClick={() => setCurrentPage('sales')} onTransferClick={() => setCurrentPage('transfers')} />;
      case 'sales':
        return (
          <Sales
            onSubmit={handleSaleSubmit}
            exchangeRate={exchangeRate}
          />
        );
      case 'transfers':
        return (
          <TransferComponent
            products={products}
            stores={stores}
            employees={employees}
          />
        );
      case 'movements':
        return (
          <Movements
          />
        );
      case 'stores':
        return (
          <Stores
            stores={stores}
            products={products}
            onStoreCreate={handleStoreCreate}
            onStoreUpdate={handleStoreUpdate}
            onStoreDelete={handleStoreDelete}
            onProductAssign={handleProductAssign}
          />
        );
      case 'purchase-orders':
        return <PurchaseOrders />;
      case 'employees':
        return <Employees />;
      case 'products':
        return (
          <>
            {showProductForm ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setSelectedProduct(undefined);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
                <ProductForm 
                  onSubmit={handleProductSubmit} 
                  product={selectedProduct}
                  stores={stores}
                />
              </div>
            ) : (
              <>
                <div className="relative mb-8">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEdit}
                      onToggleActive={handleToggleActive}
                      exchangeRate={exchangeRate}
                    />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No se encontraron productos</p>
                  </div>
                )}


              </>
            )}
          </>
        );
      case 'suppliers':
        return <Suppliers />;
      case 'exchange':
        return (
          <ExchangeRateComponent
            onRateChange={(rate) => setExchangeRate(rate)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="flex-1 ml-0 md:ml-64">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentPage === 'products' && 'Gestión de Productos'}
                {currentPage === 'dashboard' && 'Dashboard'}
                {currentPage === 'employees' && 'Gestión de Empleados'}
                {currentPage === 'suppliers' && 'Gestión de Proveedores'}
                {currentPage === 'exchange' && 'Tipo de Cambio'}
                {currentPage === 'sales' && 'Nueva Venta'}
                {currentPage === 'transfers' && 'Nueva Transferencia'}
                {currentPage === 'movements' && 'Movimientos'}
                {currentPage === 'stores' && 'Gestión de Tiendas'}
                {currentPage === 'purchase-orders' && 'Órdenes de Compra'}
              </h1>
              {currentPage === 'products' && !showProductForm && (
                <button 
                  onClick={() => setShowProductForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Nuevo Producto
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;