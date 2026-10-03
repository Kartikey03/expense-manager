#!/usr/bin/env python3
"""
Kiwi-branded Supabase Auth email templates (sign-in link, confirm, reset, ...).

Supabase only lets free-tier projects customise templates once a custom SMTP
provider is configured (Dashboard → Authentication → Emails → SMTP Settings).
After that, apply these with:

    SUPABASE_ACCESS_TOKEN=sbp_... python3 scripts/email_templates.py --apply

Other flags:
    --preview DIR   write HTML previews (placeholder link/code) to DIR
"""
import argparse, html, json, os, sys, urllib.request

PROJECT_REF = "pxyuilhuahoabmtwksua"

LOGO = "https://kiwi-money.vercel.app/kiwi-icon.png"
SITE = "https://kiwi-money.vercel.app"
FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Helvetica,Arial,sans-serif"

def email(preheader, heading, body_html, button=None, after=None, note=None):
    btn = ""
    if button:
        label, href = button
        btn = f"""
          <tr><td align="center" style="padding:28px 0 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td align="center" bgcolor="#7ccc6a" style="border-radius:12px;">
                <a href="{href}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:{FONT};font-size:16px;font-weight:600;line-height:20px;color:#06200f;text-decoration:none;border-radius:12px;">{label}</a>
              </td>
            </tr></table>
          </td></tr>"""
    after_html = f'<tr><td style="padding-top:20px;font-family:{FONT};font-size:13px;line-height:20px;color:#6e6e73;text-align:center;">{after}</td></tr>' if after else ""
    note_html = f'<tr><td style="height:28px;line-height:28px;font-size:0;">&nbsp;</td></tr><tr><td style="padding-top:20px;border-top:1px solid #e5e5ea;font-family:{FONT};font-size:13px;line-height:20px;color:#86868b;text-align:center;">{note}</td></tr>' if note else ""
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>{html.escape(heading)}</title></head>
<body style="margin:0;padding:0;background-color:#f5f5f7;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f5f5f7;">{preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f7" style="background-color:#f5f5f7;">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
      <tr><td align="center" style="padding-bottom:20px;">
        <img src="{LOGO}" width="56" height="56" alt="Kiwi" style="display:block;width:56px;height:56px;border:0;border-radius:13px;">
      </td></tr>
      <tr><td bgcolor="#ffffff" style="background-color:#ffffff;border-radius:18px;padding:36px 32px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="font-family:{FONT};font-size:24px;line-height:30px;font-weight:600;color:#1d1d1f;text-align:center;letter-spacing:-0.3px;">{heading}</td></tr>
          <tr><td style="padding-top:12px;font-family:{FONT};font-size:16px;line-height:24px;color:#424245;text-align:center;">{body_html}</td></tr>{btn}{after_html}{note_html}
        </table>
      </td></tr>
      <tr><td align="center" style="padding-top:20px;font-family:{FONT};font-size:12px;line-height:18px;color:#86868b;">
        <a href="{SITE}" style="color:#86868b;text-decoration:none;font-weight:600;">Kiwi</a> &middot; Your income, expenses &amp; investments in one place.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>"""

link_fallback = 'Button not working? Copy this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color:#3a8a2e;word-break:break-all;">{{ .ConfirmationURL }}</a>'
ignore = "If you didn't request this, you can safely ignore this email."

T = {
  "magic_link": ("Sign in to Kiwi", email(
      "Your one-time sign-in link for Kiwi.", "Sign in to Kiwi",
      "Tap the button below to sign in. This link works once and expires in 1 hour.",
      ("Sign in to Kiwi", "{{ .ConfirmationURL }}"), link_fallback,
      "If you didn't try to sign in, you can safely ignore this email — your account is still secure.")),
  "confirmation": ("Confirm your email for Kiwi", email(
      "Confirm your email to finish setting up Kiwi.", "Confirm your email",
      "Confirm <strong>{{ .Email }}</strong> to finish setting up your Kiwi account.",
      ("Confirm Email", "{{ .ConfirmationURL }}"), link_fallback, ignore)),
  "recovery": ("Reset your Kiwi password", email(
      "Choose a new password for Kiwi.", "Reset your password",
      "We received a request to reset the password for your Kiwi account. Tap the button below to choose a new one.",
      ("Reset Password", "{{ .ConfirmationURL }}"), link_fallback, ignore)),
  "email_change": ("Confirm your new email for Kiwi", email(
      "Confirm the change to your Kiwi email address.", "Confirm your new email",
      "Confirm that you want to change your Kiwi email from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>.",
      ("Confirm New Email", "{{ .ConfirmationURL }}"), link_fallback, ignore)),
  "invite": ("You're invited to Kiwi", email(
      "You've been invited to Kiwi.", "You're invited to Kiwi",
      "You've been invited to create a Kiwi account. Tap the button below to accept.",
      ("Accept Invite", "{{ .ConfirmationURL }}"), link_fallback, ignore)),
  "reauthentication": ("{{ .Token }} is your Kiwi verification code", email(
      "Your Kiwi verification code.", "Your verification code",
      'Enter this code in Kiwi to confirm it\'s you. It expires shortly.'
      '<div style="margin:24px auto 0;padding:16px 0;background-color:#f5f5f7;border-radius:12px;font-family:SFMono-Regular,Menlo,Consolas,monospace;font-size:32px;line-height:40px;font-weight:600;letter-spacing:8px;color:#1d1d1f;">{{ .Token }}</div>',
      None, None, ignore)),
  "password_changed_notification": ("Your Kiwi password was changed", email(
      "The password for your Kiwi account was changed.", "Your password was changed",
      "The password for your Kiwi account was just changed.",
      None, None, "If you didn't make this change, reset your password right away from the Kiwi sign-in screen.")),
  "email_changed_notification": ("Your Kiwi email was changed", email(
      "The email address for your Kiwi account was changed.", "Your email was changed",
      "The email address for your Kiwi account was changed from <strong>{{ .OldEmail }}</strong> to <strong>{{ .Email }}</strong>.",
      None, None, "If you didn't make this change, contact support right away.")),
}


def payload():
    p = {}
    for key, (subject, body) in T.items():
        p[f"mailer_subjects_{key}"] = subject
        p[f"mailer_templates_{key}_content"] = body
    return p


def apply():
    token = os.environ.get("SUPABASE_ACCESS_TOKEN")
    if not token:
        sys.exit("Set SUPABASE_ACCESS_TOKEN (a Supabase personal access token).")
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/config/auth",
        data=json.dumps(payload()).encode(),
        method="PATCH",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            print(f"Applied {len(T)} templates (HTTP {r.status}).")
    except urllib.error.HTTPError as e:
        sys.exit(f"Supabase rejected the update (HTTP {e.code}): {e.read().decode()}")


def preview(out):
    os.makedirs(out, exist_ok=True)
    for key, (subject, body) in T.items():
        sample = (body.replace("{{ .ConfirmationURL }}", SITE + "/auth/callback?code=preview")
                      .replace("{{ .Token }}", "482913")
                      .replace("{{ .Email }}", "you@example.com")
                      .replace("{{ .NewEmail }}", "new@example.com")
                      .replace("{{ .OldEmail }}", "old@example.com"))
        open(os.path.join(out, f"{key}.html"), "w").write(sample)
    print(f"Wrote {len(T)} previews to {out}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--preview", metavar="DIR")
    a = ap.parse_args()
    if a.preview:
        preview(a.preview)
    if a.apply:
        apply()
    if not (a.apply or a.preview):
        ap.print_help()
