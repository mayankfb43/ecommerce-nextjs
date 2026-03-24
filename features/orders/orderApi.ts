import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/orders" }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => "/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Order" as const, id: _id })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),
    createOrder: builder.mutation<
      Order,
      { items: OrderItem[]; totalAmount: number }
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    updateOrderStatus: builder.mutation<
      Order,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApi;
