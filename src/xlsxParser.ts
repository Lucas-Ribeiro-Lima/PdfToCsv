import { join } from "path"
import { utils, writeFile } from "xlsx"
import { env } from "./conf/env"
import { DecendioT, EnterpriseCodesT, ParsedDataT } from "./types"

type WriteToXLSXT = {
  data: IterableIterator<[EnterpriseCodesT, ParsedDataT[]]>,
  decendio: DecendioT
}

export async function writeToXLSX({data, decendio}: WriteToXLSXT) {
  const outputPath = join(env.excelPath, `output ${String(decendio + 1)}° decêndio.xlsx`)

  try {
    const workbook = utils.book_new()

    for (const [enterpriseCode, parsedData] of data) {
      const worksheet = utils.json_to_sheet(parsedData)
      utils.book_append_sheet(workbook, worksheet, enterpriseCode)
    }
    writeFile(workbook, outputPath)
    console.log("\x1b[32m✔️ Arquivo salvo com sucesso!\x1b[0m")
  } catch (error) {
    console.error("\x1b[31m❌ Erro ao salvar o arquivo!\x1b[0m")
  }
}
