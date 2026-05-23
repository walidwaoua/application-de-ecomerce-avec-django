import json

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views import View
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404

from django.contrib.auth import login
#from .forms import SignUpForm
from .models import Produit

from .products import products 
from .models import Produit, Cart, CartItem, Commande, Client
from django.contrib import messages
from django.contrib.auth import logout
from django.shortcuts import redirect
from collections import defaultdict
from django.contrib import messages
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import csrf_exempt
from .forms import CustomUserSignupForm


def _json_payload(request):
    if not request.body:
        return {}

    try:
        return json.loads(request.body.decode('utf-8'))
    except (ValueError, UnicodeDecodeError):
        return {}


def _serialize_client(client):
    if not client:
        return None

    return {
        'firstname': client.firstname,
        'lastName': client.lastName,
        'email': client.email,
        'phone': client.phone,
        'address': client.address,
        'city': client.city,
        'postalCode': client.postalCode,
        'country': client.country,
    }


def _serialize_user(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
    }

class Home(View):
    def get(self, request):
        produits = Produit.objects.all()
        return render(request, 'accueil.html', {'produits': produits})

    
class Produitlist(View):
        def get(self, request):
            produits = Produit.objects.all()  
            return render(request, 'produit.html', {'produit': produits})
        
    

class ProduitDetail(View):
    def get(self, request, id):
        produit = get_object_or_404(Produit, id=id)
        return render(request, 'produit_detail.html', {'produit': produit})
    


def signup_view(request):
    if request.method == 'POST':
        form = CustomUserSignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            if user.is_staff:
                return redirect('/admin/')
            else:
                return redirect('home')  # ou 'products'
    else:
        form = CustomUserSignupForm()
    return render(request, 'register.html', {'form': form})

    
def cart_view(request):
    return render(request, 'cart.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if user.is_staff:
                return redirect('/admin/')
            else:
                return redirect('home')
        else:
            return render(request, 'login.html', {'error': 'Identifiants invalides'})
    return render(request, 'login.html')


@require_POST
@login_required(login_url='login')
def add_to_cart(request, id):
    produit = get_object_or_404(Produit, id=id)
    cart, _ = Cart.objects.get_or_create(user=request.user)
    quantity = int(request.POST.get('quantity', 1))

    cart_item, created = CartItem.objects.get_or_create(cart=cart, produit=produit)
    if not created:
        cart_item.quantity += quantity
    else:
        cart_item.quantity = quantity
    cart_item.save()

    messages.success(request, f"{produit.name} ajouté au panier.")
    return redirect('produit_detail', id=id)
@login_required(login_url='login')
def cart_view(request):
    cart = Cart.objects.filter(user=request.user).first()
    items = CartItem.objects.filter(cart=cart) if cart else []

    categories = defaultdict(list)
    total_general = 0

    for item in items:
        cat = item.produit.category or "Sans catégorie"
        subtotal = item.quantity * float(item.produit.price)
        categories[cat].append({
            'produit': item.produit,
            'quantity': item.quantity,
            'subtotal': subtotal,
            'item_id': item.id 
        })
        total_general += subtotal

    return render(request, 'cart.html', {
        'categories': dict(categories),
        'total_general': total_general
    })

@login_required(login_url='login')
def checkout_view(request):
    product_id = request.GET.get('product_id')
    produits = []
    total = 0

    if product_id:
        produit = get_object_or_404(Produit, id=product_id)
        produits = [produit]
        total = float(produit.price)
    else:
        cart = Cart.objects.filter(user=request.user).first()
        items = CartItem.objects.filter(cart=cart) if cart else []
        produits = [item.produit for item in items]
        total = sum(item.quantity * float(item.produit.price) for item in items)

    if request.method == 'POST':
        Commande.objects.create(
            user=request.user,
            shippingAddress=request.POST['address'],
            city=request.POST['city'],
            postalCode=request.POST['postal'],
            country=request.POST['country'],
            totalPrice=total
        )
        if not product_id:
            CartItem.objects.filter(cart=cart).delete()
        request.session['cart'] = {}
        return redirect('profile')

    return render(request, 'checkout.html', {'total': total})


def profile_view(request):
    commandes = Commande.objects.filter(user=request.user)

    try:
        profil_client = Client.objects.get(user=request.user)
    except Client.DoesNotExist:
        profil_client = None

    return render(request, 'profile.html', {
        'commandes': commandes,
        'profil_client': profil_client,
        'user': request.user
    })




def custom_logout_view(request):
    logout(request)
    messages.success(request, "Vous avez été déconnecté avec succès.")
    return redirect('home')
        


class ProduitParCategorie(View):
    def get(self, request, categorie):
        produits = Produit.objects.filter(category__iexact=categorie)
        return render(request, 'produit_categorie.html', {
            'categorie': categorie,
            'produits': produits
        })




@login_required(login_url='login')
def remove_from_cart(request, item_id):
    item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    item.delete()
    return redirect('cart')


from django.db.models import Q

def search_produits(request):
    query = request.GET.get('q', '')
    produits = Produit.objects.filter(
        Q(name__icontains=query) | Q(description__icontains=query)
    ) if query else []

    return render(request, 'search_results.html', {
        'query': query,
        'produits': produits
    })





def register_view(request):
    if request.method == 'POST':
        form = CustomUserSignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = CustomUserSignupForm()
    return render(request, 'register.html', {'form': form})


@csrf_exempt
@require_POST
def api_login(request):
    data = _json_payload(request)
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return JsonResponse({'detail': 'Username et mot de passe requis.'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'detail': 'Identifiants invalides.'}, status=400)

    login(request, user)
    client = Client.objects.filter(user=user).first()
    return JsonResponse({
        'user': _serialize_user(user),
        'client': _serialize_client(client),
    })


@csrf_exempt
@require_POST
def api_register(request):
    data = _json_payload(request)
    form = CustomUserSignupForm(data)

    if not form.is_valid():
        return JsonResponse({'detail': 'Validation error', 'errors': form.errors}, status=400)

    user = form.save()
    login(request, user)
    client = Client.objects.filter(user=user).first()

    return JsonResponse({
        'user': _serialize_user(user),
        'client': _serialize_client(client),
    }, status=201)


@require_GET
def api_user(request):
    if request.user.is_anonymous:
        return JsonResponse({'detail': 'Authentication required'}, status=401)
    
    user = request.user
    client = Client.objects.filter(user=user).first()
    return JsonResponse({
        'user': _serialize_user(user),
        'client': _serialize_client(client),
    })


@csrf_exempt
@require_POST
def api_logout(request):
    logout(request)
    return JsonResponse({'detail': 'Logged out successfully'})


@require_POST
@login_required
def update_cart_item(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    try:
        new_quantity = int(request.POST.get('quantity'))
        if new_quantity > 0:
            cart_item.quantity = new_quantity
            cart_item.save()
            messages.success(request, f"Quantité de {cart_item.produit.name} mise à jour.")
    except (ValueError, TypeError):
        messages.error(request, "Quantité invalide.")
    return redirect('cart')


def _serialize_produit(request, produit):
    image_url = None
    if produit.image:
        image_url = request.build_absolute_uri(produit.image.url)

    return {
        "id": produit.id,
        "name": produit.name,
        "image": image_url,
        "description": produit.description,
        "category": produit.category,
        "price": float(produit.price),
        "countInStock": produit.countInStock,
    }


@require_GET
def api_products(request):
    query = request.GET.get("q", "").strip()
    category = request.GET.get("category", "").strip()
    produits = Produit.objects.all()

    if query:
        produits = produits.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )

    if category:
        produits = produits.filter(category__iexact=category)

    data = [_serialize_produit(request, produit) for produit in produits]
    return JsonResponse({"results": data})


@require_GET
def api_product_detail(request, id):
    produit = get_object_or_404(Produit, id=id)
    return JsonResponse(_serialize_produit(request, produit))


# Profile API Endpoints
@csrf_exempt
def api_profile(request):
    if request.user.is_anonymous:
        return JsonResponse({'detail': 'Authentication required'}, status=401)

    user = request.user

    def _build_profile_response(u):
        client = Client.objects.filter(user=u).first()
        orders = Commande.objects.filter(user=u)
        orders_data = [
            {
                'id': order.id,
                'created_at': order.createdAt.isoformat(),
                'total': float(order.totalPrice or 0),
                'status': 'Delivered' if order.isDelivered else ('Paid' if order.isPaid else 'Pending'),
                'is_validated': order.is_validated,
                'isPaid': order.isPaid,
                'isDelivered': order.isDelivered,
                'items': [],
            }
            for order in orders
        ]
        return {
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'client': _serialize_client(client),
            'orders': orders_data,
        }

    if request.method == 'GET':
        return JsonResponse(_build_profile_response(user))

    elif request.method in ['PATCH', 'PUT']:
        data = _json_payload(request)
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        user.save()
        return JsonResponse(_build_profile_response(user))

    return JsonResponse({'detail': 'Method not allowed'}, status=405)


# Cart API Endpoints
@csrf_exempt
def api_cart(request):
    if request.user.is_anonymous:
        return JsonResponse({'detail': 'Authentication required'}, status=401)

    if request.method == 'GET':
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return JsonResponse({'id': 0, 'items': [], 'total': 0})

        items = CartItem.objects.filter(cart=cart)
        items_data = []
        total = 0

        for item in items:
            item_total = item.quantity * float(item.produit.price or 0)
            total += item_total
            items_data.append({
                'id': item.id,
                'product': _serialize_produit(request, item.produit),
                'quantity': item.quantity,
            })

        return JsonResponse({
            'id': cart.id,
            'items': items_data,
            'total': total,
        })

    return JsonResponse({'detail': 'Method not allowed'}, status=405)


@csrf_exempt
@require_POST
def api_cart_add(request):
    if request.user.is_anonymous:
        return JsonResponse({'detail': 'Authentication required'}, status=401)

    data = _json_payload(request)
    product_id = data.get('product_id')
    quantity = int(data.get('quantity', 1))

    produit = get_object_or_404(Produit, id=product_id)
    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_item, created = CartItem.objects.get_or_create(cart=cart, produit=produit)

    if not created:
        cart_item.quantity += quantity
    else:
        cart_item.quantity = quantity
    cart_item.save()

    return JsonResponse({
        'id': cart_item.id,
        'product': _serialize_produit(request, produit),
        'quantity': cart_item.quantity,
    })


@csrf_exempt
def api_cart_item(request, item_id):
    if request.user.is_anonymous:
        return JsonResponse({'detail': 'Authentication required'}, status=401)

    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)

    if request.method in ['PATCH', 'PUT']:
        data = _json_payload(request)
        quantity = int(data.get('quantity', cart_item.quantity))
        if quantity > 0:
            cart_item.quantity = quantity
            cart_item.save()
        return JsonResponse({
            'id': cart_item.id,
            'product': _serialize_produit(request, cart_item.produit),
            'quantity': cart_item.quantity,
        })

    elif request.method == 'DELETE':
        cart_item.delete()
        return JsonResponse({'detail': 'Item removed'})

    return JsonResponse({'detail': 'Method not allowed'}, status=405)


# Orders API Endpoints
@csrf_exempt
def api_orders(request):
    if request.user.is_anonymous:
        return JsonResponse({'detail': 'Authentication required'}, status=401)

    if request.method == 'GET':
        orders = Commande.objects.filter(user=request.user)
        orders_data = []

        for order in orders:
            orders_data.append({
                'id': order.id,
                'created_at': order.createdAt.isoformat(),
                'total': float(order.totalPrice or 0),
                'status': 'Delivered' if order.isDelivered else ('Paid' if order.isPaid else 'Pending'),
                'items': [],
            })

        return JsonResponse(orders_data, safe=False)

    elif request.method == 'POST':
        data = _json_payload(request)
        cart = Cart.objects.filter(user=request.user).first()
        cart_items = CartItem.objects.filter(cart=cart) if cart else []

        if not cart_items:
            return JsonResponse({'detail': 'Cart is empty'}, status=400)

        total = sum(item.quantity * float(item.produit.price or 0) for item in cart_items)

        order = Commande.objects.create(
            user=request.user,
            shippingAddress=data.get('address', ''),
            city=data.get('city', ''),
            postalCode=data.get('postal_code', ''),
            country=data.get('country', ''),
            totalPrice=total,
            is_validated=True,
        )

        # Clear cart
        if cart:
            CartItem.objects.filter(cart=cart).delete()

        return JsonResponse({
            'id': order.id,
            'created_at': order.createdAt.isoformat(),
            'total': float(order.totalPrice or 0),
            'status': 'Pending',
            'items': [],
        }, status=201)

    return JsonResponse({'detail': 'Method not allowed'}, status=405)


# Create your views here.
