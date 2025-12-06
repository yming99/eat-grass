import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Camera, X, GripVertical } from 'lucide-react'
import profileData from '@/data/profile.json'

export default function Profile() {
  const [profile, setProfile] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: '',
    diet: profileData.diet,
    budget: profileData.budget,
    allergies: [] as string[],
    calorieRange: { min: 1500, max: 2500 },
    preferredStores: [...profileData.preferred_stores],
    notifications: true,
    saveMealHistory: true,
  })

  const [newAllergy, setNewAllergy] = useState('')
  const [newStore, setNewStore] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !profile.allergies.includes(newAllergy.trim())) {
      setProfile({
        ...profile,
        allergies: [...profile.allergies, newAllergy.trim()],
      })
      setNewAllergy('')
    }
  }

  const handleRemoveAllergy = (allergy: string) => {
    setProfile({
      ...profile,
      allergies: profile.allergies.filter((a) => a !== allergy),
    })
  }

  const handleAddStore = () => {
    if (newStore.trim() && !profile.preferredStores.includes(newStore.trim())) {
      setProfile({
        ...profile,
        preferredStores: [...profile.preferredStores, newStore.trim()],
      })
      setNewStore('')
    }
  }

  const handleRemoveStore = (store: string) => {
    setProfile({
      ...profile,
      preferredStores: profile.preferredStores.filter((s) => s !== store),
    })
  }

  const handleMoveStore = (index: number, direction: 'up' | 'down') => {
    const stores = [...profile.preferredStores]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex >= 0 && newIndex < stores.length) {
      ;[stores[index], stores[newIndex]] = [stores[newIndex], stores[index]]
      setProfile({ ...profile, preferredStores: stores })
    }
  }

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-8">
      {/* Top Profile Card */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32 md:h-40 md:w-40">
                <AvatarImage src={profileData.avatar} alt={profile.name} />
                <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-10 w-10"
                onClick={() => alert('Change avatar functionality')}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold">{profile.name}</h2>
              <p className="text-neutral-600">{profile.email}</p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-600 pt-2">
                <span>
                  <strong className="text-neutral-900">Diet:</strong>{' '}
                  {profile.diet.charAt(0).toUpperCase() + profile.diet.slice(1)}
                </span>
                <span>
                  <strong className="text-neutral-900">Budget:</strong> RM{profile.budget}
                </span>
                <span>
                  <strong className="text-neutral-900">Member since:</strong>{' '}
                  {profileData.member_since}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={() => setIsEditing(!isEditing)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="outline" onClick={() => alert('Change avatar functionality')}>
                <Camera className="mr-2 h-4 w-4" />
                Change Avatar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-neutral-500 text-xs">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <Button variant="outline" className="w-full md:w-auto">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Dietary Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Dietary Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diet-type">Diet Type</Label>
            <Select
              value={profile.diet}
              onValueChange={(value) => setProfile({ ...profile, diet: value })}
              disabled={!isEditing}
            >
              <SelectTrigger id="diet-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="high-protein">High Protein</SelectItem>
                <SelectItem value="low-carb">Low Carb</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Allergies</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.allergies.map((allergy) => (
                <div
                  key={allergy}
                  className="flex items-center gap-1 px-3 py-1 bg-softGreen/50 rounded-full text-sm"
                >
                  <span>{allergy}</span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add allergy"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
                />
                <Button onClick={handleAddAllergy} size="sm">
                  Add
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Preferred Calorie Range</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="cal-min" className="text-xs text-neutral-600">
                  Min
                </Label>
                <Input
                  id="cal-min"
                  type="number"
                  value={profile.calorieRange.min}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      calorieRange: {
                        ...profile.calorieRange,
                        min: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              <span className="pt-6">-</span>
              <div className="flex-1">
                <Label htmlFor="cal-max" className="text-xs text-neutral-600">
                  Max
                </Label>
                <Input
                  id="cal-max"
                  type="number"
                  value={profile.calorieRange.max}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      calorieRange: {
                        ...profile.calorieRange,
                        max: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferred Stores */}
      <Card>
        <CardHeader>
          <CardTitle>Preferred Stores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.preferredStores.map((store, index) => (
              <div
                key={store}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {isEditing && (
                  <div className="flex items-center gap-1 mr-1">
                    <button
                      onClick={() => handleMoveStore(index, 'up')}
                      disabled={index === 0}
                      className="opacity-50 hover:opacity-100 disabled:opacity-20"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveStore(index, 'down')}
                      disabled={index === profile.preferredStores.length - 1}
                      className="opacity-50 hover:opacity-100 disabled:opacity-20"
                    >
                      ↓
                    </button>
                  </div>
                )}
                <GripVertical className="h-3 w-3 opacity-50" />
                <span>{store}</span>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveStore(store)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add store"
                  value={newStore}
                  onChange={(e) => setNewStore(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStore()}
                  className="w-32"
                />
                <Button onClick={handleAddStore} size="sm">
                  + Add Store
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications</Label>
              <p className="text-sm text-neutral-600">
                Receive notifications about meals and deals
              </p>
            </div>
            <Switch
              checked={profile.notifications}
              onCheckedChange={(checked) =>
                setProfile({ ...profile, notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Save Meal History</Label>
              <p className="text-sm text-neutral-600">
                Automatically save your meal planning history
              </p>
            </div>
            <Switch
              checked={profile.saveMealHistory}
              onCheckedChange={(checked) =>
                setProfile({ ...profile, saveMealHistory: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
        </div>
      )}
    </div>
  )
}
