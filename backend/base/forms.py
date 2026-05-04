from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Client

# class SignUpForm(UserCreationForm):
#     email = forms.EmailField(required=True)
#
#     class Meta:
#         model = User
#         fields = ['username', 'email', 'password1', 'password2']
#
#     def __init__(self, *args, **kwargs):
#         super(SignUpForm, self).__init__(*args, **kwargs)
#         for field in self.fields.values():
#             field.widget.attrs['class'] = 'form-control'



class CustomUserSignupForm(UserCreationForm):
    email = forms.EmailField(required=True)
    firstname = forms.CharField(max_length=200, required=True)
    lastName = forms.CharField(max_length=200, required=True)
    phone = forms.CharField(max_length=200, required=False)
    address = forms.CharField(max_length=200, required=False)
    city = forms.CharField(max_length=200, required=False)
    postalCode = forms.CharField(max_length=200, required=False)
    country = forms.CharField(max_length=200, required=False)

    class Meta:
        model = User
        fields = ['username', 'password1', 'password2', 'email', 'firstname', 'lastName',
                  'phone', 'address', 'city', 'postalCode', 'country']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['firstname']
        user.last_name = self.cleaned_data['lastName']
        if commit:
            user.save()
            # Créer le client lié
            Client.objects.create(
                user=user,
                firstname=self.cleaned_data['firstname'],
                lastName=self.cleaned_data['lastName'],
                email=self.cleaned_data['email'],
                phone=self.cleaned_data.get('phone'),
                address=self.cleaned_data.get('address'),
                city=self.cleaned_data.get('city'),
                postalCode=self.cleaned_data.get('postalCode'),
                country=self.cleaned_data.get('country')
            )
        return user
