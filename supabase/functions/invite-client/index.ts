import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── CORS ──────────────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ─── Email template ────────────────────────────────────────────────────────────

function buildEmail(coachName: string, magicLink: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your coach invited you to IronRoom</title>
</head>
<body style="margin:0;padding:0;background-color:#0D0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0D0D0D;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background-color:#141414;border:1px solid #2A2A2A;border-radius:12px;overflow:hidden;">
          <tr><td style="height:3px;background-color:#E8FF47;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td align="center" style="padding:40px 40px 32px 40px;border-bottom:1px solid #1F1F1F;">
              <div style="font-size:36px;font-weight:900;letter-spacing:-0.5px;line-height:1;text-transform:uppercase;">
                <span style="color:#F0F0F0;">Iron</span><span style="color:#E8FF47;">Room</span>
              </div>
              <div style="margin-top:8px;font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#666;">
                Track &middot; Progress &middot; Dominate
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:rgba(232,255,71,0.08);border:1px solid rgba(232,255,71,0.2);border-radius:6px;padding:10px 14px;">
                    <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E8FF47;line-height:1.2;">Coach Invite</p>
                    <p style="margin:4px 0 0 0;font-size:13px;color:#AAA;line-height:1.4;">${coachName} has added you to their roster</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#F0F0F0;letter-spacing:-0.3px;line-height:1.2;">You've been invited to IronRoom.</p>
              <p style="margin:0 0 32px 0;font-size:15px;color:#888;line-height:1.6;">
                Your coach has set up a program for you. Click below to create your account and get started &mdash; no password needed. This link expires in <strong style="color:#AAA;">24 hours</strong>.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:#0D0D0D;border:1px solid #2A2A2A;border-radius:8px;padding:20px;">
                    <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#555;">What to expect</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:#888;line-height:1.5;">&#8226;&nbsp; Set up your profile &mdash; name and role</p>
                    <p style="margin:0 0 8px 0;font-size:13px;color:#888;line-height:1.5;">&#8226;&nbsp; Your coach's program will be waiting for you</p>
                    <p style="margin:0;font-size:13px;color:#888;line-height:1.5;">&#8226;&nbsp; Log workouts, track meals, and monitor your progress</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr>
                  <td align="center">
                    <a href="${magicLink}" target="_blank"
                       style="display:inline-block;width:100%;max-width:360px;padding:18px 24px;background-color:#E8FF47;color:#0D0D0D;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;text-align:center;text-decoration:none;border-radius:8px;box-sizing:border-box;line-height:1;">
                      Accept Invite &amp; Sign In
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0 0;font-size:12px;color:#555;line-height:1.7;">Button not working? Copy and paste this link:</p>
              <p style="margin:4px 0 0 0;font-size:12px;line-height:1.6;word-break:break-all;">
                <a href="${magicLink}" style="color:#E8FF47;text-decoration:none;">${magicLink}</a>
              </p>
            </td>
          </tr>
          <tr><td style="height:1px;background-color:#1F1F1F;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">
                If you don't know ${coachName} or weren't expecting this invite, you can safely ignore this email. No account will be created.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 40px 32px 40px;border-top:1px solid #1A1A1A;">
              <p style="margin:0;font-size:11px;color:#444;text-align:center;letter-spacing:0.5px;">&copy; 2026 IronRoom</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Handler ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Auth header ────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    // ── 2. Verify calling user ─────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── 3. Verify coach role ───────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('user_profile')
      .select('display_name, role')
      .eq('user_id', user.id)
      .single()

    if (!profile || !['coach', 'both'].includes(profile.role)) {
      return json({ error: 'Only coaches can send invites' }, 403)
    }

    // ── 4. Parse request body ─────────────────────────────────────────────
    const { clientEmail } = await req.json()
    if (!clientEmail || typeof clientEmail !== 'string') {
      return json({ error: 'clientEmail is required' }, 400)
    }

    // ── 5. Generate magic link (admin client) ─────────────────────────────
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: clientEmail.trim(),
      options: { redirectTo: 'https://iron-room.vercel.app' },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('generateLink error:', linkError)
      return json({ error: 'Failed to generate magic link' }, 500)
    }

    // ── 6. Send via Resend ────────────────────────────────────────────────
    const coachName = profile.display_name || 'Your coach'
    const magicLink = linkData.properties.action_link

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'IronRoom <onboarding@resend.dev>',
        to: [clientEmail.trim()],
        subject: `${coachName} invited you to IronRoom`,
        html: buildEmail(coachName, magicLink),
      }),
    })

    if (!resendRes.ok) {
      const errText = await resendRes.text()
      console.error('Resend error:', errText)
      return json({ error: 'Failed to send email' }, 500)
    }

    return json({ success: true })

  } catch (err) {
    console.error('Unexpected error:', err)
    return json({ error: err.message ?? 'Internal error' }, 500)
  }
})
