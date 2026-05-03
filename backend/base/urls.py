from django.urls import path
from . import views
from .views import cart_view, login_view, signup_view, add_to_cart, checkout_view, profile_view, custom_logout_view
from django.contrib.auth.views import LogoutView


urlpatterns = [
    path('', views.Home.as_view(), name='home'),
     path('cart/', cart_view, name='cart'),
    path('login/', login_view, name='login'),
    path('signup/', signup_view, name='signup'),
    path('add_to_cart/<int:id>/', add_to_cart, name='add_to_cart'),
     path('checkout/', checkout_view, name='checkout'),
      path('profile/', profile_view, name='profile'),
   path('logout/', custom_logout_view, name='logout'),
   path('categorie/<str:categorie>/', views.ProduitParCategorie.as_view(), name='produits_par_categorie'),
   path('cart/add/<int:id>/', views.add_to_cart, name='add_to_cart'),
   path('search/', views.search_produits, name='search'),
path('cart/update/<int:item_id>/', views.update_cart_item, name='update_cart_item'),

   path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('products/', views.Produitlist.as_view(), name='products'),
    path('products/<int:id>/', views.ProduitDetail.as_view(), name='produit_detail'),

   path('api/auth/login/', views.api_login, name='api_login'),
   path('api/auth/register/', views.api_register, name='api_register'),
   path('api/products/', views.api_products, name='api_products'),
   path('api/products/<int:id>/', views.api_product_detail, name='api_product_detail'),
    
    # path('login/', views.MyTokenObtainPairView.as_view(), name='loginTokenize'),
    

]