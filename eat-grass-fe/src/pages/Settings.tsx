import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Mail, Trash2, AlertTriangle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import settingsData from '@/data/settings.json'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    currency: 'MYR',
    units: (settingsData.preferences.units || 'metric') as 'metric' | 'imperial',
    promotionalAlerts: true,
    priceDropAlerts: true,
    mealReminders: settingsData.notifications.mealReminders ?? true,
  })

  // Sync theme from context
  useEffect(() => {
    // Theme is managed by ThemeContext
  }, [theme])

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      alert('Account deletion confirmed. This action cannot be undone.')
      // Handle account deletion
    } else {
      setShowDeleteConfirm(true)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-neutral-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure your general app preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency-select">Currency</Label>
            <Select
              key="currency-select"
              value={settings.currency}
              onValueChange={(value) => setSettings({ ...settings, currency: value })}
            >
              <SelectTrigger id="currency-select" className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent key="currency-content" className="z-[100]">
                <SelectItem key="myr" value="MYR">MYR (Malaysian Ringgit)</SelectItem>
                <SelectItem key="usd" value="USD">USD (US Dollar)</SelectItem>
                <SelectItem key="sgd" value="SGD">SGD (Singapore Dollar)</SelectItem>
                <SelectItem key="thb" value="THB">THB (Thai Baht)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="units-select">Measurement Units</Label>
            <Select
              key="units-select"
              value={settings.units}
              onValueChange={(value) =>
                setSettings({ ...settings, units: value as 'metric' | 'imperial' })
              }
            >
              <SelectTrigger id="units-select" className="w-full">
                <SelectValue placeholder="Select units" />
              </SelectTrigger>
              <SelectContent key="units-content" className="z-[100]">
                <SelectItem key="metric" value="metric">Metric (kg, g, L, mL)</SelectItem>
                <SelectItem key="imperial" value="imperial">Imperial (lb, oz, fl oz)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promotional Alerts</Label>
              <p className="text-sm text-neutral-600">
                Receive notifications about special promotions and offers
              </p>
            </div>
            <Switch
              checked={settings.promotionalAlerts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, promotionalAlerts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Price Drop Alerts</Label>
              <p className="text-sm text-neutral-600">
                Get notified when prices drop for your favorite ingredients
              </p>
            </div>
            <Switch
              checked={settings.priceDropAlerts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, priceDropAlerts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Meal Reminders</Label>
              <p className="text-sm text-neutral-600">
                Receive reminders for meal planning and preparation
              </p>
            </div>
            <Switch
              checked={settings.mealReminders}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, mealReminders: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preferred app theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="w-full h-16 bg-white rounded border-2 border-neutral-200 flex items-center justify-center">
                  <div className="w-8 h-8 bg-neutral-100 rounded"></div>
                </div>
                <p className="font-medium">Light</p>
                {theme === 'light' && (
                  <p className="text-xs text-primary font-semibold">Active</p>
                )}
              </div>
            </button>

            <button
              onClick={() => setTheme('green')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'green'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="w-full h-16 bg-gradient-to-br from-green-50 to-green-100 rounded border-2 border-primary flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary rounded"></div>
                </div>
                <p className="font-medium">Green</p>
                {theme === 'green' && (
                  <p className="text-xs text-primary font-semibold">Active</p>
                )}
              </div>
            </button>
          </div>
          <p className="text-sm text-neutral-600 mt-4 text-center">
            Theme changes apply immediately across the app
          </p>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Get help or manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full md:w-auto" asChild>
            <a href="mailto:support@eatgrass.com">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </a>
          </Button>

          <div className="pt-4 border-t">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                {showDeleteConfirm ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-red-600">
                      Are you sure you want to delete your account? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        className="w-full md:w-auto"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Yes, Delete My Account
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="w-full md:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full md:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
