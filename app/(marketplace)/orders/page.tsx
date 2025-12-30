import { redirect } from 'next/navigation'

// Orders sahifasi vaqtincha o'chirilgan - marketplace ga yo'naltiriladi
export default function OrdersPage() {
  redirect('/marketplace')
}
