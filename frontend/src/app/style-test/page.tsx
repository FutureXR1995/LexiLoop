'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function StyleTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          LexiLoop Style Test
        </h1>
        
        {/* Button Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small Button</Button>
              <Button size="default">Default Size</Button>
              <Button size="lg">Large Button</Button>
              <Button size="icon">🏠</Button>
            </div>
          </CardContent>
        </Card>

        {/* Input Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Regular input" />
            <Input placeholder="Input with error" error={true} helperText="This is an error message" />
            <Input type="password" placeholder="Password input" />
            <Input disabled placeholder="Disabled input" />
          </CardContent>
        </Card>

        {/* Tailwind Classes Test */}
        <Card>
          <CardHeader>
            <CardTitle>Tailwind CSS Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                <h3 className="font-semibold text-blue-800">Blue Box</h3>
                <p className="text-blue-600">This should be blue themed</p>
              </div>
              
              <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                <h3 className="font-semibold text-green-800">Green Box</h3>
                <p className="text-green-600">This should be green themed</p>
              </div>
              
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <h3 className="font-semibold text-red-800">Red Box</h3>
                <p className="text-red-600">This should be red themed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Test */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-semibold">Heading 2</h2>
            <h3 className="text-2xl font-medium">Heading 3</h3>
            <p className="text-base">Regular paragraph text</p>
            <p className="text-sm text-gray-600">Small muted text</p>
          </CardContent>
        </Card>

        {/* Animation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Animations & Effects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="animate-fade-in p-4 bg-indigo-100 rounded-lg">
              <p>This should fade in</p>
            </div>
            
            <div className="animate-slide-up p-4 bg-purple-100 rounded-lg">
              <p>This should slide up</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
              <p>Gradient background</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}