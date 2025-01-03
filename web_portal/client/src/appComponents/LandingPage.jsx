import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, FileSpreadsheet, Trophy, Users, Moon, Sun } from "lucide-react"
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../store/themeSlice'

export default function Landing() {
  const dispatch = useDispatch()
  const { mode } = useSelector((state) => state.theme)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar with Theme Toggle */}
      <nav className="border-b">
        <div className="container max-w-6xl py-4 px-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Result Analysis</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
          >
            {mode === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Advanced Result Analysis
              <span className="text-primary block">Made Simple</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Transform your academic data into actionable insights with our comprehensive result analysis platform.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FileSpreadsheet className="h-10 w-10" />}
              title="Excel Processing"
              description="Seamlessly process Excel files with marks data for comprehensive analysis"
            />
            <FeatureCard 
              icon={<BarChart2 className="h-10 w-10" />}
              title="Distribution Reports"
              description="Generate detailed marks distribution reports with visual representations"
            />
            <FeatureCard 
              icon={<Trophy className="h-10 w-10" />}
              title="Top Performers"
              description="Identify and track top-performing students across subjects"
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10" />}
              title="Subject Analysis"
              description="Deep dive into subject-wise performance metrics and trends"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t">
        <div className="container max-w-6xl text-center text-sm text-muted-foreground">
          © 2024 Result Analysis System. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow">
      <div className="text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
