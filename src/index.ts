import 'dotenv/config'
import { config } from './shared/config'
import { processMessageUnread } from './gmail'
import { processUpload } from './upload'

async function main() {
  if (config.stage.enabledMessageUnread)
    await processMessageUnread()

  if (config.stage.enabledUpload)
    await processUpload()
}

main()