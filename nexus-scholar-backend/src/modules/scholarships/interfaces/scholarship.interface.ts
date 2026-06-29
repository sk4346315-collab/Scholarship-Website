export interface ScholarshipSummary {
  id:                 string
  name:               string
  slug:               string
  hostCountry:        string | null
  hostCountryCode:    string | null
  hostUniversity:     string | null
  fundingType:        string
  requiresIelts:      boolean
  acceptsMoi:         boolean
  monthlyStipendAmount: number | null
  monthlyStipendCurrency: string | null
  applicationDeadline: Date | null
  suitabilityScore:   number | null
  dataConfidenceScore: number
  tier:               string
  competitivenessLevel: string | null
  officialSourceUrl:  string
  ieltsNote:          string | null
  keyBenefit:         string | null
}

export interface ScholarshipFilter {
  ieltsRequired?:     boolean
  acceptsMoi?:        boolean
  acceptsEnglishCert?: boolean
  fundingTypes?:      string[]
  countries?:         string[]
  fields?:            string[]
  tiers?:             string[]
  minSuitabilityScore?: number
  minConfidenceScore?:  number
  deadlineAfter?:     Date
  deadlineBefore?:    Date
}
