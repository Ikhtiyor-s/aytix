'use client'

import { Order } from '@/types'
import { formatPrice, formatDate } from '@/utils/formatters'
import { getOrderStatusColor } from '@/utils/helpers'

interface OrderCardProps {
  order: Order
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Order #{order.id}</h3>
          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-indigo-600">{formatPrice(order.total_amount)}</p>
          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-2">Items:</h4>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product?.name || `Product #${item.product_id}`} x {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}


