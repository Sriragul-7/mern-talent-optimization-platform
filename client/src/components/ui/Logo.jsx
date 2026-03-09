import { useNavigate } from 'react-router-dom'
export default function Logo({ size = 'md' }) {
  const navigate = useNavigate()
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }
  return (
    <button onClick={() => navigate('/login')} className={`font-display font-bold ${sizes[size]} cursor-pointer select-none hover:opacity-80 transition-opacity`} style={{ letterSpacing: '-0.5px' }}>
      <span className="text-gray-900 dark:text-gray-100">Talent</span>
      <span className="text-blue-600">Opt</span>
    </button>
  )
}