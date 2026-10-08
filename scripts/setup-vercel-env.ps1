# إضافة متغيرات Vercel الجديدة للوحة التحكم (شغّله مرة واحدة من مجلد المشروع)
#   powershell -ExecutionPolicy Bypass -File scripts\setup-vercel-env.ps1
# يضيف فقط المتغيرات الناقصة، ولا يغيّر أي متغير موجود.

$ErrorActionPreference = "Continue"
Set-Location (Split-Path $PSScriptRoot)
$Project = "somecare111"
$Scope = "hs-projects-07b2e19e"
$Targets = @("production", "preview")

function Say($t, $c = "Gray") { Write-Host $t -ForegroundColor $c }
function NewSecret {
  $b = New-Object byte[] 48
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  return [Convert]::ToBase64String($b)
}

# 1) تسجيل الدخول وربط المشروع
vercel whoami *> $null
if ($LASTEXITCODE -ne 0) {
  Say "سجّل الدخول إلى Vercel في المتصفح الذي سيفتح..." Yellow
  vercel login
  if ($LASTEXITCODE -ne 0) { Say "لم يتم تسجيل الدخول." Red; exit 1 }
}
vercel link --yes --project $Project --scope $Scope *> $null
if ($LASTEXITCODE -ne 0) { Say "تعذر ربط المشروع $Project. تأكد أنك في مجلد المشروع وأن الحساب صحيح." Red; exit 1 }

$existing = (vercel env ls production 2>$null | Out-String)
function Has($name) { return $existing -match "(?m)^\s*$name\s" }

function AddVar($name, $value, [switch]$Config) {
  foreach ($t in $Targets) {
    if ($Config) { vercel env add $name $t --value $value --no-sensitive --yes --force *> $null }
    else { vercel env add $name $t --value $value --sensitive --yes --force *> $null }
    if ($LASTEXITCODE -ne 0) { Say "  تعذر إضافة $name إلى $t" Red; return $false }
  }
  Say "  ✓ $name" Green
  return $true
}

$changed = $false
Say "`nالمتغيرات:" Cyan

# 2) مفتاح الجلسة
if (Has "AUTH_SECRET") { Say "  موجود: AUTH_SECRET" } else { if (AddVar "AUTH_SECRET" (NewSecret)) { $changed = $true } }

# 3) مفتاح تشفير المشاريع: يُنسخ لك مرة واحدة لتحفظه
if (Has "VAULT_KEY") { Say "  موجود: VAULT_KEY (لا تغيّره)" }
else {
  $vault = NewSecret
  if (AddVar "VAULT_KEY" $vault) {
    $changed = $true
    Set-Clipboard -Value $vault
    Say "`n  !!! تم نسخ VAULT_KEY إلى الحافظة. الصقه الآن في مدير كلمات المرور واحفظه." Yellow
    Say "  بدونه لا يمكن فتح مفاتيح المشاريع إذا ضاع من Vercel." Yellow
    Read-Host "  اضغط Enter بعد أن تحفظه" | Out-Null
    Set-Clipboard -Value " "
  }
}

# 4) مرسل الإيميلات
if (Has "MAIL_FROM") { Say "  موجود: MAIL_FROM" } else { if (AddVar "MAIL_FROM" "المطوّر حسن <noreply@hassandev.sa>" -Config) { $changed = $true } }

# 5) مفاتيح الخدمات (تلصقها أنت هنا، ولا تظهر في أي مكان آخر)
function AskKey($name, $help) {
  if (Has $name) { Say "  موجود: $name"; return }
  Say "`n  $help" DarkGray
  $k = Read-Host "  الصق $name (أو Enter للتخطي)"
  $k = "$k".Trim()
  if ($k) { if (AddVar $name $k) { $script:changed = $true } } else { Say "  تخطّي $name" }
}
AskKey "RESEND_API_KEY" "resend.com ← Domains ← أضف hassandev.sa ووثّقه، ثم API Keys ← Create (Sending access)."
AskKey "ELEVENLABS_API_KEY" "elevenlabs.io ← Developers ← API Keys ← Create (Speech to Text + Text to Speech + Voices)."
AskKey "ANTHROPIC_API_KEY" "console.anthropic.com ← API Keys (إن لم يكن مضافاً من قبل)."

# 6) المخزن الخاص: من لوحة Vercel فقط (يحتاج بادئة مخصصة)
$existing = (vercel env ls production 2>$null | Out-String)
if (Has "PRIVATE_BLOB_READ_WRITE_TOKEN") { Say "  موجود: المخزن الخاص" }
else {
  Say "`n  باقي خطوة واحدة في المتصفح (المخزن الخاص للعقود والفواتير):" Yellow
  Say "  Storage ← Create Database ← Blob ← Private ← Create" Yellow
  Say "  ثم Connect Project ← افتح Advanced Options ← اكتب البادئة: PRIVATE_BLOB ← Connect" Yellow
  Start-Process "https://vercel.com/$Scope/$Project/stores"
  Read-Host "  اضغط Enter بعد الربط" | Out-Null
  $existing = (vercel env ls production 2>$null | Out-String)
  if (Has "PRIVATE_BLOB_READ_WRITE_TOKEN") { Say "  ✓ المخزن الخاص مربوط" Green; $changed = $true }
  else { Say "  لم أجد PRIVATE_BLOB_READ_WRITE_TOKEN بعد. تأكد من البادئة PRIVATE_BLOB." Red }
}

# 7) إعادة النشر حتى تعمل المتغيرات
if ($changed) {
  Say "`nإعادة نشر الموقع..." Cyan
  vercel redeploy https://www.hassandev.sa
  if ($LASTEXITCODE -ne 0) {
    Say "افتح Deployments ← آخر نشر ← ⋯ ← Redeploy" Yellow
    Start-Process "https://vercel.com/$Scope/$Project/deployments"
  }
}
Say "`nانتهى. افتح لوحة التحكم ← الدليل لترى حالة كل خدمة." Green
