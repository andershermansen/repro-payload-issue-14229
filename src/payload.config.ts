import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
  endpoints: [
    {
      handler: () => {
        return Response.json({
          message: 'Hello from the custom endpoint!',
          time: new Date().toISOString(),
        })
      },
      path: '/hello',
      method: 'get',
    },
  ],
  jobs: {
    tasks: [{
      slug: 'testjob',
      schedule: [
        {
          cron: '*/10 * * * * *',
          queue: 'second',
        },
      ],
      retries: 0,
      handler: async () => {
        const url = 'http://127.0.0.1:3000/api/hello'
        const response = await fetch(url, { cache: 'no-cache' })
        const res = await response.json()
        console.log(res)
        return res
      }
    }],
    autoRun: [
      {
        cron: '* * * * * *',
        limit: 100,
        queue: 'second',
      },
    ],
  },
})
