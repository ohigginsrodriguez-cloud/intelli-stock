from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductoViewSet, basename='producto')
router.register(r'sales', views.VentaViewSet, basename='venta')
router.register(r'purchases', views.CompraViewSet, basename='compra')
router.register(r'suppliers', views.ProveedorViewSet, basename='proveedor')
router.register(r'alerts/alertas', views.AlertaViewSet, basename='alerta')
router.register(r'alerts/recomendaciones', views.RecomendacionViewSet, basename='recomendacion')

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('alerts/alertas/marcar_todas_leidas/', views.AlertaViewSet.as_view({'post': 'marcar_todas_leidas'}), name='alertas-marcar-todas'),
    path('alerts/alertas/<int:pk>/marcar_leida/', views.AlertaViewSet.as_view({'post': 'marcar_leida'}), name='alerta-marcar-leida'),
    path('alerts/recomendaciones/<int:pk>/marcar_aplicada/', views.RecomendacionViewSet.as_view({'post': 'marcar_aplicada'}), name='recomendacion-marcar-aplicada'),
    path('alerts/generate/', views.generate_alerts, name='generate-alerts'),
    path('alerts/pending-count/', views.pending_count, name='pending-count'),
    path('reports/ventas/', views.reporte_ventas, name='reporte-ventas'),
    path('reports/inventario/', views.reporte_inventario, name='reporte-inventario'),
    path('reports/margenes/', views.reporte_margenes, name='reporte-margenes'),
    path('reports/export/csv/<str:tipo>/', views.export_csv, name='export-csv'),
    path('reports/export/pdf/<str:tipo>/', views.export_pdf, name='export-pdf'),
    path('predictions/<int:producto_id>/', views.prediccion_view, name='prediccion'),
    path('', include(router.urls)),
]
