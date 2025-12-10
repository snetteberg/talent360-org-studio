import { TopNav } from '@/components/talent360/TopNav';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Target, ArrowRight, BarChart3, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WorkforcePlanning() {
  const navigate = useNavigate();

  const handleTabChange = (tab: 'workforce' | 'orgbuilder' | 'talentvis') => {
    if (tab === 'orgbuilder') {
      navigate('/orgbuilder');
    } else if (tab === 'talentvis') {
      navigate('/talent-visualization');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab="workforce" onTabChange={handleTabChange} />
      
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Workforce Planning & Succession
          </h1>
          <p className="text-muted-foreground">
            Strategic insights for talent management and succession planning
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">248</p>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">92%</p>
                  <p className="text-sm text-muted-foreground">Succession Coverage</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">12</p>
                  <p className="text-sm text-muted-foreground">Critical Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">+15%</p>
                  <p className="text-sm text-muted-foreground">YoY Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Workforce Analytics</CardTitle>
              <CardDescription>
                Deep dive into workforce metrics, demographics, and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="gap-2 px-0 text-primary hover:text-primary">
                View Analytics <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-2">
                <UserCheck className="w-5 h-5 text-success" />
              </div>
              <CardTitle className="text-lg">Succession Planning</CardTitle>
              <CardDescription>
                Identify and develop future leaders for critical positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="gap-2 px-0 text-primary hover:text-primary">
                Manage Succession <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <CardTitle className="text-lg">Talent Assessment</CardTitle>
              <CardDescription>
                Evaluate employee performance, potential, and readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="gap-2 px-0 text-primary hover:text-primary">
                View Assessments <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA for OrgBuilder */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Try OrgBuilder</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize and redesign your organizational structure with real-time insights
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/orgbuilder')} className="gap-2">
              Open OrgBuilder <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
