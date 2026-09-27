import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import Loading from "./Loading";
import Error from "./Error";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";

type Product = {
  id: number;
  name: string;
  brand: string | null;
  eanCode: string;
  imageUrl: string | null;
  caloriesPer100: number | null;
  carbsPer100: number | null;
  fatPer100: number | null;
  proteinPer100: number | null;
  mealItems: unknown[];
};

type ChainPrice = {
  chain: string;
  avgPrice: number | string | null;
  minPrice: number | string | null;
  maxPrice: number | string | null;
  priceDate: string | null;
};

type ShoppingCartProduct = {
  id: number;
  userId: number;
  user: unknown | null;
  productId: number;
  product: Product;
  amount: number;
  boughtAt: string | null;
  prices: ChainPrice[];
};

type ChainTotal = {
  chain: string;
  total: number;
  productsFound: number;
};

const getNumericPrice = (
  price: number | string | null | undefined,
): number | null => {
  if (price == null || price === "") {
    return null;
  }

  const parsedPrice = Number(price);

  return Number.isNaN(parsedPrice) ? null : parsedPrice;
};

const formatPrice = (price: number | string | null | undefined): string => {
  const numericPrice = getNumericPrice(price);

  if (numericPrice === null) {
    return "-";
  }

  return numericPrice.toFixed(2);
};

const MyAllShoppingCartProducts = () => {
  const queryClient = useQueryClient();

  const { mutate: handleBoughtAt } = useMutation({
    mutationFn: async (id: number) => {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/shopping-cart/${id}/bought-at`,
        {},
        {
          withCredentials: true,
        },
      );

      return res.data;
    },

    onSuccess: (data) => {
      if (data.boughtAt) {
        toast.success("Product marked as bought!");
      }

      queryClient.invalidateQueries({
        queryKey: ["my-products"],
      });
    },

    onError: () => {
      toast.error("Greška.");
    },
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: async (id: number) => {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/shopping-cart/${id}`,
        {
          withCredentials: true,
        },
      );

      return res.data;
    },

    onSuccess: () => {
      toast.success("Item deleted");

      queryClient.invalidateQueries({
        queryKey: ["my-products"],
      });
    },

    onError: () => {
      toast.error("Greška");
    },
  });

  const { mutate: handleAmountChange } = useMutation({
    mutationFn: async ({ id, amount }: { id: number; amount: number }) => {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/shopping-cart/${id}/amount`,
        { amount },
        {
          withCredentials: true,
        },
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-products"],
      });
    },

    onError: () => {
      toast.error("Greška.");
    },
  });

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<ShoppingCartProduct[]>({
    queryKey: ["my-products"],

    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shopping-cart`,
        {
          withCredentials: true,
        },
      );
      return res.data;
    },
  });

  const chainTotals = useMemo<ChainTotal[]>(() => {
    const totals = new Map<
      string,
      {
        chain: string;
        total: number;
        productsFound: number;
      }
    >();

    products.forEach((item) => {
      item.prices?.forEach((price) => {
        const numericPrice = getNumericPrice(price.avgPrice);

        if (numericPrice === null) {
          return;
        }

        const chain = price.chain.trim().toLowerCase();

        if (!chain) {
          return;
        }

        const current = totals.get(chain) ?? {
          chain: price.chain,
          total: 0,
          productsFound: 0,
        };

        current.total += numericPrice * item.amount;
        current.productsFound += 1;

        totals.set(chain, current);
      });
    });

    return Array.from(totals.values()).sort((a, b) => a.total - b.total);
  }, [products]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center mt-12">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return <Error />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-0">
      <ul className="space-y-3">
        {products.map((item) => {
          const sortedPrices = [...(item.prices ?? [])]
            .map((price) => ({
              ...price,
              numericAvgPrice: getNumericPrice(price.avgPrice),
            }))
            .filter((price) => price.numericAvgPrice !== null)
            .sort(
              (a, b) =>
                (a.numericAvgPrice ?? Infinity) -
                (b.numericAvgPrice ?? Infinity),
            );

          return (
            <li
              key={item.id}
              className={`flex justify-between items-center border border-gray-300 rounded-lg p-4 shadow-sm ${
                item.boughtAt ? "opacity-60 bg-gray-50" : "bg-white"
              }`}
            >
              <div className="min-w-0">
                <NavLink
                  to={`/product/${item.product.eanCode}`}
                  className={`font-medium text-gray-900 hover:text-blue-400 ${
                    item.boughtAt ? "line-through" : ""
                  }`}
                >
                  {item.product.name}
                </NavLink>

                {item.product.brand && (
                  <p className="text-sm text-gray-500">{item.product.brand}</p>
                )}

                <p className="text-sm text-gray-900 mt-1">
                  Količina: {item.amount}
                </p>

                {sortedPrices.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {sortedPrices.map((price, index) => (
                      <div
                        key={`${price.chain}-${index}`}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${
                          index === 0
                            ? "bg-green-100 text-green-800 ring-1 ring-green-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <span className="font-medium capitalize">
                          {price.chain}
                        </span>

                        <span className="font-semibold">
                          {formatPrice(price.avgPrice)} €
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">
                    Cijena nije dostupna
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <select
                  value={item.amount}
                  onChange={(e) =>
                    handleAmountChange({
                      id: item.id,
                      amount: Number(e.target.value),
                    })
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm cursor-pointer"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  checked={!!item.boughtAt}
                  onChange={() => handleBoughtAt(item.id)}
                  className="w-5 h-5 cursor-pointer accent-green-700"
                  title="Bought"
                />
                <MdDelete
                  className="w-6 h-6 cursor-pointer text-gray-800 hover:text-red-500 hover:scale-110 transition-all duration-200"
                  title="Delete"
                  onClick={() => handleDelete(item.id)}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {chainTotals.length > 0 && (
        <div className="mt-8 border border-gray-200 rounded-xl p-5 shadow-sm bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Ukupna cijena košarice
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Računa se samo ono što je dostupno u pojedinom lancu.
          </p>
          <div className="space-y-2">
            {chainTotals.map((chain, index) => (
              <div
                key={chain.chain}
                className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                  index === 0
                    ? "bg-green-50 border border-green-300"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div>
                  <p className="font-semibold capitalize text-gray-900">
                    {chain.chain}
                  </p>

                  <p className="text-xs text-gray-500">
                    {chain.productsFound} od {products.length} artikala
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      index === 0 ? "text-green-700" : "text-gray-900"
                    }`}
                  >
                    {chain.total.toFixed(2)} €
                  </p>

                  {index === 0 && (
                    <p className="text-[10px] font-bold uppercase text-green-700">
                      najjeftinija košarica
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {products.length > 0 && chainTotals.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
          <p className="font-medium text-gray-700">Nema dostupnih cijena</p>

          <p className="text-sm text-gray-500 mt-1">
            Za proizvode u košarici trenutno nisu pronađene cijene.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyAllShoppingCartProducts;
