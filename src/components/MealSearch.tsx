import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { MdClear } from "react-icons/md";
import { CiCirclePlus } from "react-icons/ci";
import Loading from "./Loading";

export type ChainPrice = {
  chain: string;
  avg_price?: number;
};

export type Product = {
  ean: string;
  name: string;
  brand: string | null;
  quantity: number | string | null;
  unit: string | null;
  chains: ChainPrice[];
};

type ProductSearchResponse = {
  products: Product[];
};

const AMOUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const MEAL_OPTIONS = [
  { value: 1, label: "Doručak" },
  { value: 2, label: "Ručak" },
  { value: 3, label: "Večera" },
];

const MealSearch = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [mealNumber, setMealNumber] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  const {
    data: products = [],
    isFetching,
    isError,
  } = useQuery<Product[]>({
    queryKey: ["products", debouncedSearch],

    queryFn: async ({ signal }) => {
      const response = await axios.get<ProductSearchResponse>(
        `${import.meta.env.VITE_API_URL}/api/products`,
        {
          params: {
            query: debouncedSearch,
          },
          signal,
        },
      );

      return response.data.products;
    },

    enabled: debouncedSearch.length > 0,
  });

  const sortedProducts = useMemo(() => {
    return [...products]
      .filter((product) => product.ean.length === 13)
      .sort((a, b) => (b.chains?.length ?? 0) - (a.chains?.length ?? 0));
  }, [products]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async () => {
    if (!selectedProduct) {
      return;
    }

    if (!date) {
      toast.error("Odaberi datum.");
      return;
    }

    if (!MEAL_OPTIONS.some((meal) => meal.value === mealNumber)) {
      toast.error("Odaberi obrok.");
      return;
    }

    try {
      const amount = amounts[selectedProduct.ean] ?? 1;

      let quantity: number | null = null;
      let unit: string | null = null;

      if (
        selectedProduct.quantity !== null &&
        selectedProduct.quantity !== undefined &&
        selectedProduct.quantity !== ""
      ) {
        const rawQuantity = String(selectedProduct.quantity)
          .trim()
          .replace(",", ".");

        const parsedQuantity = Number(rawQuantity);

        if (!Number.isNaN(parsedQuantity)) {
          quantity = parsedQuantity;
        }
      }

      if (selectedProduct.unit !== null) {
        unit = selectedProduct.unit.trim().toLowerCase();

        if (unit === "") {
          unit = null;
        }
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/meal-items`,
        {
          date,
          eanCode: selectedProduct.ean,
          name: selectedProduct.name,
          brand: selectedProduct.brand,
          mealNumber,
          amount,
          quantity,
          unit,
        },
        {
          withCredentials: true,
        },
      );

      await queryClient.invalidateQueries({
        queryKey: ["meal-items", date],
      });

      toast.success("Proizvod dodan!");

      closeModal();
      setSearch("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("API response:", error.response?.data);
      }

      toast.error("Greška.");
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 pb-0">
        <div className="w-full gap-1 flex justify-center items-center">
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            type="text"
            placeholder="Pretraži proizvode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MdClear
            onClick={() => setSearch("")}
            className="shrink-0 w-8 h-8 p-2 cursor-pointer hover:bg-gray-200 rounded-full transition-colors duration-200"
          />
        </div>
        {isFetching && (
          <div className="w-full flex justify-center mt-12">
            <Loading />
          </div>
        )}
        {isError && <p className="mt-3 text-sm text-red-500">Greška.</p>}
        <ul className="mt-4 space-y-3">
          {sortedProducts.map((product) => (
            <li
              key={product.ean}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>

                {product.brand && (
                  <p className="text-sm text-gray-600">{product.brand}</p>
                )}
                {product.quantity !== null &&
                product.quantity !== undefined &&
                product.unit ? (
                  <p className="text-sm text-gray-900">
                    {product.quantity} {product.unit}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">-</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.chains?.map((chainItem, index) => (
                    <span
                      key={`${product.ean}${chainItem.chain}${index}`}
                      className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
                    >
                      {chainItem.chain}

                      {chainItem.avg_price !== undefined &&
                        ` – ${chainItem.avg_price} €`}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={amounts[product.ean] ?? 1}
                  onChange={(e) =>
                    setAmounts((prev) => ({
                      ...prev,
                      [product.ean]: Number(e.target.value),
                    }))
                  }
                  className="border border-gray-300 rounded-md text-sm px-2 py-1 outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {AMOUNT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <CiCirclePlus
                  onClick={() => openModal(product)}
                  className="w-6 h-6 cursor-pointer hover:scale-110 transition-all duration-200"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add product to meal"
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl outline-none flex flex-col"
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
      >
        <h2 className="text-xl font-semibold">Dodaj proizvod</h2>
        {selectedProduct && (
          <div className="mt-4 rounded-lg bg-gray-100 p-3">
            <p className="font-medium">{selectedProduct.name}</p>
            {selectedProduct.brand && (
              <p className="text-sm text-gray-600">{selectedProduct.brand}</p>
            )}
            <p className="text-sm text-gray-600">
              Package:{" "}
              {selectedProduct.quantity !== null &&
              selectedProduct.quantity !== undefined &&
              selectedProduct.unit
                ? `${selectedProduct.quantity} ${selectedProduct.unit}`
                : "Unknown — calories will be calculated as 100g"}
            </p>
            <p className="text-sm text-gray-600">
              Količina: {amounts[selectedProduct.ean] ?? 1}
            </p>
          </div>
        )}
        <label className="pt-4">Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 rounded-lg border border-gray-300 px-3 py-2"
        />
        <label className="pt-4">Obrok</label>
        <select
          value={mealNumber}
          onChange={(e) => setMealNumber(Number(e.target.value))}
          className="mt-1 rounded-lg border border-gray-300 px-3 py-2"
        >
          {MEAL_OPTIONS.map((meal) => (
            <option key={meal.value} value={meal.value}>
              {meal.label}
            </option>
          ))}
        </select>
        <div className="mt-6 flex gap-2">
          <button
            onClick={closeModal}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
          >
            Otkaži
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-black px-4 py-2 text-white"
          >
            Dodaj
          </button>
        </div>
      </Modal>
    </>
  );
};

export default MealSearch;
