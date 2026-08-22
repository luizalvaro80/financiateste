import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  to: string
  message: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    if (req.method === 'POST') {
      const { action, billId } = await req.json()

      if (action === 'send_bill_reminder') {
        // Get user profile with WhatsApp number
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('whatsapp_number, full_name')
          .eq('id', user.id)
          .single()

        if (!profile?.whatsapp_number) {
          return new Response(
            JSON.stringify({ error: 'WhatsApp não configurado' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get bill details
        const { data: bill } = await supabaseClient
          .from('bills')
          .select('*')
          .eq('id', billId)
          .eq('user_id', user.id)
          .single()

        if (!bill) {
          return new Response(
            JSON.stringify({ error: 'Conta não encontrada' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Format message
        const dueDate = new Date(bill.due_date).toLocaleDateString('pt-BR')
        const amount = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(bill.amount)

        const message = `🔔 *Lembrete de Conta*\n\n` +
          `Olá ${profile.full_name}!\n\n` +
          `Você tem uma conta vencendo:\n\n` +
          `📄 **${bill.description}**\n` +
          `💰 Valor: ${amount}\n` +
          `📅 Vencimento: ${dueDate}\n\n` +
          `Não esqueça de efetuar o pagamento!\n\n` +
          `_Enviado pelo seu FinanceApp_ 💙`

        // Here you would integrate with a WhatsApp API service
        // For example: Evolution API, Twilio, or another WhatsApp Business API
        
        const whatsappApiUrl = Deno.env.get('WHATSAPP_API_URL')
        const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY')

        if (!whatsappApiUrl || !whatsappApiKey) {
          console.log('WhatsApp API not configured, logging message instead:')
          console.log(`To: ${profile.whatsapp_number}`)
          console.log(`Message: ${message}`)
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Notificação registrada (API do WhatsApp não configurada)' 
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Example integration with Evolution API
        const whatsappResponse = await fetch(`${whatsappApiUrl}/message/sendText`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': whatsappApiKey,
          },
          body: JSON.stringify({
            number: profile.whatsapp_number,
            text: message
          })
        })

        if (!whatsappResponse.ok) {
          throw new Error('Falha ao enviar mensagem WhatsApp')
        }

        // Log the notification
        await supabaseClient
          .from('notification_logs')
          .insert({
            user_id: user.id,
            bill_id: billId,
            type: 'whatsapp',
            status: 'sent',
            message: message,
            recipient: profile.whatsapp_number
          })

        return new Response(
          JSON.stringify({ success: true, message: 'Notificação enviada com sucesso!' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (action === 'check_due_bills') {
        // Check for bills due in the next 3 days
        const today = new Date()
        const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000))
        
        const { data: dueBills } = await supabaseClient
          .from('bills')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_paid', false)
          .gte('due_date', today.toISOString())
          .lte('due_date', threeDaysFromNow.toISOString())

        if (!dueBills || dueBills.length === 0) {
          return new Response(
            JSON.stringify({ message: 'Nenhuma conta vencendo nos próximos 3 dias' }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Send notifications for each due bill
        const notifications = []
        for (const bill of dueBills) {
          const response = await fetch(req.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': req.headers.get('Authorization')!,
            },
            body: JSON.stringify({
              action: 'send_bill_reminder',
              billId: bill.id
            })
          })
          
          if (response.ok) {
            notifications.push(`Notificação enviada para conta: ${bill.description}`)
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            notifications,
            count: dueBills.length 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Ação não suportada' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in whatsapp-notifications function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})