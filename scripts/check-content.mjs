import { contentPlan } from '../src/data/contentPlan.js'
import { checkPlan } from '../src/lib/checkAgent.js'

const report = checkPlan(contentPlan)
const stops = report.days.flatMap((day) => day.issues.filter((issue) => issue.level === 'stop').map((issue) => `${day.day}: ${issue.text}`))
console.log(`Агент проверки: ${report.ok} чисто, ${report.fix} поправить, ${report.stop} стоп из ${report.total}`)
for (const line of stops) console.log('STOP', line)
if (stops.length) process.exit(1)
