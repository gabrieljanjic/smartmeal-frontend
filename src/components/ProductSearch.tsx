import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
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
  brand: string;
  quantity: number | string;
  unit: string;
  chains: ChainPrice[];
};

type ProductSearchResponse = {
  products: Product[];
};

const AMOUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const ProductSearch = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [amounts, setAmounts] = useState<Record<string, number>>({});

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

  const handleAdd = async (product: Product) => {
    try {
      const amount = amounts[product.ean] ?? 1;
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/shopping-cart`,
        {
          name: product.name,
          brand: product.brand ?? "",
          eanCode: product.ean,
          amount,
          quantity: product.quantity,
          unit: product.unit,
        },
        {
          withCredentials: true,
        },
      );
      await queryClient.invalidateQueries({
        queryKey: ["my-products"],
      });
      setSearch("");
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6 pb-0 mb-4">
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

              {product.unit === "kg" ? (
                <p className="text-sm text-gray-900">
                  {Number(product.quantity) * 1000} g
                </p>
              ) : (
                <p className="text-sm text-gray-900">
                  {product.quantity} {product.unit}
                </p>
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
                onClick={() => handleAdd(product)}
                className="w-6 h-6 cursor-pointer hover:scale-110 transition-all duration-200"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductSearch;
