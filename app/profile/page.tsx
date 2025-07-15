"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, Camera, Save, Moon, Sun, Bell, Settings, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: "",
    avatar_url: "",
    preferred_units: {
      time: "minutes",
      calories: "kcal",
    },
    default_workout_type: "cardio",
    theme_preference: "light",
    notification_preferences: {
      email_reminders: true,
    },
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
        preferred_units: profile.preferred_units || { time: "minutes", calories: "kcal" },
        default_workout_type: profile.default_workout_type || "cardio",
        theme_preference: profile.theme_preference || "light",
        notification_preferences: profile.notification_preferences || { email_reminders: true },
      })
    }
  }, [profile])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        user_id: user.id,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        preferred_units: profileData.preferred_units,
        default_workout_type: profileData.default_workout_type,
        theme_preference: profileData.theme_preference,
        notification_preferences: profileData.notification_preferences,
      })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Password updated successfully",
        })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      }
    } catch (error) {
      console.error("Error updating password:", error)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload avatar",
          variant: "destructive",
        })
        return
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      setProfileData((prev) => ({
        ...prev,
        avatar_url: data.publicUrl,
      }))

      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading avatar:", error)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card className="lg:col-span-1 animate-in fade-in-0 slide-in-from-left-4 duration-1000 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileData.avatar_url || "/placeholder.svg"} alt={profileData.full_name} />
                  <AvatarFallback className="text-lg">
                    {profileData.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>

              <h3 className="font-semibold text-lg mb-1">{profileData.full_name || "Anonymous User"}</h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(user.created_at), "MMM yyyy")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Read-only)</Label>
                    <Input id="email" value={user.email || ""} disabled className="bg-gray-50" />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                    <Save className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-400">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Theme</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span className="text-sm">Light</span>
                    </div>
                    <Switch
                      checked={profileData.theme_preference === "dark"}
                      onCheckedChange={(checked) =>
                        setProfileData((prev) => ({
                          ...prev,
                          theme_preference: checked ? "dark" : "light",
                        }))
                      }
                    />
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span className="text-sm">Dark</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Units */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Units</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time_unit">Time Unit</Label>
                      <Select
                        value={profileData.preferred_units.time}
                        onValueChange={(value) =>
                          setProfileData((prev) => ({
                            ...prev,
                            preferred_units: { ...prev.preferred_units, time: value },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calories_unit">Calories Unit</Label>
                      <Select
                        value={profileData.preferred_units.calories}
                        onValueChange={(value) =>
                          setProfileData((prev) => ({
                            ...prev,
                            preferred_units: { ...prev.preferred_units, calories: value },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kcal">kcal</SelectItem>
                          <SelectItem value="cal">cal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Default Workout Type */}
                <div className="space-y-2">
                  <Label htmlFor="default_workout">Default Workout Type</Label>
                  <Select
                    value={profileData.default_workout_type}
                    onValueChange={(value) => setProfileData((prev) => ({ ...prev, default_workout_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="hiit">HIIT</SelectItem>
                      <SelectItem value="stretching">Stretching</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="cycling">Cycling</SelectItem>
                      <SelectItem value="swimming">Swimming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Notifications */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Label>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Reminders</p>
                      <p className="text-xs text-gray-500">Get workout reminders via email</p>
                    </div>
                    <Switch
                      checked={profileData.notification_preferences.email_reminders}
                      onCheckedChange={(checked) =>
                        setProfileData((prev) => ({
                          ...prev,
                          notification_preferences: { ...prev.notification_preferences, email_reminders: checked },
                        }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Preferences"}
                  <Save className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
