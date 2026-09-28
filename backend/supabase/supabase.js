import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_API_KEY must be set in .env')
}


const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY)

export const PFP_BUCKET = process.env.SUPABASE_PFP_BUCKET
export const IMAGE_POST_BUCKET= process.env.SUPABASE_IMAGE_POST_BUCKET

// Surfaces a missing bucket at boot instead of on the first upload attempt.
export const verifyPfpBucket = async () => {
  const { data: buckets, error } = await supabase.storage.listBuckets()

  if (error) {
    throw new Error(`Could not list buckets: ${error.message}`)
  }

  const bucket = buckets.find((entry) => entry.name === PFP_BUCKET)

  if (!bucket) {
    throw new Error(
      `Bucket "${PFP_BUCKET}" does not exist. Create it in Supabase..`
    )
  }

  return bucket
}


//verifing is image post bucket exits
export const verifyImagePostBucket = async()=>{
  const {data: buckets, error}= await supabase.storage.listBuckets();

  if (error) {
    throw new Error(`Could not list buckets: ${error.message}`)
  }
  const bucket = buckets.find((entry)=>entry.name === IMAGE_POST_BUCKET);

   if (!bucket) {
    throw new Error(
      `Bucket "${PFP_BUCKET}" does not exist. Create it in Supabase..`
    )
  }

  return bucket
}

export { SUPABASE_URL }
export default supabase
