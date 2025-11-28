'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <CardTitle>Configuración Requerida</CardTitle>
          </div>
          <CardDescription>
            Necesitas configurar las variables de entorno de Supabase antes de usar la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Paso 1 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Paso 1: Crear proyecto en Supabase</h3>
            <p className="text-sm text-gray-600 mb-3">
              Si aún no tienes un proyecto, créalo en Supabase
            </p>
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <span>Ir a Supabase</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Paso 2 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Paso 2: Obtener credenciales</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-3">
              <li>En tu proyecto de Supabase, ve a <strong>Settings</strong> {'>'} <strong>API</strong></li>
              <li>Copia los siguientes valores:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Project URL</strong> (en la sección "Project URL")</li>
                  <li><strong>anon public</strong> key (en la sección "Project API keys")</li>
                  <li><strong>service_role</strong> key (en la misma sección, mantén esto secreto)</li>
                </ul>
              </li>
            </ol>
          </div>

          {/* Paso 3 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Paso 3: Crear archivo .env</h3>
            <p className="text-sm text-gray-600 mb-3">
              Crea un archivo llamado <code className="bg-gray-100 px-2 py-1 rounded text-sm">.env</code> en la raíz del proyecto (al mismo nivel que <code className="bg-gray-100 px-2 py-1 rounded text-sm">package.json</code>)
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Agrega el siguiente contenido (reemplaza con tus valores reales):
            </p>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400"># Project URL</span><br />
                  <span className="text-green-400">NEXT_PUBLIC_SUPABASE_URL</span>=
                  <span className="text-yellow-400">https://tu-proyecto.supabase.co</span>
                </div>
                <div>
                  <span className="text-gray-400"># anon public key</span><br />
                  <span className="text-green-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=
                  <span className="text-yellow-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</span>
                </div>
                <div>
                  <span className="text-gray-400"># service_role key (opcional pero recomendado)</span><br />
                  <span className="text-green-400">SUPABASE_SERVICE_ROLE_KEY</span>=
                  <span className="text-yellow-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Paso 4: Ejecutar script SQL</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-3">
              <li>En Supabase, ve a <strong>SQL Editor</strong></li>
              <li>Abre el archivo <code className="bg-gray-100 px-2 py-1 rounded text-sm">supabase/schema.sql</code> de este proyecto</li>
              <li>Copia todo el contenido y pégalo en el SQL Editor</li>
              <li>Haz clic en <strong>Run</strong> para ejecutar el script</li>
            </ol>
          </div>

          {/* Paso 5 */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">Paso 5: Reiniciar servidor</h3>
            <p className="text-sm text-gray-600 mb-3">
              Después de crear el archivo <code className="bg-gray-100 px-2 py-1 rounded text-sm">.env</code>, 
              detén el servidor (Ctrl+C) y vuelve a iniciarlo:
            </p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm">
              npm run dev
            </div>
          </div>

          {/* Información importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Importante:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>El archivo <code className="bg-blue-100 px-1 rounded">.env</code> ya está en <code className="bg-blue-100 px-1 rounded">.gitignore</code> y no se subirá a Git</li>
                  <li><strong>NUNCA</strong> compartas tu <code className="bg-blue-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> públicamente</li>
                  <li>Después de crear/editar <code className="bg-blue-100 px-1 rounded">.env</code>, <strong>siempre reinicia</strong> el servidor</li>
                  <li>Puedes verificar tu configuración ejecutando: <code className="bg-blue-100 px-1 rounded">npm run check-env</code></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Documentación adicional */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Documentación adicional:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <code className="bg-gray-100 px-1 rounded">ENV_SETUP.md</code> - Guía rápida de configuración</li>
              <li>• <code className="bg-gray-100 px-1 rounded">SETUP.md</code> - Guía completa paso a paso</li>
              <li>• <code className="bg-gray-100 px-1 rounded">README.md</code> - Documentación general del proyecto</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-4 pt-4">
            <Link href="/auth/login">
              <Button>
                Ir a Login
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Recargar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
