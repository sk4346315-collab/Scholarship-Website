export interface UserProfile {
  id:                string
  email:             string
  fullName:          string | null
  nationality:       string | null
  currentCountry:    string | null
  highestEducation:  string | null
  currentGpa:        number | null
  hasIelts:          boolean
  ieltsScore:        number | null
  hasMoi:            boolean
  hasEnglishCert:    boolean
  preferredCountries: string[]
  preferredFields:   string[]
  plan:              string
  createdAt:         Date
  lastLoginAt:       Date | null
}
