export interface Paginated<T> {
  items:  T[]
  total:  number
  page:   number
  pages:  number
  limit:  number
}

export interface ApiResponse<T = unknown> {
  data:    T
  message: string
  success: boolean
}
