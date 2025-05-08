import { consoleMenu, endConsole } from "./console";
import { pdfParser } from "./pdfParser";
import { MenuOptionsT } from "./types";
import { verifyDirectory } from "./utils/validate";

async function main() {
  const errDir = await verifyDirectory()
  if(errDir) return

  let decendio: MenuOptionsT = 0

  while(decendio < 3) {
    decendio = await consoleMenu()

    if(decendio === 3 || decendio > 3) break
  
    await pdfParser(decendio)
  }
  await endConsole()
  return 0
}

main()
