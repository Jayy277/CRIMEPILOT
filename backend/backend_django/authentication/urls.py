from django.urls import path
from .views import LoginView, SignupView, ForgotPasswordView, ResetPasswordView, ProfilePictureView, CitizenSignupView, CitizenPhoneLoginView, SendEmailOTPView, VerifyEmailOTPView

urlpatterns = [
  path('login', LoginView.as_view(), name='login'),
  path('signup', SignupView.as_view(), name='signup'),
  path('citizen/signup/', CitizenSignupView.as_view(), name='citizen_signup'),
  path('citizen/phone-login', CitizenPhoneLoginView.as_view(), name='citizen_phone_login'),
  path('forgot-password', ForgotPasswordView.as_view(), name='forgot_password'),
  path('reset-password/<str:token>', ResetPasswordView.as_view(), name='reset_password'),
  path('profile-picture', ProfilePictureView.as_view(), name='profile_picture'),
  path('send-email-otp', SendEmailOTPView.as_view(), name='send_email_otp'),
  path('verify-email-otp', VerifyEmailOTPView.as_view(), name='verify_email_otp'),
]
