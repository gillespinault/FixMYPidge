import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Vérifie la signature/secret depuis n8n
    const secret = request.headers.get('x-webhook-secret')
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { event, case_id, message, status_update } = body

    if (event === 'expert_message' && case_id && message) {
      // Ajoute un message d'expert
      const { error } = await supabase
        .from('messages')
        .insert({
          case_id,
          content: message.content,
          sender_type: 'expert' as const,
          sender_id: message.expert_id || 'unknown'
        })

      if (error) throw error

      // Met à jour le statut si fourni
      if (status_update) {
        const { error: statusError } = await supabase
          .from('cases')
          .update({ 
            status: status_update,
            updated_at: new Date().toISOString()
          })
          .eq('id', case_id)

        if (statusError) throw statusError
      }

      return NextResponse.json({ success: true })
    }

    if (event === 'case_status_update' && case_id && status_update) {
      // Met à jour uniquement le statut
      const { error } = await supabase
        .from('cases')
        .update({ 
          status: status_update,
          updated_at: new Date().toISOString()
        })
        .eq('id', case_id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })

  } catch (error) {
    console.error('N8N response webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}