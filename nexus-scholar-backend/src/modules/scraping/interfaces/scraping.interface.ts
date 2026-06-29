export interface ScrapeResult {
  found:    number
  upserted: number
  changed:  boolean
  errors:   string[]
}

export interface SourceRegistryEntry {
  url:      string
  type:     string
  country:  string | null
  priority: number
  name:     string
}
