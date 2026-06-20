import { getExpenses } from "./actions";
import ExpensesClient from "./ExpensesClient";
import { type Expense } from "@prisma/client";

export const runtime = "nodejs";

export default async function ExpensesPage() {
  const result = await getExpenses();
  

  const expenses: Expense[] = result.success ? (result.data as Expense[]) : [];

 
  return <ExpensesClient initialData={expenses} />;
}