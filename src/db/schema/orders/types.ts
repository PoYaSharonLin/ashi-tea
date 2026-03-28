import type { InferSelectModel } from "drizzle-orm";
import { orderTable, orderItemTable } from "./tables";

export type Order = InferSelectModel<typeof orderTable>;
export type OrderItem = InferSelectModel<typeof orderItemTable>;

export type OrderWithItems = Order & {
  items: OrderItem[];
};
