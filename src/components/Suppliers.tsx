import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Supplier } from '../types';
import { SupplierForm } from './SupplierForm';
import { supabase } from '../lib/supabase'; // Asegúrate de tener la configuración de Supabase

export const Suppliers = () => {
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  // Obtener los proveedores desde Supabase
  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data, error } = await supabase.from('suppliers').select('*');
      if (data) {
        setSuppliers(data);
      } else {
        console.error('Error fetching suppliers: ', error);
      }
    };

    fetchSuppliers();
  }, []);

  // Función para manejar el formulario de proveedores (crear o editar)
  const handleSubmit = async (data: Partial<Supplier>) => {
    if (selectedSupplier) {
      // Editar proveedor
      const { error } = await supabase
        .from('suppliers')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
        })
        .eq('id', selectedSupplier.id);

      if (error) {
        console.error('Error updating supplier:', error);
      } else {
        setSuppliers(
          suppliers.map((sup) =>
            sup.id === selectedSupplier.id ? { ...sup, ...data } : sup
          )
        );
      }
    } else {
      // Crear nuevo proveedor
      const { data: newSupplier, error } = await supabase
        .from('suppliers')
        .insert([
          {
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error inserting supplier:', error);
      } else {
        if (newSupplier) {
          setSuppliers([...suppliers, newSupplier]);
        }
      }
    }
    setShowForm(false);
    setSelectedSupplier(undefined);
  };

  // Editar proveedor
  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
  };

  // Abrir modal de confirmación de eliminación
  const confirmDelete = (id: string) => {
    setSupplierToDelete(id);
    setShowDeleteModal(true);
  };

  // Eliminar proveedor
  const handleDelete = async () => {
    if (supplierToDelete) {
      const { error } = await supabase.from('suppliers').delete().eq('id', supplierToDelete);
      if (error) {
        console.error('Error deleting supplier:', error);
      } else {
        setSuppliers(suppliers.filter((sup) => sup.id !== supplierToDelete));
      }
      setShowDeleteModal(false);
      setSupplierToDelete(null);
    }
  };

  // Filtrar proveedores basado en el término de búsqueda
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedSupplier(undefined);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
          <SupplierForm onSubmit={handleSubmit} supplier={selectedSupplier} />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={20} />
              Nuevo Proveedor
            </button>
            <div className="relative w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Buscar proveedor..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apellido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier.first_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(supplier.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No hay proveedores registrados o no se encontraron resultados para su búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Vista en tarjetas para móvil */}
          <div className="space-y-4 sm:hidden">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-semibold text-gray-800">
                  {supplier.first_name} {supplier.last_name}
                </p>
                <p className="text-sm text-gray-600">Teléfono: {supplier.phone}</p>
                <div className="flex justify-end space-x-4 mt-3">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => confirmDelete(supplier.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {filteredSuppliers.length === 0 && (
              <div className="text-center text-gray-500">
                No hay proveedores registrados o no se encontraron resultados para su búsqueda.
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};