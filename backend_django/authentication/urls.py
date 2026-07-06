from django.urls import path
from .views import LoginView, SignupView, ForgotPasswordView, ResetPasswordView, ProfilePictureView, CitizenSignupView

urlpatterns = [
  path('login', LoginView.as_view(), name='login'),
  path('signup', SignupView.as_view(), name='signup'),
  path('citizen/signup', CitizenSignupView.as_view(), name='citizen_signup'),
  path('forgot-password', ForgotPasswordView.as_view(), name='forgot_password'),
  path('reset-password/<str:token>', ResetPasswordView.as_view(), name='reset_password'),
  path('profile-picture', ProfilePictureView.as_view(), name='profile_picture'),
]
