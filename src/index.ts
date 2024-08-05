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
  const tempWebp = '_temp_input.webp'
  const tempGif = '_temp_input.gif'
  const tempMp4 = '_temp_input.mp4'
  try {
    console.log('Downloading file...')
    const arrayBuffer = await ofetch(url, {
      responseType: 'arrayBuffer'
    })
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(tempWebp, buffer)
    console.log('Convert to GIF file...')
    execSync(`magick convert -format gif ${tempWebp} ${tempGif}`)
    console.log('Convert to MP4 file...')
    execSync(`ffmpeg -i ${tempGif} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -y ${tempMp4}`)
    execSync(`ffmpeg -stream_loop 50 -i ${tempMp4} -c copy -y ${output}`)
    console.log('Conversion completed successfully')
  } catch (error) {
    console.error(error)
  } finally {
    await rm(tempWebp)
    await rm(tempGif)
  }
}

run()
