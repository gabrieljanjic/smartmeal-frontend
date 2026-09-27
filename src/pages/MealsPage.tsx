import { useState } from "react";
import DayMealItems from "../components/DayMealItems";
import MealSearch from "../components/MealSearch";

const MealsPage = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  return (
    <>
      <MealSearch />
      <DayMealItems date={date} onDateChange={setDate} />
    </>
  );
};

export default MealsPage;
