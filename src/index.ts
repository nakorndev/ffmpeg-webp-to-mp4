import { program } from '@commander-js/extra-typings'
import { ofetch } from 'ofetch'
import { mkdir, readdir, rm, writeFile } from 'fs/promises'
import { execSync } from 'child_process'

const options = program
  .requiredOption('-u, --url <url>', 'get webp from url convert to mp4')
  .requiredOption('-o, --output <path>', 'output path')
  .parse(process.argv)
  .opts()

const { url, output } = options

async function run() {
  const tempInput = '_temp_input.webp'
  const tempDir = '_temp_input'
  try {
    console.log('Downloading file...')
    const arrayBuffer = await ofetch(url, {
      responseType: 'arrayBuffer'
    })
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(tempInput, buffer)
    console.log('Extract file...')
    await mkdir(tempDir, { recursive: true })
    execSync(`magick convert "${tempInput}" "${tempDir}/frame_%05d.png"`)
    console.log('Converting file...')
    execSync(`ffmpeg -r 25 -i "${tempDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -y "${output}"`)
    console.log('Conversion completed successfully')
  } catch (error) {
    console.error(error)
  } finally {
    // await rm(tempInput)
    // await rm(tempDir)
  }
}

run()
