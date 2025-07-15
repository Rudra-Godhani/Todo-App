import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, Heart, ShieldCheck, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center animate-in fade-in-0 slide-in-from-top-4 duration-500">
        About FitTracker
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-700">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Activity className="h-8 w-8 text-primary" />
            <CardTitle className="text-xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              At FitTracker, our mission is to empower individuals to take control of their fitness journey. We believe
              that consistent tracking and clear goal setting are key to achieving lasting health and wellness.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in-0 slide-in-from-top-4 duration-800">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Heart className="h-8 w-8 text-red-500" />
            <CardTitle className="text-xl">Why FitTracker?</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              We provide a simple, intuitive, and powerful platform to log your workouts, set achievable goals, and
              visualize your progress over time. Whether you're a beginner or an experienced athlete, FitTracker is
              designed to support you every step of the way.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-900">
          <CardHeader className="flex flex-row items-center space-x-4">
            <ShieldCheck className="h-8 w-8 text-green-500" />
            <CardTitle className="text-xl">Data Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Your privacy is our top priority. All your fitness data is securely stored and accessible only by you. We
              are committed to protecting your personal information and ensuring a safe tracking environment.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Zap className="h-8 w-8 text-yellow-500" />
            <CardTitle className="text-xl">Future Enhancements</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              We are continuously working to improve FitTracker. Upcoming features include advanced analytics, workout
              templates, social sharing, and integrations with other fitness devices. Stay tuned for more!
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FitTracker. All rights reserved.</p>
        <p className="text-sm mt-2">Built with passion for a healthier you.</p>
      </div>
    </div>
  )
}
