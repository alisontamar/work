import React, { SetStateAction } from "react";

function AlertDelete({
  isOpen,
  removeProduct,
  setIsOpen,
}: {
  isOpen: boolean;
  removeProduct: () => void;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="bg-white fixed max-w-md p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md shadow-lg"
      >
        <div>
          <h2 className="text-xl font-bold">¿Estás seguro?</h2>
          <p className="mt-2 text-sm">
            Esta acción no se puede deshacer. ¿Seguro que quieres continuar?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="border border-blue-500 px-4 py-2 rounded-md"
              onClick={() => setIsOpen(!isOpen)}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                removeProduct();
                setIsOpen(!isOpen);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Aceptar
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default AlertDelete;
