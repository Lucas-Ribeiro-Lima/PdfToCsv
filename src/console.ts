import { stdin, stdout } from 'process'
import { createInterface, Interface } from 'readline'
import { isValidOption } from './utils/validate'
import { MenuOptionsT } from './types'

type ConsoleLoggerColorT = "red" | "green" | "yellow" | "cyan" | "default"

const question = (q: string, rl: Interface) => new Promise<string>(res => rl.question(ConsoleLogger.cyan(q), res))

export const ConsoleLogger = {
  red: (msg: string) => `\x1b[31m${msg}\x1b[0m`,   
  green: (msg: string) => `\x1b[32m${msg}\x1b[0m`,   
  yellow: (msg: string) => `\x1b[33m${msg}\x1b[0m`, 
  cyan: (msg: string) => `\x1b[36m${msg}\x1b[0m`,  
  default: (msg: string) => `\x1b[0m${msg}`, 
  log: (msg: string, color: ConsoleLoggerColorT) => console.log(ConsoleLogger[color](msg))
}


export async function consoleMenu() {
  const rl = createInterface({
    input: stdin,
    output: stdout
  })

  try {
    ConsoleLogger.log("──── Produção Quilometrica para Xlsx ────", "cyan")
    ConsoleLogger.log("────────── Selecione o Decêndio ─────────", "cyan")
    ConsoleLogger.log("Opções:", 'yellow')
    ConsoleLogger.log("1\x1b[0m - Primeiro Decêndio", 'green')
    ConsoleLogger.log("2\x1b[0m - Segundo Decêndio", 'green')
    ConsoleLogger.log("3\x1b[0m - Terceiro Decêndio", "green")
    ConsoleLogger.log("4\x1b[0m - Sair\n", "cyan")

    const option = Number(await question("Digite uma opção (1, 2, 3, 4): ", rl)) - 1

    if (!isValidOption(option)) throw new Error("INVALID_OPTION")
      
    if(option !== 3) ConsoleLogger.log(`\nVocê selecionou o decêndio: \x1b[0m${option + 1}\n`, "yellow")
      
    return option as MenuOptionsT
  } catch (error) {
    ConsoleLogger.log("Opção inválida! Por favor, escolha 1, 2, 3 ou 4", "red")
    return 3
  } finally {
    rl.close()
  }
}

type ConsoleLoadingAnimationT = {
  loadingMsg: string,
  finishMsg: string
}

export function consoleLoadingAnimation({ loadingMsg, finishMsg }: ConsoleLoadingAnimationT) {
  let dots = 0
  
  const interval = setInterval(() => {
    process.stdout.clearLine(0) 
    process.stdout.cursorTo(0)
    const dotsStr = '.'.repeat(dots)
    process.stdout.write(`${loadingMsg}${dotsStr}`) 
    dots = (dots + 1) % 4 
  }, 175)

  return () => {
    clearInterval(interval)  // Para a animação
    console.log(finishMsg)
  }
}

export async function endConsole(message = "Pressione ENTER para sair...") {
  const rl = createInterface({
    input: stdin,
    output: stdout
  })

  await question(message, rl)
  rl.close()
}