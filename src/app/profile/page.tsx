"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, KeyRound } from "lucide-react"
import { updatePassword } from "@/lib/auth"
import type { ProfileFormData, PasswordFormData } from "@/types/app"

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    full_name: "",
    avatar_url: "",
    preferred_units: { time: "minutes", calories: "kcal" },
    default_workout_type: "cardio",
    theme_preference: "system",
    notification_preferences: { email_reminders: true },
  })
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      if (profile) {
        setProfileFormData({
          full_name: profile.full_name || "",
          avatar_url: profile.avatar_url || "",
          preferred_units: (profile.preferred_units as ProfileFormData["preferred_units"]) || {
            time: "minutes",
            calories: "kcal",
          },
          default_workout_type: profile.default_workout_type || "cardio",
          theme_preference: profile.theme_preference || "system",
          notification_preferences:
            (profile.notification_preferences as ProfileFormData["notification_preferences"]) || {
              email_reminders: true,
            },
        })
      }
      setProfileLoading(false)
    } else if (!authLoading && !user) {
      setProfileLoading(false)
    }
  }, [user, profile, authLoading])

  const handleProfileChange = (field: keyof ProfileFormData) => (value: any) => {
    setProfileFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNestedProfileChange = (parentField: keyof ProfileFormData, childField: string) => (value: any) => {
    setProfileFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [childField]: value,
      },
    }))
  }

  const handlePasswordChange = (field: keyof PasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordFormData((prev) => ({ ...prev, [field]: e.target.value }))
    setPasswordError(null) // Clear error on input change
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setProfileSubmitting(true)
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: profileFormData.full_name,
          avatar_url: profileFormData.avatar_url,
          preferred_units: profileFormData.preferred_units,
          default_workout_type: profileFormData.default_workout_type,
          theme_preference: profileFormData.theme_preference,
          notification_preferences: profileFormData.notification_preferences,
        })
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully saved.",
      })
    } catch (err: any) {
      console.error("Error updating profile:", err.message)
      toast({
        title: "Error",
        description: `Failed to update profile: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setProfileSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError("New password and confirm password do not match.")
      return
    }

    if (passwordFormData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.")
      return
    }

    setPasswordSubmitting(true)
    try {
      // Supabase update user does not require current password for security reasons
      // It relies on the user being authenticated via session.
      const { error } = await updatePassword(passwordFormData.newPassword)

      if (error) {
        setPasswordError(error.message)
        return
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      })
      setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err: any) {
      console.error("Error updating password:", err.message)
      setPasswordError("An unexpected error occurred. Please try again.")
    } finally {
      setPasswordSubmitting(false)
    }
  }

  if (authLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-500">My Profile</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information Card */}
        <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-700">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileFormData.avatar_url || ""} alt={profileFormData.full_name || ""} />
                  <AvatarFallback>
                    {profileFormData.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1.5 flex-1">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    placeholder="https://example.com/avatar.jpg"
                    value={profileFormData.avatar_url}
                    onChange={(e) => handleProfileChange("avatar_url")(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="Your full name"
                  value={profileFormData.full_name}
                  onChange={(e) => handleProfileChange("full_name")(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ""} disabled />
                <p className="text-sm text-muted-foreground">Email cannot be changed here.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time_unit">Preferred Time Unit</Label>
                  <Select
                    value={profileFormData.preferred_units.time}
                    onValueChange={handleNestedProfileChange("preferred_units", "time")}
                  >
                    <SelectTrigger id="time_unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories_unit">Preferred Calories Unit</Label>
                  <Select
                    value={profileFormData.preferred_units.calories}
                    onValueChange={handleNestedProfileChange("preferred_units", "calories")}
                  >
                    <SelectTrigger id="calories_unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kcal">kcal</SelectItem>
                      <SelectItem value="joules">Joules</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_workout_type">Default Workout Type</Label>
                <Select
                  value={profileFormData.default_workout_type}
                  onValueChange={handleProfileChange("default_workout_type")}
                >
                  <SelectTrigger id="default_workout_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email_reminders">Email Reminders</Label>
                <Switch
                  id="email_reminders"
                  checked={profileFormData.notification_preferences.email_reminders}
                  onCheckedChange={handleNestedProfileChange("notification_preferences", "email_reminders")}
                />
              </div>

              <Button type="submit" className="w-full" disabled={profileSubmitting}>
                {profileSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-700">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordChange("newPassword")}
                  required
                  disabled={passwordSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordChange("confirmPassword")}
                  required
                  disabled={passwordSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={passwordSubmitting}>
                {passwordSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
