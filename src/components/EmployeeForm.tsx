import { useState } from "react";
import { useForm } from "react-hook-form";
import { Employee } from "../types";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
            autoCapitalize="words"
            {...register("first_name", { required: "Este campo es requerido" })}
            className="mt-1 block px-4 py-2 border border-gray-500 w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            autoCapitalize="words"
            {...register("last_name", { required: "Este campo es requerido" })}
            className="mt-1 block px-4 py-2 border border-gray-500 w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ingrese el apellido"
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.last_name.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cédula de Identidad
          </label>
          <input
            type="text"
            autoComplete="off"
            {...register("ci", { required: "Este campo es requerido" })}
            className="mt-1 block px-4 py-2 border border-gray-500 w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.ci && (
            <p className="mt-1 text-sm text-red-600">{errors.ci.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <input
              autoComplete="new-password"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Este campo es requerido",
              })}
              className="mt-1 block px-4 py-2 border border-gray-500 w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ingrese el nombre"
            />
            <button type="button" className="absolute inset-y-0 right-3">
              {showPassword ? (
                <Eye
                  className=" h-5 w-5 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                />
              ) : (
                <EyeOff
                  className=" h-5 w-5 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cargo
          </label>
          <select
            id="position"
            {...register("position", {
              required: "Este campo es requerido",
            })}
            className="mt-1 px-4 py-2 border border-gray-500 cursor-pointer block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="" disabled>
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
            className="mt-1 px-4 py-2 border border-gray-500 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="+591 XXXXXXXX"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>
      <div className="flex justify-center">
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
