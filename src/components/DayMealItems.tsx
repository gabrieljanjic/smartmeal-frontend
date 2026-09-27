import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { MdOutlineDelete } from "react-icons/md";
import { GiShoppingCart } from "react-icons/gi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { NavLink } from "react-router-dom";
import Loading from "./Loading";

export type Product = {
  id: number;
  eanCode: string;
  name: string;
  brand: string | null;
  caloriesPer100: number | null;
  proteinPer100: number | null;
  fatPer100: number | null;
  carbsPer100: number | null;
  imageUrl: string | null;
  quantity: number | string | null;
  unit: string | null;
};

export type MealItem = {
  id: number;
  dayId: number;
  mealNumber: number;
  amount: number;
  isBought: boolean;
  product: Product;
};

type MealItemsResponse = {
  items: MealItem[];
};

type DayMealItemsProps = {
  date: string;
  onDateChange: (date: string) => void;
};

const MEAL_NUMBERS = [1, 2, 3];

const MEAL_LABELS: Record<number, string> = {
  1: "Doručak",
  2: "Ručak",
  3: "Večera",
};

const AMOUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const getQuantityInGrams = (
  quantity: number | string | null,
  unit: string | null,
): number => {
  if (quantity == null || unit == null) {
    return 100;
  }

  const parsedQuantity = Number(String(quantity).trim().replace(",", "."));

  if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return 100;
  }

  const normalizedUnit = unit.trim().toLowerCase();

  switch (normalizedUnit) {
    case "kg":
    case "kilogram":
    case "kilograms":
      return parsedQuantity * 1000;

    case "g":
    case "gr":
    case "gram":
    case "grams":
    case "grama":
      return parsedQuantity;

    case "mg":
    case "milligram":
    case "milligrams":
      return parsedQuantity / 1000;

    default:
      return parsedQuantity;
  }
};

const calculateNutritionForPackage = (
  valuePer100g: number | null,
  quantity: number | string | null,
  unit: string | null,
): number => {
  if (valuePer100g == null) {
    return 0;
  }

  const quantityInGrams = getQuantityInGrams(quantity, unit);

  return valuePer100g * (quantityInGrams / 100);
};

const calculateNutritionForMealItem = (
  valuePer100g: number | null,
  quantity: number | string | null,
  unit: string | null,
  amount: number,
): number => {
  const packageValue = calculateNutritionForPackage(
    valuePer100g,
    quantity,
    unit,
  );

  return packageValue * amount;
};

const DayMealItems = ({ date, onDateChange }: DayMealItemsProps) => {
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isFetching,
    isError,
  } = useQuery<MealItem[]>({
    queryKey: ["meal-items", date],

    queryFn: async ({ signal }) => {
      const response = await axios.get<MealItemsResponse>(
        `${import.meta.env.VITE_API_URL}/api/meal-items`,
        {
          params: { date },
          withCredentials: true,
          signal,
        },
      );

      return response.data.items;
    },

    enabled: date.length > 0,
  });

  const itemsByMeal = useMemo(() => {
    return MEAL_NUMBERS.reduce<Record<number, MealItem[]>>(
      (acc, mealNumber) => {
        acc[mealNumber] = items.filter(
          (item) => item.mealNumber === mealNumber,
        );

        return acc;
      },
      {},
    );
  }, [items]);

  const dailyNutrition = useMemo(() => {
    return items.reduce(
      (total, item) => {
        const product = item.product;
        const amount = item.amount;

        total.calories += calculateNutritionForMealItem(
          product.caloriesPer100,
          product.quantity,
          product.unit,
          amount,
        );

        total.protein += calculateNutritionForMealItem(
          product.proteinPer100,
          product.quantity,
          product.unit,
          amount,
        );

        total.fat += calculateNutritionForMealItem(
          product.fatPer100,
          product.quantity,
          product.unit,
          amount,
        );

        total.carbs += calculateNutritionForMealItem(
          product.carbsPer100,
          product.quantity,
          product.unit,
          amount,
        );

        return total;
      },
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
    );
  }, [items]);

  const shiftDate = (days: number) => {
    const next = new Date(date);

    next.setDate(next.getDate() + days);

    onDateChange(next.toISOString().split("T")[0]);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/meal-items/${id}`,
        {
          withCredentials: true,
        },
      );
      toast.success("Proizvod obrisan");
      await queryClient.invalidateQueries({
        queryKey: ["meal-items", date],
      });
    } catch {
      toast.error("Greška.");
    }
  };

  const handleAmountChange = async (id: number, amount: number) => {
    if (amount < 1) {
      toast.error("Minimalna količina: 1.");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/meal-items/${id}`,
        JSON.stringify(amount),
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      await queryClient.invalidateQueries({
        queryKey: ["meal-items", date],
      });
    } catch {
      toast.error("Greška.");
    }
  };

  const handleAddToShoppingCart = async (product: Product) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/shopping-cart`,
        {
          name: product.name,
          brand: product.brand,
          eanCode: product.eanCode,
          amount: 1,
          quantity: product.quantity,
          unit: product.unit,
        },
        {
          withCredentials: true,
        },
      );
      toast.success(`${product.name} dodan u košaricu.`);
      await queryClient.invalidateQueries({
        queryKey: ["my-products"],
      });
    } catch {
      toast.error("Greška.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 pt-2 pb-6">
      <div className="w-full flex justify-center items-center gap-2 sm:gap-3">
        <IoChevronBack
          onClick={() => shiftDate(-1)}
          className="w-8 h-8 sm:w-9 sm:h-9 p-2 shrink-0 cursor-pointer hover:bg-gray-200 rounded-full transition-colors duration-200"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-auto min-w-0 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <IoChevronForward
          onClick={() => shiftDate(1)}
          className="w-8 h-8 sm:w-9 sm:h-9 p-2 shrink-0 cursor-pointer hover:bg-gray-200 rounded-full transition-colors duration-200"
        />
      </div>
      {!isFetching && !isError && (
        <div className="mt-4 border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
            Dnevna prehrana
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 text-center">
            <div>
              <p className="text-base sm:text-lg font-semibold">
                {dailyNutrition.calories.toFixed(0)}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500">Kalorije</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-semibold">
                {dailyNutrition.protein.toFixed(1)}g
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500">Proteini</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-semibold">
                {dailyNutrition.fat.toFixed(1)}g
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500">Masti</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-semibold">
                {dailyNutrition.carbs.toFixed(1)}g
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500">
                Ugljikohidrati
              </p>
            </div>
          </div>
        </div>
      )}
      {isFetching && (
        <div className="w-full flex justify-center mt-12">
          <Loading />
        </div>
      )}
      {isError && (
        <p className="mt-3 text-sm text-red-500 text-center">Greška.</p>
      )}
      {!isFetching && !isError && (
        <div className="mt-5 sm:mt-6 space-y-6">
          {MEAL_NUMBERS.map((mealNumber) => (
            <div key={mealNumber}>
              <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                {MEAL_LABELS[mealNumber]}
              </h3>

              {itemsByMeal[mealNumber].length === 0 ? (
                <p className="text-sm text-gray-400 px-1">Nema proizvoda.</p>
              ) : (
                <ul className="space-y-3">
                  {itemsByMeal[mealNumber].map((item) => {
                    const product = item.product;

                    const calories = calculateNutritionForMealItem(
                      product.caloriesPer100,
                      product.quantity,
                      product.unit,
                      item.amount,
                    );

                    const protein = calculateNutritionForMealItem(
                      product.proteinPer100,
                      product.quantity,
                      product.unit,
                      item.amount,
                    );

                    const fat = calculateNutritionForMealItem(
                      product.fatPer100,
                      product.quantity,
                      product.unit,
                      item.amount,
                    );

                    const carbs = calculateNutritionForMealItem(
                      product.carbsPer100,
                      product.quantity,
                      product.unit,
                      item.amount,
                    );

                    const quantityInGrams = getQuantityInGrams(
                      product.quantity,
                      product.unit,
                    );

                    const hasKnownQuantity =
                      product.quantity != null && product.unit != null;

                    return (
                      <li
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] sm:text-xs text-gray-400 shrink-0">
                              No image
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <NavLink to={`/product/${product.eanCode}`}>
                              <p className="font-medium text-gray-900 text-sm sm:text-base leading-tight hover:text-green-700 transition-colors">
                                {product.name}
                              </p>
                            </NavLink>
                            {product.brand && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                {product.brand}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {hasKnownQuantity
                                ? `${quantityInGrams} g × ${item.amount}`
                                : `100 g × ${item.amount} (default)`}
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] sm:text-xs text-gray-500">
                              <span>{calories.toFixed(0)} kcal</span>
                              <span>P {protein.toFixed(1)}g</span>
                              <span>M {fat.toFixed(1)}g</span>
                              <span>U {carbs.toFixed(1)}g</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-gray-100">
                          <select
                            value={item.amount}
                            onChange={(e) =>
                              handleAmountChange(
                                item.id,
                                Number(e.target.value),
                              )
                            }
                            className="border border-gray-300 rounded-md text-sm px-2 py-1.5 outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                            aria-label="Amount"
                          >
                            {AMOUNT_OPTIONS.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAddToShoppingCart(product)}
                            title="Add to shopping cart"
                            aria-label="Add to shopping cart"
                            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-green-50 transition-colors cursor-pointer"
                          >
                            <GiShoppingCart className="w-5 h-5 text-gray-700 hover:text-green-600 hover:scale-110 transition-all duration-200" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Remove from meal"
                            aria-label="Remove from meal"
                            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <MdOutlineDelete className="w-5 h-5 text-gray-700 hover:text-red-600 hover:scale-110 transition-all duration-200" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DayMealItems;
