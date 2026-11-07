import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sun, Moon, Monitor, Download, Upload, Trash2, AlertTriangle,
  Keyboard, Bell, Palette, User, Database, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useProfileStore } from '@/store/useProfileStore'
import { useApplicationStore } from '@/store/useApplicationStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useEssayStore } from '@/store/useEssayStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { CURRENCIES, EDUCATION_LEVELS, EDUCATION_LABELS, FIELDS_OF_STUDY, GENDERS, CATEGORIES } from '@/data/constants'
import { loadDemo } from '@/features/demo/loadDemo'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const SHORTCUTS = [
  { keys: '⌘/Ctrl + K', desc: 'Open command palette' },
  { keys: '/', desc: 'Focus search' },
  { keys: '?', desc: 'Show shortcuts' },
  { keys: 'g d', desc: 'Go to Dashboard' },
  { keys: 'g s', desc: 'Go to Discover' },
  { keys: 'g t', desc: 'Go to Tracker' },
  { keys: 's', desc: 'Save on detail page' },
]

export default function Settings() {
  const navigate = useNavigate()
  const settings = useSettingsStore()
  const profile = useProfileStore((s) => s.profile)
  const setProfile = useProfileStore((s) => s.setProfile)
  const clearProfile = useProfileStore((s) => s.clearProfile)
  const setApplications = useApplicationStore((s) => s.setApplications)
  const setDocuments = useDocumentStore((s) => s.setDocuments)
  const setEssays = useEssayStore((s) => s.setEssays)
  const setNotifications = useNotificationStore((s) => s.setNotifications)
  const fileInputRef = useRef(null)
  const [resetText, setResetText] = useState('')

  function exportJSON() {
    const data = {
      version: 'grantly:v1',
      exportedAt: new Date().toISOString(),
      profile: useProfileStore.getState().profile,
      applications: useApplicationStore.getState().applications,
      documents: useDocumentStore.getState().documents,
      essays: useEssayStore.getState().essays,
      settings: {
        theme: settings.theme,
        currency: settings.currency,
        textSize: settings.textSize,
        reduceMotion: settings.reduceMotion,
        highContrast: settings.highContrast,
        reminderDays: settings.reminderDays,
      },
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grantly-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported')
  }

  function importJSON(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (data.profile) setProfile(data.profile)
        if (data.applications) setApplications(data.applications)
        if (data.documents) setDocuments(data.documents)
        if (data.essays) setEssays(data.essays)
        if (data.settings) {
          if (data.settings.theme) settings.setTheme(data.settings.theme)
          if (data.settings.currency) settings.setCurrency(data.settings.currency)
          if (data.settings.textSize) settings.setTextSize(data.settings.textSize)
        }
        toast.success('Data imported successfully')
      } catch {
        toast.error('Invalid file format')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function resetAll() {
    if (resetText !== 'RESET') {
      toast.error('Type RESET to confirm')
      return
    }
    clearProfile()
    setApplications([])
    setDocuments([])
    setEssays([])
    setNotifications([])
    settings.reset()
    setResetText('')
    toast.success('All data reset')
    setTimeout(() => navigate('/'), 500)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-4 w-4" /> Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="data"><Database className="h-4 w-4" /> Data</TabsTrigger>
          <TabsTrigger value="shortcuts"><Keyboard className="h-4 w-4" /> Shortcuts</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Edit profile</h2>
            {profile ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="p-name">Full name</Label>
                  <Input id="p-name" value={profile.fullName} onChange={(e) => setProfile({ fullName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="p-dob">Date of birth</Label>
                  <Input id="p-dob" type="date" value={profile.dob} onChange={(e) => setProfile({ dob: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="p-gender">Gender</Label>
                  <Select value={profile.gender} onValueChange={(v) => setProfile({ gender: v })}>
                    <SelectTrigger id="p-gender"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="p-country">Country</Label>
                  <Input id="p-country" value={profile.country} onChange={(e) => setProfile({ country: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="p-level">Education level</Label>
                  <Select value={profile.educationLevel} onValueChange={(v) => setProfile({ educationLevel: v })}>
                    <SelectTrigger id="p-level"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{EDUCATION_LABELS[l]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="p-field">Field of study</Label>
                  <Select value={profile.fieldOfStudy} onValueChange={(v) => setProfile({ fieldOfStudy: v })}>
                    <SelectTrigger id="p-field"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIELDS_OF_STUDY.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="p-inst">Institution</Label>
                  <Input id="p-inst" value={profile.institution} onChange={(e) => setProfile({ institution: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="p-gpa">GPA (%)</Label>
                  <Input id="p-gpa" type="number" value={profile.gpaPercent} onChange={(e) => setProfile({ gpaPercent: Number(e.target.value) })} />
                </div>
                <div>
                  <Label htmlFor="p-income">Family income (₹)</Label>
                  <Input id="p-income" type="number" value={profile.familyIncomeINR} onChange={(e) => setProfile({ familyIncomeINR: Number(e.target.value) })} />
                </div>
                <div>
                  <Label htmlFor="p-category">Category</Label>
                  <Select value={profile.category} onValueChange={(v) => setProfile({ category: v })}>
                    <SelectTrigger id="p-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="p-goals">Goals</Label>
                  <Textarea id="p-goals" value={profile.goals} onChange={(e) => setProfile({ goals: e.target.value })} rows={3} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No profile yet. Complete onboarding first.</p>
            )}
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card className="space-y-6">
            <h2 className="font-display text-lg font-semibold">Appearance</h2>

            {/* Theme */}
            <div>
              <Label>Theme</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => settings.setTheme(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-md border p-3 transition-colors',
                      settings.theme === opt.value
                        ? 'border-jade-600 bg-jade-50 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300'
                        : 'border-border hover:bg-surface-2',
                    )}
                  >
                    <opt.icon className="h-5 w-5" />
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text size */}
            <div>
              <Label>Text size</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {['sm', 'md', 'lg'].map((size) => (
                  <button
                    key={size}
                    onClick={() => settings.setTextSize(size)}
                    className={cn(
                      'rounded-md border p-3 text-sm transition-colors',
                      settings.textSize === size
                        ? 'border-jade-600 bg-jade-50 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300'
                        : 'border-border hover:bg-surface-2',
                    )}
                  >
                    {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                  </button>
                ))}
              </div>
            </div>

            {/* Reduce motion */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reduce motion</p>
                <p className="text-xs text-ink-muted">Minimise animations and transitions</p>
              </div>
              <Switch checked={settings.reduceMotion} onCheckedChange={settings.setReduceMotion} />
            </div>

            {/* High contrast */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">High contrast</p>
                <p className="text-xs text-ink-muted">Increase contrast for better readability</p>
              </div>
              <Switch checked={settings.highContrast} onCheckedChange={settings.setHighContrast} />
            </div>

            {/* Currency */}
            <div>
              <Label htmlFor="currency">Display currency</Label>
              <Select value={settings.currency} onValueChange={settings.setCurrency}>
                <SelectTrigger id="currency" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-ink-subtle">Static conversion rates used. No API calls.</p>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="space-y-6">
            <h2 className="font-display text-lg font-semibold">Notifications</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Browser notifications</p>
                <p className="text-xs text-ink-muted">Get desktop alerts for deadlines</p>
              </div>
              <Switch
                checked={settings.browserNotifications}
                onCheckedChange={(v) => {
                  settings.setBrowserNotifications(v)
                  if (v && 'Notification' in window) {
                    Notification.requestPermission()
                  }
                }}
              />
            </div>

            <div>
              <Label>Reminder lead times (days before deadline)</Label>
              <div className="mt-2 flex gap-2">
                {[7, 3, 1].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      const days = settings.reminderDays.includes(d)
                        ? settings.reminderDays.filter((x) => x !== d)
                        : [...settings.reminderDays, d].sort((a, b) => b - a)
                      settings.setReminderDays(days)
                    }}
                    className={cn(
                      'rounded-md border px-4 py-2 text-sm transition-colors',
                      settings.reminderDays.includes(d)
                        ? 'border-jade-600 bg-jade-50 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300'
                        : 'border-border hover:bg-surface-2',
                    )}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data">
          <div className="space-y-4">
            <Card className="space-y-4">
              <h2 className="font-display text-lg font-semibold">Data management</h2>

              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Export data</p>
                  <p className="text-xs text-ink-muted">Download all your data as JSON</p>
                </div>
                <Button variant="secondary" size="sm" onClick={exportJSON}>
                  <Download className="h-4 w-4" /> Export
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Import data</p>
                  <p className="text-xs text-ink-muted">Restore from a JSON backup</p>
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept=".json" onChange={importJSON} className="hidden" />
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" /> Import
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Load demo data</p>
                  <p className="text-xs text-ink-muted">Replace current data with demo content</p>
                </div>
                <Button variant="secondary" size="sm" onClick={loadDemo}>
                  Load demo
                </Button>
              </div>

              <div className="rounded-md border border-danger/30 bg-danger/5 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="flex items-center gap-1 text-sm font-medium text-danger">
                      <AlertTriangle className="h-4 w-4" /> Reset everything
                    </p>
                    <p className="text-xs text-ink-muted">Permanently delete all data on this device</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={resetText}
                    onChange={(e) => setResetText(e.target.value)}
                    placeholder="Type RESET to confirm"
                    className="h-9"
                  />
                  <Button variant="danger" size="sm" onClick={resetAll}>
                    <Trash2 className="h-4 w-4" /> Reset
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-jade-600" />
                <h3 className="text-sm font-semibold">Privacy</h3>
              </div>
              <p className="text-sm text-ink-muted">
                All your data — profile, applications, documents, and essays — is stored locally on this device using browser storage (localStorage and IndexedDB). Nothing is sent to any server. Grantly works completely offline after the first load.
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Shortcuts */}
        <TabsContent value="shortcuts">
          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold">Keyboard shortcuts</h2>
            <div className="space-y-2">
              {SHORTCUTS.map((s) => (
                <div key={s.keys} className="flex items-center justify-between border-b border-border py-2">
                  <span className="text-sm text-ink-muted">{s.desc}</span>
                  <kbd className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-xs">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
