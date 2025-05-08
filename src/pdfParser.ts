import { readdir } from "fs/promises";
import { join } from "path";
import PDFParser, { Output } from 'pdf2json';
import { env } from "./conf/env";
import { DecendioT, EnterpriseCodesT, ParsedDataT, PdfLineCharacters, PdfLinesT, TotalsT } from "./types";
import { validateEnterpriseCode } from "./utils/validate";
import { writeToXLSX } from "./xlsxParser";
import { consoleLoadingAnimation } from "./console";

export async function pdfParser(decendio: DecendioT) {
  const queue = new Map<EnterpriseCodesT, ParsedDataT[]>()

  const decendioDir = await readdir(env.pdfDirPath)
  const fullDecendioPath = join(join(env.pdfDirPath, decendioDir[decendio]))

  const dir = await readdir(fullDecendioPath)

  const cancelAnimation = consoleLoadingAnimation({
    loadingMsg: "\x1b[36mℹ️ Lendo Pdf",
    finishMsg: "\r\x1b[36mℹ️ Lendo Pdf... Concluído!\x1b[0m\n"

  })

  await Promise.all(dir.map(filePath => {
    if(!filePath.match(/RelatorioCOMPPRODQUILOMETRICAPDF\d{2,3}.pdf/)) return
    return new Promise<void>((resolve, reject) => {
      const fullPath = join(fullDecendioPath, filePath)
      const parser = new PDFParser()
      const codeMatch = filePath.match(/(?<code>\d{2,3}).pdf/)
      const enterpriseCode = validateEnterpriseCode(codeMatch?.groups?.["code"])
  
      if (!enterpriseCode) return reject(new Error("Enterprise code invalid"))
  
      parser.on("pdfParser_dataError", errData => reject(errData.parserError))
  
      parser.on("pdfParser_dataReady", async data => {
        const parsedData = await contentParser(data)
        queue.set(enterpriseCode, parsedData)
        resolve()
      })
  
      parser.loadPDF(fullPath)
    })
  }))

  cancelAnimation()
  writeToXLSX({ data: queue.entries(), decendio })
}

async function contentParser(data: Output) {
  let lines: string[] = []
  let totals: TotalsT[] = []

  for (let page of data.Pages) {
    const pdfLines: PdfLinesT = {}
    page.Texts.forEach(text => {
      const yPosition = parseFloat(text.y.toFixed(2))
      const xPosition = text.x
      const character = decodeURIComponent(text.R[0].T)

      if (!pdfLines[yPosition]) pdfLines[yPosition] = []
      pdfLines[yPosition].push({ xPosition, character })
    })

    const sortedPdfLines = alignYAxis(pdfLines)

    for (let [_, words] of sortedPdfLines) {
      const pdfLine = reconstructLine(words)

      if (/Grupo da Linha:/.test(pdfLine)) lines.push(getLinha(pdfLine))
      if (/^Total Grupo/.test(pdfLine)) totals.push(getTotais(pdfLine))
    }
  }

  return mergeLinesWithTotals(lines, totals)
}

function alignYAxis(pdfLines: PdfLinesT) {
  return Object.entries(pdfLines).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
}

function reconstructLine(words: PdfLineCharacters) {
  const reconstructedLine = words
    .sort((a, b) => a.xPosition - b.xPosition)
    .map(w => w.character)
    .join(' ')    
  return reconstructedLine
}

function getLinha(pdfLine: string) {
  const match = pdfLine.match(/Grupo da Linha:\s+(?<line>\d{2,4})/)
  if(!match?.groups) throw new Error("Linha não encontrada")

  const { line } = match.groups
  return line
}

function getTotais(pdfLine: string) {
  const values = pdfLine.match(/[\d.,]+|(?<!Total Grupo\s*)\s{2,4}/g) || []
  const labels = [
    "FRTE", "EXTPC1", "EXTPC2", "VGR1", "VGR2", "VGE1", "VGE2",
    "VGA1", "VGA2", "PQPC1", "PQPC2", "IMPROD", "TRANSF", "PQTOTAL"
  ]

  const totals = Object.fromEntries(labels.map((label, idx) => [label, values[idx]]))
  return totals
}

function mergeLinesWithTotals(lines: string[], totals: TotalsT[]): ParsedDataT[] {
  const result = []
  for(let idx = 0; idx < lines.length; idx++) {
    result[idx] = {
      line: lines[idx],
      ...totals[idx]
    }
  }
  return result 
}