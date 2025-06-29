import React from "react";
import { useForm } from "react-hook-form";
import { Employee } from "../types";

interface EmployeeFormProps {
  onSubmit: (data: Partial<Employee>) => void;
  employee?: Employee;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSubmit,
  employee,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: employee || {},
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded-lg shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            {...register("first_name", { required: "Este campo es requerido" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ingrese el nombre"
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            {...register("last_name", { required: "Este campo es requerido" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ingrese el apellido"
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.last_name.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700"
          >
            Cargo
          </label>
          <select
            id="position"
            name="position"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="" disabled selected>
              Seleccione un cargo
            </option>
            <option value="ventas">Ventas</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            type="tel"
            {...register("phone", {
              required: "Este campo es requerido",
              pattern: {
                value: /^[0-9+\s-]+$/,
                message: "Ingrese un número de teléfono válido",
              },
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="+591 XXXXXXXX"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {employee ? "Actualizar Empleado" : "Crear Empleado"}
        </button>
      </div>
    </form>
  );
};
