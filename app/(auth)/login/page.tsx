import { redirect } from 'next/navigation'

// Login sahifasi vaqtincha o'chirilgan - marketplace ga yo'naltiriladi
export default function LoginPage() {
  redirect('/marketplace')
}
