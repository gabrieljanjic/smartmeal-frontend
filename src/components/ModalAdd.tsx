import Modal from "react-modal";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import type { Product } from "./ProductSearch";

type MyMealItemsProps = {
  product: Product | null;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
};

const ModalAdd = ({ product, amount, isOpen, onClose }: MyMealItemsProps) => {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [mealNumber, setMealNumber] = useState(1);

  const handleSubmit = async () => {
    if (!product) return;

    if (!date) {
      toast.error("Select a date.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/meal-items`,
        {
          date: date,
          eanCode: product.ean,
          mealNumber: mealNumber,
          amount: amount,
        },
        {
          withCredentials: true,
        },
      );
      toast.success("Proizvod dodan!");
      onClose();
    } catch {
      toast.error("Greška.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add product to meal"
      className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl outline-none flex flex-col"
      overlayClassName="fixed inset-0 flex items-center justify-center bg-black/50"
    >
      <h2 className="text-xl font-semibold">Add product to meal</h2>

      {product && (
        <div className="mt-4 rounded-lg bg-gray-100 p-3">
          <p className="font-medium">{product.name}</p>

          {product.brand && (
            <p className="text-sm text-gray-600">{product.brand}</p>
          )}

          <p className="text-sm text-gray-600">Amount: {amount}</p>
        </div>
      )}

      <label className="pt-4">Date</label>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mt-1 rounded-lg border border-gray-300 px-3 py-2"
      />

      <label className="pt-4">Meal number</label>

      <input
        type="number"
        min={1}
        value={mealNumber}
        onChange={(e) => setMealNumber(Number(e.target.value))}
        className="mt-1 rounded-lg border border-gray-300 px-3 py-2"
      />

      <div className="mt-6 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="flex-1 rounded-lg bg-black px-4 py-2 text-white"
        >
          Add
        </button>
      </div>
    </Modal>
  );
};

export default ModalAdd;
