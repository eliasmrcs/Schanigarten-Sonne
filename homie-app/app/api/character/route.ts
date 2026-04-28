import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { PersonalityTrait } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, personalityTrait } = body as {
      name: string
      personalityTrait: PersonalityTrait
    }

    if (!name?.trim() || !personalityTrait) {
      return NextResponse.json({ error: 'name and personalityTrait are required' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seed = `${name.trim().toLowerCase()}-${personalityTrait}-${Date.now().toString(36)}`

    const { data: character, error } = await supabase
      .from('characters')
      .insert({
        user_id: user.id,
        name: name.trim(),
        sprite_seed: seed,
        personality_trait: personalityTrait,
      })
      .select()
      .single()

    if (error) {
      console.error('Character creation error:', error)
      return NextResponse.json({ error: 'Failed to create character' }, { status: 500 })
    }

    return NextResponse.json(character, { status: 201 })
  } catch (err) {
    console.error('POST /api/character error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: character, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    return NextResponse.json(character)
  } catch (err) {
    console.error('GET /api/character error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
