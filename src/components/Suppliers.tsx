import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Supplier } from '../types';
import { SupplierForm } from './SupplierForm';

export const Suppliers = () => {
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();

  const handleSubmit = (data: Partial<Supplier>) => {
    if (selectedSupplier) {
      setSuppliers(suppliers.map(sup => 
        sup.id === selectedSupplier.id ? { ...sup, ...data } : sup
      ));
    } else {
      const newSupplier = {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Supplier;
      setSuppliers([...suppliers, newSupplier]);
    }
    setShowForm(false);
    setSelectedSupplier(undefined);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setSuppliers(suppliers.filter(sup => sup.id !== id));
  };

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
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Nuevo Proveedor
            </button>
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
                {suppliers.map((supplier) => (
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
                        onClick={() => handleDelete(supplier.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No hay proveedores registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Vista en tarjetas para móvil */}
<div className="space-y-4 sm:hidden">
  {suppliers.map((supplier) => (
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
          onClick={() => handleDelete(supplier.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  ))}
  {suppliers.length === 0 && (
    <div className="text-center text-gray-500">No hay proveedores registrados</div>
  )}
</div>

        </>
      )}
    </div>
  );
};