import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Employee } from "../types";
import { EmployeeForm } from "./EmployeeForm";
import { supabase } from '../lib/supabase';


export const Employees = () => {
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener empleados desde Supabase
  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('*');
    if (error) {
      console.error('❌ Error al obtener empleados:', error.message);
    } else {
      setEmployees(data || []);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (data: Partial<Employee>) => {
    if (selectedEmployee) {
      // Actualizar
      const { error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', selectedEmployee.id);

      if (error) {
        console.error('❌ Error al actualizar empleado:', error.message);
        alert('Error al actualizar empleado');
      }
    } else {
      // Insertar nuevo
      const { error } = await supabase.from('employees').insert([data]);
      if (error) {
        console.error('❌ Error al crear empleado:', error.message);
        alert('Error al crear empleado');
      }
    }

    setShowForm(false);
    setSelectedEmployee(undefined);
    await fetchEmployees(); // Refrescar lista
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este empleado?')) {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) {
        console.error('❌ Error al eliminar empleado:', error.message);
        alert('Error al eliminar empleado');
      } else {
        await fetchEmployees();
      }
    }
  };

  const filteredEmployees = employees.filter(employee =>
    `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {selectedEmployee ? "Editar Empleado" : "Nuevo Empleado"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedEmployee(undefined);
              }}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              Cancelar
            </button>
          </div>
          <div className="p-4">
            <EmployeeForm onSubmit={handleSubmit} employee={selectedEmployee} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Nuevo Empleado
            </button>

            <div className="w-full sm:w-96 relative">
              <input
                type="text"
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            {/* Vista de tabla solo en pantallas medianas en adelante */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empleado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
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
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {employee.position}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {employee.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No hay empleados registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vista de cartas solo en móviles */}
            <div className="block md:hidden space-y-4">
              {filteredEmployees.length === 0 ? (
                <p className="text-center text-gray-500">
                  No hay empleados registrados
                </p>
              ) : (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {employee.first_name} {employee.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <strong>Cargo:</strong> {employee.position}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Teléfono:</strong> {employee.phone}
                      </p>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
