import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getOpenRouter, STORY_MODEL } from '@/lib/ai/client'
import { buildSystemPrompt, buildScenePrompt } from '@/lib/ai/prompts'
import type { Scene, Character, StoryMoment, StatDelta } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { characterId, chosenAction, statDelta } = body as {
      characterId: string
      chosenAction?: string
      statDelta?: StatDelta
    }

    if (!characterId) {
      return NextResponse.json({ error: 'characterId is required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // 1. Fetch character
    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single()

    if (charError || !character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // 2. Apply stat delta from previous choice (if any)
    if (statDelta && chosenAction) {
      const updatedStats = {
        mood: clamp((character.mood ?? 80) + (statDelta.mood ?? 0)),
        energy: clamp((character.energy ?? 80) + (statDelta.energy ?? 0)),
        hunger: clamp((character.hunger ?? 80) + (statDelta.hunger ?? 0)),
        happiness: clamp((character.happiness ?? 80) + (statDelta.happiness ?? 0)),
      }

      await supabase
        .from('characters')
        .update({ ...updatedStats, updated_at: new Date().toISOString() })
        .eq('id', characterId)

      Object.assign(character, updatedStats)
    }

    // 3. Fetch recent story history (last 5 moments)
    const { data: history } = await supabase
      .from('story_moments')
      .select('*')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentHistory: StoryMoment[] = (history ?? []).reverse()

    // 4. Record the previous choice as a story moment (if any)
    if (chosenAction && recentHistory.length > 0) {
      await supabase
        .from('story_moments')
        .update({ chosen_action: chosenAction, stat_delta: statDelta ?? {} })
        .eq('id', recentHistory[recentHistory.length - 1].id)
    }

    // 5. Generate next scene via OpenRouter
    const systemPrompt = buildSystemPrompt(character as Character)
    const userPrompt = buildScenePrompt({
      character: character as Character,
      recentHistory,
      lastChoice: chosenAction,
    })

    const completion = await getOpenRouter().chat.completions.create({
      model: STORY_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 502 })
    }

    let scene: Scene
    try {
      scene = JSON.parse(raw) as Scene
      // Validate structure
      if (!scene.scene || !scene.emotion || !Array.isArray(scene.choices) || scene.choices.length !== 3) {
        throw new Error('Invalid scene structure')
      }
    } catch {
      console.error('Failed to parse AI response:', raw)
      return NextResponse.json({ error: 'AI returned invalid response' }, { status: 502 })
    }

    // 6. Save new story moment (without chosen_action yet — will be filled on next call)
    await supabase.from('story_moments').insert({
      character_id: characterId,
      scene_text: scene.scene,
      emotion: scene.emotion,
      chosen_action: null,
      stat_delta: {},
    })

    // 7. Increment scene count and check evolution
    const newSceneCount = (character.scene_count ?? 0) + 1
    const newStage = getEvolutionStage(newSceneCount)

    await supabase
      .from('characters')
      .update({
        scene_count: newSceneCount,
        evolution_stage: newStage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', characterId)

    return NextResponse.json({
      scene,
      updatedCharacter: {
        ...character,
        scene_count: newSceneCount,
        evolution_stage: newStage,
      },
    })
  } catch (err) {
    console.error('POST /api/story error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function getEvolutionStage(sceneCount: number): 0 | 1 | 2 | 3 {
  if (sceneCount >= 75) return 3
  if (sceneCount >= 30) return 2
  if (sceneCount >= 10) return 1
  return 0
}
