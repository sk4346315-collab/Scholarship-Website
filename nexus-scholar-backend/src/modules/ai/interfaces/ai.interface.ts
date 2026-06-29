export interface ExtractionResult {
  name:                   string
  hostCountry?:           string
  hostCountryCode?:       string
  hostUniversity?:        string
  degreeLevel?:           string[]
  fieldsOfStudy?:         string[]
  fundingType?:           string
  coversTuition?:         boolean
  coversStipend?:         boolean
  coversAccommodation?:   boolean
  coversAirfare?:         boolean
  monthlyStipendAmount?:  number
  monthlyStipendCurrency?: string
  requiresIelts?:         boolean
  requiresToefl?:         boolean
  acceptsMoi?:            boolean
  acceptsEnglishCert?:    boolean
  ieltsMinScore?:         number
  eligibleNationalities?: string[]
  applicationDeadline?:   string
  officialSourceUrl?:     string
  applicationUrl?:        string
  dataConfidenceScore?:   number
  csRelevant?:            boolean
  csRelevanceScore?:      number
  tier?:                  string
  ieltsNote?:             string
  keyBenefit?:            string
}

export interface VerificationResult {
  verified:      boolean
  confidence:    number
  notes:         string
  deadline?:     string | null
  ieltsRequired?: boolean
  acceptsMoi?:   boolean
}
