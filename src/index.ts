import { consoleMenu, endConsole } from "./console";
import { pdfParser } from "./pdfParser";
import { verifyDirectory } from "./utils/validate";

async function main() {
  const errDir = await verifyDirectory()

  if(errDir) return

  const decendio = await consoleMenu()
  if(decendio === 4) return 0

  await pdfParser(decendio)

  await endConsole()
  
  return 0
}

main()
