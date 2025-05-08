import { readdir } from "fs/promises"
import { env } from "../conf/env"
import { ConsoleLogger } from "../console"
import { DecendioT, EnterpriseCodesT } from "../types"
import { DirectoryInvalidError } from "../errors"

const validEnterpriseCodes: Set<string> = new Set(["37", "107", "113", "123"])

export function isEnterpriseCode(code: string): code is EnterpriseCodesT {
  return validEnterpriseCodes.has(code)
}

export function validateEnterpriseCode(code: string | undefined | null): EnterpriseCodesT | undefined {
  if (typeof code !== "string") return undefined
  return isEnterpriseCode(code) ? code : undefined
}

const validDecendios: Set<number> = new Set([0, 1, 2]) //Reduce one to match array indexes

export function isValidDecendio(num: unknown): num is DecendioT {
  if(typeof num !== "number") return false
  return validDecendios.has(num)
}

export async function verifyDirectory(): Promise<number> {
  try {
    const dir = await readdir(env.pdfDirPath)
    
    const err = new DirectoryInvalidError()
    if(dir[0] !== "01 A 10") err.push(dir[0])
    if(dir[1] !== "11 A 20") err.push(dir[1])
    if(dir[2] !== "21 A 30" && dir[2] !== "21 A 31") err.push(dir[2])

    if(err.hasError()) throw err

    return 0
  } catch (error) {
    if(!(error instanceof DirectoryInvalidError)) return 1  
    const RED = '\x1b[31m'
    const YELLOW = '\x1b[33m'
    const CYAN = '\x1b[36m'
    const RESET = '\x1b[0m'
    const BOLD = '\x1b[1m'
    const msg = `
      ${RED}${BOLD}ERROR - ESTRUTURA DO DIRETÓRIO INVÁLIDA${RESET}
      ├── ${RED}${error.dirErr[0] ?? "01 A 10"}${RESET}
      ├── ${RED}${error.dirErr[1] ?? "11 A 20"}${RESET}
      ├── ${RED}${error.dirErr[2] ?? "21 A 31"}${RESET}

      ${YELLOW}Estrutura esperada:${RESET}
      ${CYAN}Decendial/${RESET}
      ├── ${CYAN}01 A 10/${RESET}
      │   └── RelatorioCOMPPRODQUILOMETRICAPDF{empresa}.pdf
      ├── ${CYAN}11 A 20/${RESET}
      │   └── RelatorioCOMPPRODQUILOMETRICAPDF{empresa}.pdf
      ├── ${CYAN}21 A 30/${RESET} ou ${CYAN}21 A 31/${RESET}
      │   └── RelatorioCOMPPRODQUILOMETRICAPDF{empresa}.pdf
      ├── ${CYAN}Output.xlsx${RESET}
      └── ${YELLOW}app.exe${RESET}
    `
    ConsoleLogger.log(msg, "default")
    return 1
  }
}