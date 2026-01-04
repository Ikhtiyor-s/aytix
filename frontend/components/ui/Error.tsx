'use client'

interface ErrorProps {
  message: string
  onDismiss?: () => void
}

export default function Error({ message, onDismiss }: ErrorProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-0 right-0 mt-2 mr-2 text-red-700 hover:text-red-900"
        >
          <span className="text-xl">&times;</span>
        </button>
      )}
      <p>{message}</p>
    </div>
  )
}


