import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import Error from "./Error";
import Loading from "./Loading";

type Product = {
  id: number;
  eanCode: string;
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  caloriesPer100?: number | null;
  proteinPer100?: number | null;
  fatPer100?: number | null;
  carbsPer100?: number | null;
};

const ProductSpecs = () => {
  const { ean } = useParams();

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<Product>({
    queryKey: ["product", ean],
    queryFn: async () => {
      const res = await axios.get<Product>(
        `${import.meta.env.VITE_API_URL}/api/products/${ean}`,
      );

      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="w-full flex justify-center mt-12">
        <Loading />
      </div>
    );
  }

  if (isError || !product) {
    return <Error />;
  }

  const kcal = product.caloriesPer100;
  const hasNutrients = kcal !== undefined && kcal !== null && kcal !== 0;

  return (
    <div className="max-w-2xl mx-auto p-8 border-x border-gray-300">
      <div className="flex gap-4 items-start">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-32 h-24 object-contain rounded-md "
          />
        )}
        <div>
          <h1 className="text-lg font-semibold">{product.name}</h1>
          {product.brand && (
            <p className="text-sm text-gray-500">{product.brand}</p>
          )}
        </div>
      </div>
      <div className="mt-6">
        <h2 className="font-medium mb-2">Nutritivne vrijednosti (na 100g)</h2>
        {hasNutrients ? (
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-1">Kalorije</td>
                <td className="py-1 text-right">{kcal} kcal</td>
              </tr>
              {!!product.fatPer100 && (
                <tr className="border-b">
                  <td className="py-1">Masti</td>
                  <td className="py-1 text-right">{product.fatPer100} g</td>
                </tr>
              )}
              {!!product.carbsPer100 && (
                <tr className="border-b">
                  <td className="py-1">Ugljikohidrati</td>
                  <td className="py-1 text-right">{product.carbsPer100} g</td>
                </tr>
              )}
              {!!product.proteinPer100 && (
                <tr>
                  <td className="py-1">Proteini</td>
                  <td className="py-1 text-right">{product.proteinPer100} g</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">
            Nutritivni podaci nisu dostupni za ovaj proizvod.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductSpecs;
