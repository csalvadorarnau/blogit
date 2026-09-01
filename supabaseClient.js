import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Faltan las variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env y rellena los valores de tu proyecto de Supabase.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const TOPICS = ['Moda', 'Fotografía', 'Comida', 'Superhéroes', 'Viajes']

export const POST_IMAGES_BUCKET = 'post-images'
