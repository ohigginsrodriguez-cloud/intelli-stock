import Link from "next/link";
import { PackageSearch, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    desc: "Visualiza tus KPIs, ventas, márgenes y rotación en tiempo real.",
  },
  {
    icon: AlertTriangle,
    title: "Alertas Automáticas",
    desc: "Notificaciones de stock crítico, productos sin movimiento y baja de ventas.",
  },
  {
    icon: TrendingUp,
    title: "Recomendaciones IA",
    desc: "Sugerencias de reabastecimiento, promociones y descuentos basadas en datos.",
  },
  {
    icon: PackageSearch,
    title: "Control de Inventario",
    desc: "Registra ventas, compras y lleva el control total de tu negocio.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <PackageSearch className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-foreground">InteliStock</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <PackageSearch className="h-12 w-12 text-primary" />
              <span className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">InteliStock</span>
            </div>
            <p className="text-lg text-muted max-w-xl mx-auto mb-10">Plataforma inteligente de gestión de inventarios</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Toma el control de tu{" "}
              <span className="text-primary">inventario</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Convierte tus datos de ventas en decisiones inteligentes. Evita
              pérdidas por desabasto o exceso, optimiza tu flujo de efectivo y
              aumenta tus ganancias con InteliStock.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Comenzar Gratis
              </Link>
              <Link
                href="#features"
                className="border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-card transition-colors"
              >
                Conocer Más
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-card">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground">
              Todo lo que necesitas para gestionar tu inventario
            </h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-surface rounded-xl p-6 border border-border hover:border-primary/30 transition-all"
                >
                  <f.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground">Planes para cada negocio</h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Básico", price: "$300", features: ["Control de inventario", "Reportes simples", "1 usuario"] },
                { name: "Intermedio", price: "$800", features: ["Todo lo del Básico", "Alertas automáticas", "Recomendaciones IA", "3 usuarios"] },
                { name: "Premium", price: "$1,500", features: ["Todo lo del Intermedio", "Predicción de demanda", "Soporte prioritario", "Usuarios ilimitados"] },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className="bg-card border border-border rounded-xl p-8 hover:border-primary/30 transition-all"
                >
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-4 text-3xl font-bold text-primary">
                    {plan.price}
                    <span className="text-sm font-normal text-muted">/mes</span>
                  </p>
                  <ul className="mt-6 space-y-3 text-left">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm text-muted flex items-center gap-2">
                        <span className="text-success">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className="mt-8 block w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    Elegir Plan
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} InteliStock. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
