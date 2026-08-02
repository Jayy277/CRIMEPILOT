from django.urls import re_path
from .views import (
  LoginView, SignupView, ForgotPasswordView, ResetPasswordView, 
  ProfilePictureView, ProfileView, CitizenSignupView, CitizenPhoneLoginView, 
  SendEmailOTPView, VerifyEmailOTPView,
  CitizenForgotPasswordSendOTPView, CitizenForgotPasswordVerifyOTPView, CitizenForgotPasswordResetView
)

urlpatterns = [
  re_path(r'^login/?$', LoginView.as_view(), name='login'),
  re_path(r'^signup/?$', SignupView.as_view(), name='signup'),
  re_path(r'^profile/?$', ProfileView.as_view(), name='profile'),
  re_path(r'^me/?$', ProfileView.as_view(), name='me'),
  re_path(r'^citizen/signup/?$', CitizenSignupView.as_view(), name='citizen_signup'),
  re_path(r'^citizen/phone-login/?$', CitizenPhoneLoginView.as_view(), name='citizen_phone_login'),
  re_path(r'^forgot-password/?$', ForgotPasswordView.as_view(), name='forgot_password'),
  re_path(r'^reset-password/(?P<token>[^/]+)/?$', ResetPasswordView.as_view(), name='reset_password'),
  re_path(r'^profile-picture/?$', ProfilePictureView.as_view(), name='profile_picture'),
  re_path(r'^send-email-otp/?$', SendEmailOTPView.as_view(), name='send_email_otp'),
  re_path(r'^verify-email-otp/?$', VerifyEmailOTPView.as_view(), name='verify_email_otp'),
  re_path(r'^citizen/forgot-password/send-otp/?$', CitizenForgotPasswordSendOTPView.as_view(), name='citizen_fp_send_otp'),
  re_path(r'^citizen/forgot-password/verify-otp/?$', CitizenForgotPasswordVerifyOTPView.as_view(), name='citizen_fp_verify_otp'),
  re_path(r'^citizen/forgot-password/reset-password/?$', CitizenForgotPasswordResetView.as_view(), name='citizen_fp_reset_password'),
]


