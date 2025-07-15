"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Activity,
  Target,
  TrendingUp,
  Users,
  Heart,
  Zap,
  Mail,
  MessageCircle,
  Github,
  Twitter,
  Send,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function AboutPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for your feedback. We'll get back to you soon.",
      })
      setContactForm({ name: "", email: "", subject: "", message: "" })
      setLoading(false)
    }, 1000)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
          <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6">
            <Activity className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About FitTracker</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your personal fitness companion designed to help you achieve your health and wellness goals
          </p>

          {/* Motivational Quote */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-primary">
            <blockquote className="text-lg italic text-gray-700 mb-2">
              "The groundwork for all happiness is good health."
            </blockquote>
            <cite className="text-sm text-gray-500">— Leigh Hunt</cite>
          </div>
        </div>

        {/* App Purpose */}
        <Card className="mb-8 animate-in fade-in-0 slide-in-from-left-4 duration-1000 delay-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              FitTracker is designed to make fitness tracking simple, motivating, and effective. We believe that
              everyone deserves access to tools that help them live healthier lives. Our platform combines intuitive
              workout logging, goal setting, and progress tracking to create a comprehensive fitness companion that
              grows with you on your journey.
            </p>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="mb-8 animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              Benefits of Workout Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Progress Visualization</h4>
                    <p className="text-sm text-gray-600">
                      See your improvements over time with detailed charts and statistics
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Goal Achievement</h4>
                    <p className="text-sm text-gray-600">
                      Set realistic targets and track your progress towards achieving them
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Motivation Boost</h4>
                    <p className="text-sm text-gray-600">
                      Stay motivated with streaks, achievements, and progress milestones
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Habit Formation</h4>
                    <p className="text-sm text-gray-600">
                      Build consistent workout habits through regular tracking and reminders
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-pink-100 rounded-full">
                    <Users className="h-4 w-4 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Personal Insights</h4>
                    <p className="text-sm text-gray-600">
                      Understand your workout patterns and optimize your fitness routine
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Heart className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Health Awareness</h4>
                    <p className="text-sm text-gray-600">
                      Monitor calories burned, workout intensity, and overall fitness trends
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mb-8 animate-in fade-in-0 slide-in-from-left-4 duration-1000 delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Tips for Staying Consistent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Start Small</h4>
                  <p className="text-sm text-blue-700">
                    Begin with 15-20 minute workouts and gradually increase duration as you build the habit.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Schedule It</h4>
                  <p className="text-sm text-green-700">
                    Treat workouts like important appointments. Block time in your calendar and stick to it.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Track Everything</h4>
                  <p className="text-sm text-purple-700">
                    Log all activities, even short walks. Every bit of movement counts towards your goals.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Find Your Why</h4>
                  <p className="text-sm text-orange-700">
                    Connect with your deeper motivation - health, energy, confidence, or stress relief.
                  </p>
                </div>

                <div className="p-4 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold text-pink-900 mb-2">Celebrate Wins</h4>
                  <p className="text-sm text-pink-700">
                    Acknowledge every milestone, no matter how small. Progress is progress!
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">Be Flexible</h4>
                  <p className="text-sm text-indigo-700">
                    Adapt your routine to life's changes. Consistency matters more than perfection.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-8 animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-blue-500" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">How do I get started with FitTracker?</h4>
                <p className="text-gray-600 text-sm">
                  Simply create an account, log your first workout, and set your initial fitness goals. The app will
                  guide you through the process.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Can I track different types of workouts?</h4>
                <p className="text-gray-600 text-sm">
                  Yes! FitTracker supports cardio, strength training, yoga, HIIT, running, cycling, swimming, and many
                  other workout types.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Is my data secure and private?</h4>
                <p className="text-gray-600 text-sm">
                  Absolutely. We use industry-standard encryption and security measures. Your workout data is private
                  and only accessible to you.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Can I export my workout data?</h4>
                <p className="text-gray-600 text-sm">
                  Yes, you can export your workout history as a CSV file from the History page for backup or analysis
                  purposes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">How do I set effective fitness goals?</h4>
                <p className="text-gray-600 text-sm">
                  Start with SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). Begin with small,
                  realistic targets and gradually increase them.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-green-500" />
              Get in Touch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="What's this about?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="Tell us how we can help..."
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Sending..." : "Send Message"}
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Have questions or need help? We're here to support your fitness journey.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      support@fittracker.com
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="h-4 w-4" />
                      Live chat available 9 AM - 5 PM EST
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Connect With Us</h4>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Feature Requests</h4>
                  <p className="text-sm text-gray-600">
                    Have an idea for a new feature? We'd love to hear from you! Send us your suggestions and help shape
                    the future of FitTracker.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
