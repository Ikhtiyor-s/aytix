import { redirect } from 'next/navigation'

// Register sahifasi vaqtincha o'chirilgan - marketplace ga yo'naltiriladi
export default function RegisterPage() {
  redirect('/marketplace')
}
