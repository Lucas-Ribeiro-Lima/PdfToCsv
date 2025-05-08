export type yPosition = number

export type PdfLineCharacters = { 
  xPosition: number, 
  character: string 
}[]

export type PdfLinesT = Record<yPosition, PdfLineCharacters>

export type TotalsT = Record<string, string>

export type EnterpriseCodesT = "37" | "107" | "113" | "123"

export type ParsedDataT = Record<string, string>

export type DecendioT = 1 | 2 | 3