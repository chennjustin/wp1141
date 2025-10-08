import { useLocation, useParams, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useMovieContext } from '@/context/MovieContext'

export default function Breadcrumb() {
  const location = useLocation()
  const params = useParams()
  const { movies } = useMovieContext()

  const pathSegments = location.pathname.split('/').filter(Boolean)

  // 根據路徑生成 breadcrumbs
  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: '首頁', path: '/' }]

    if (pathSegments.length === 0) {
      return breadcrumbs
    }

    // 電影列表
    if (pathSegments[0] === 'movies') {
      breadcrumbs.push({ label: '電影列表', path: '/movies' })
    }

    // 電影詳情
    if (pathSegments[0] === 'movie' && params.id) {
      const movie = movies.find((m) => m.movie_id === params.id)
      breadcrumbs.push({ label: '電影列表', path: '/movies' })
      breadcrumbs.push({
        label: movie?.title || '電影詳情',
        path: `/movie/${params.id}`,
      })

      // 座位選擇
      if (pathSegments[2] === 'select-seat') {
        breadcrumbs.push({ label: '選擇座位', path: '' })
      }
    }

    // 購物車
    if (pathSegments[0] === 'cart') {
      breadcrumbs.push({ label: '購物車', path: '/cart' })
    }

    // 結帳
    if (pathSegments[0] === 'checkout') {
      breadcrumbs.push({ label: '購物車', path: '/cart' })
      breadcrumbs.push({ label: '結帳', path: '/checkout' })
    }

    // 歷史訂單
    if (pathSegments[0] === 'history') {
      breadcrumbs.push({ label: '歷史訂單', path: '/history' })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // 首頁不顯示 breadcrumb
  if (location.pathname === '/') {
    return null
  }

  return (
    <nav>
      <div>
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              )}
              {index === 0 && <Home className="h-4 w-4 mr-2 text-gray-500" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}

