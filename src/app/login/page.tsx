"use client"

import { Suspense, useEffect, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/i18n"

function LoginForm() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json() as Promise<{ hasUsers: boolean }>)
      .then((data) => {
        if (!data.hasUsers) router.replace("/setup")
        else setCheckingSetup(false)
      })
      .catch(() => setCheckingSetup(false))
  }, [router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        const next = searchParams.get("next") ?? "/"
        router.push(next)
        router.refresh()
      } else {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? t("login.error"))
      }
    } catch {
      setError(t("login.networkError"))
    } finally {
      setLoading(false)
    }
  }

  if (checkingSetup) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lock className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {t("login.title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("login.description")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">{t("login.usernameLabel")}</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder={t("login.usernamePlaceholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t("login.passwordLabel")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder={t("login.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !username || !password}
          >
            {loading ? t("login.submitting") : t("login.submit")}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
