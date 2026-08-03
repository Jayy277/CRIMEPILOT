import os
import logging
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

SUPPORT_EMAIL = getattr(settings, 'SUPPORT_EMAIL', 'support@crimepilot.gov.in')
PORTAL_URL = getattr(settings, 'PORTAL_URL', 'http://localhost:3000')

def get_base_email_html(
  recipient_name,
  subject_title,
  banner_title,
  banner_subtitle,
  intro_message,
  details_list=None,
  check_list=None,
  button_text=None,
  button_url=None,
  extra_box=None,
  closing_note=None
):
  timestamp_str = timezone.now().strftime("%B %d, %Y %H:%M:%S UTC")
  
  # Format details table if present
  table_rows_html = ""
  if details_list:
    for item in details_list:
      label = item.get('label', '')
      value = item.get('value', '')
      color = item.get('color', '#FFFFFF')
      table_rows_html += f"""
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94A3B8; font-weight: 600; width: 35%; font-size: 13px;">{label}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: {color}; font-weight: bold; font-size: 13px;">{value}</td>
        </tr>
      """
  
  details_table_html = f"""
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: rgba(11, 18, 32, 0.6); border-radius: 8px; border: 1px solid rgba(77, 163, 255, 0.15); overflow: hidden;">
      {table_rows_html}
    </table>
  """ if details_list else ""

  # Format check list if present
  check_list_html = ""
  if check_list:
    items_html = "".join([f'<li style="margin-bottom: 8px; color: #E2E8F0; font-size: 13px;"><span style="color: #4DA3FF; font-weight: bold; margin-right: 8px;">✓</span>{item}</li>' for item in check_list])
    check_list_html = f"""
      <div style="margin: 20px 0; background-color: rgba(77, 163, 255, 0.05); padding: 16px 20px; border-radius: 8px; border-left: 3px solid #4DA3FF;">
        <p style="color: #4DA3FF; font-size: 13px; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">You can now:</p>
        <ul style="list-style: none; padding: 0; margin: 0;">
          {items_html}
        </ul>
      </div>
    """

  # Format extra box if present
  extra_box_html = ""
  if extra_box:
    eb_title = extra_box.get('title', 'Notice')
    eb_content = extra_box.get('content', '')
    extra_box_html = f"""
      <div style="margin: 20px 0; background-color: rgba(245, 158, 11, 0.08); border-left: 3px solid #F59E0B; padding: 14px 18px; border-radius: 0 8px 8px 0;">
        <p style="color: #F59E0B; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 6px 0;">{eb_title}</p>
        <p style="color: #E2E8F0; font-size: 13px; margin: 0; line-height: 1.5;">{eb_content}</p>
      </div>
    """

  # Format button if present
  button_html = f"""
    <div style="text-align: center; margin: 28px 0 20px 0;">
      <a href="{button_url or PORTAL_URL}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4DA3FF 0%, #2563EB 100%); color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; font-size: 13px; font-weight: 800; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(77, 163, 255, 0.3);">
        {button_text}
      </a>
    </div>
  """ if button_text else ""

  closing_note_html = f'<p style="color: #94A3B8; font-size: 13px; line-height: 1.5; margin-top: 16px;">{closing_note}</p>' if closing_note else ""

  html = f"""
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject_title}</title>
  </head>
  <body style="background-color: #0B1220; margin: 0; padding: 20px 10px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1E293B; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
      
      <!-- Header with Logo -->
      <div style="background-color: #0B1220; padding: 24px; text-align: center; border-bottom: 2px solid #4DA3FF;">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="font-size: 24px;">🛡️</span>
          <h1 style="color: #4DA3FF; margin: 0; font-size: 22px; letter-spacing: 2px; font-weight: 800; text-transform: uppercase; font-family: 'Outfit', 'Segoe UI', sans-serif;">CRIMEPILOT</h1>
        </div>
        <p style="color: #94A3B8; margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Digital Crime Intelligence Platform</p>
      </div>

      <!-- Banner -->
      <div style="background: linear-gradient(135deg, rgba(77, 163, 255, 0.12) 0%, rgba(15, 23, 42, 0) 100%); padding: 20px 24px; border-bottom: 1px solid #1E293B;">
        <h2 style="color: #FFFFFF; font-size: 18px; font-weight: 700; margin: 0;">{banner_title}</h2>
        <p style="color: #4DA3FF; font-size: 12px; font-weight: 700; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">{banner_subtitle}</p>
      </div>

      <!-- Content Body -->
      <div style="padding: 24px;">
        <p style="color: #F8FAFC; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">Hello {recipient_name},</p>
        <p style="color: #E2E8F0; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">{intro_message}</p>

        {details_table_html}
        {check_list_html}
        {extra_box_html}
        {closing_note_html}
        {button_html}
      </div>

      <!-- Footer -->
      <div style="background-color: #0B1220; padding: 20px 24px; text-align: center; border-top: 1px solid #1E293B; font-size: 11px; color: #94A3B8; line-height: 1.6;">
        <p style="margin: 0; font-weight: bold; color: #E2E8F0;">CrimePilot</p>
        <p style="margin: 2px 0 0 0; color: #94A3B8;">Digital Crime Intelligence Platform</p>
        <p style="margin: 6px 0 0 0;">Support Email: <a href="mailto:{SUPPORT_EMAIL}" style="color: #4DA3FF; text-decoration: none;">{SUPPORT_EMAIL}</a></p>
        <p style="margin: 4px 0 0 0; color: #64748B;">Timestamp: {timestamp_str}</p>
        <p style="margin: 12px 0 0 0; color: #F59E0B; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">This is an automated email. Please do not reply.</p>
        <p style="margin: 8px 0 0 0; color: #475569; font-size: 9px; text-transform: uppercase;">CONFIDENTIALITY NOTICE: This transmission is intended solely for the registered citizen associated with this account or dossier. Unauthorized interception or copying is strictly prohibited by law.</p>
      </div>

    </div>
  </body>
  </html>
  """
  return html


def send_welcome_email(user, citizen=None):
  """
  Requirement 1: WELCOME EMAIL AFTER CITIZEN REGISTRATION
  """
  if not user or not user.email:
    logger.warning("send_welcome_email skipped: No user or email found.")
    return False

  try:
    recipient_name = user.name or "Citizen"
    mobile = citizen.mobile if citizen and hasattr(citizen, 'mobile') and citizen.mobile else "N/A"
    reg_date = timezone.now().strftime("%B %d, %Y")

    subject = "Welcome to CrimePilot – Your Account Has Been Created Successfully"
    banner_title = "Account Registration Confirmed"
    banner_subtitle = "Welcome to National Digital Defense Network"
    intro_message = "Welcome to CrimePilot – Digital Crime Intelligence Platform. Your account has been successfully created."

    details_list = [
      {'label': '• Name', 'value': user.name},
      {'label': '• Email', 'value': user.email},
      {'label': '• Mobile Number', 'value': mobile},
      {'label': '• Registration Date', 'value': reg_date}
    ]

    check_list = [
      "Login securely",
      "File Digital FIR",
      "Track FIR Status",
      "Upload Additional Evidence",
      "Download Official FIR PDF",
      "Receive Investigation Updates"
    ]

    closing_note = "Keep your login credentials safe."
    button_text = "Login to CrimePilot"
    button_url = f"{PORTAL_URL}/citizen/login"

    html_content = get_base_email_html(
      recipient_name=recipient_name,
      subject_title=subject,
      banner_title=banner_title,
      banner_subtitle=banner_subtitle,
      intro_message=intro_message,
      details_list=details_list,
      check_list=check_list,
      button_text=button_text,
      button_url=button_url,
      closing_note=closing_note
    )
    text_content = strip_tags(html_content)

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'crimepilot111@gmail.com')
    msg = EmailMultiAlternatives(subject, text_content, from_email, [user.email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    logger.info(f"Welcome email successfully sent to {user.email}")
    print(f"[Email Success] Welcome email dispatched to {user.email}")
    return True
  except Exception as e:
    logger.error(f"Failed to send welcome email to {user.email}: {e}")
    print(f"[Email Error] Welcome email dispatch failed for {user.email}: {e}")
    return False

sendWelcomeEmail = send_welcome_email


def send_fir_submission_email(crime):
  """
  Requirement 2: FIR SUBMISSION EMAIL
  """
  if not crime or not crime.citizen or not crime.citizen.user or not crime.citizen.user.email:
    logger.warning("send_fir_submission_email skipped: No citizen or email attached to crime.")
    return False

  try:
    citizen_user = crime.citizen.user
    recipient_email = citizen_user.email
    recipient_name = citizen_user.name or "Citizen"

    fir_number = crime.crime_id or f"CP-FIR-{crime.id}"
    category_name = crime.crime_category.name if crime.crime_category else "General Crime"
    priority = crime.priority or "Medium"
    station_name = f"{crime.location.police_station}, {crime.location.city}" if crime.location else "Jurisdiction Station"
    incident_date = str(crime.date) if crime.date else "N/A"
    incident_time = str(crime.time) if crime.time else "N/A"
    status_str = "FIR Submitted"

    subject = "CrimePilot – FIR Successfully Registered"
    banner_title = "FIR Successfully Registered"
    banner_subtitle = f"Official Record: {fir_number}"
    intro_message = "Your FIR has been successfully registered. Our department will review it shortly."

    details_list = [
      {'label': 'Citizen Name', 'value': recipient_name},
      {'label': 'FIR Number', 'value': fir_number, 'color': '#4DA3FF'},
      {'label': 'Crime Category', 'value': category_name},
      {'label': 'Priority', 'value': priority},
      {'label': 'Police Station', 'value': station_name},
      {'label': 'Date', 'value': incident_date},
      {'label': 'Time', 'value': incident_time},
      {'label': 'Current Status', 'value': status_str, 'color': '#10B981'}
    ]

    button_text = "Track My FIR"
    button_url = f"{PORTAL_URL}/citizen/my-cases"

    html_content = get_base_email_html(
      recipient_name=recipient_name,
      subject_title=subject,
      banner_title=banner_title,
      banner_subtitle=banner_subtitle,
      intro_message=intro_message,
      details_list=details_list,
      button_text=button_text,
      button_url=button_url
    )
    text_content = strip_tags(html_content)

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'crimepilot111@gmail.com')
    msg = EmailMultiAlternatives(subject, text_content, from_email, [recipient_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    logger.info(f"FIR submission email sent to {recipient_email} for case {fir_number}")
    print(f"[Email Success] FIR Submission email dispatched to {recipient_email} for case {fir_number}")
    return True
  except Exception as e:
    logger.error(f"Failed to send FIR submission email to {crime.citizen.user.email}: {e}")
    print(f"[Email Error] FIR submission email failed for {crime.crime_id}: {e}")
    return False

sendFirSubmissionEmail = send_fir_submission_email


def send_fir_status_email(crime, event_type=None):
  """
  Requirement 3 & 4 & 5: FIR STATUS UPDATE EMAIL
  """
  if not crime or not crime.citizen or not crime.citizen.user or not crime.citizen.user.email:
    logger.warning("send_fir_status_email skipped: No citizen or email attached to crime.")
    return False

  try:
    citizen_user = crime.citizen.user
    recipient_email = citizen_user.email
    recipient_name = citizen_user.name or "Citizen"

    fir_number = crime.crime_id or f"CP-FIR-{crime.id}"
    current_status = crime.status or "Reported"
    station_name = f"{crime.location.police_station}, {crime.location.city}" if crime.location else "Jurisdiction Station"
    
    officer_name = "Assigned Personnel (Under Review)"
    if crime.officer and crime.officer.user:
      officer_name = f"Inspector {crime.officer.user.name} (Badge: {crime.officer.badge_no})"

    updated_on = timezone.now().strftime("%B %d, %Y %H:%M:%S UTC")

    subject = "CrimePilot – FIR Status Updated"
    banner_title = "FIR Status Updated"
    banner_subtitle = f"Case Ref: {fir_number}"
    intro_message = "Your FIR status has been updated."

    details_list = [
      {'label': 'FIR Number:', 'value': fir_number, 'color': '#4DA3FF'},
      {'label': 'Current Status:', 'value': current_status, 'color': '#10B981'},
      {'label': 'Police Station:', 'value': station_name},
      {'label': 'Assigned Officer:', 'value': officer_name},
      {'label': 'Updated On:', 'value': updated_on}
    ]

    closing_note = "If additional action is required, please login to CrimePilot."
    button_text = "Track My FIR"
    button_url = f"{PORTAL_URL}/citizen/my-cases"

    html_content = get_base_email_html(
      recipient_name=recipient_name,
      subject_title=subject,
      banner_title=banner_title,
      banner_subtitle=banner_subtitle,
      intro_message=intro_message,
      details_list=details_list,
      closing_note=closing_note,
      button_text=button_text,
      button_url=button_url
    )
    text_content = strip_tags(html_content)

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'crimepilot111@gmail.com')
    msg = EmailMultiAlternatives(subject, text_content, from_email, [recipient_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    logger.info(f"FIR status email sent to {recipient_email} for case {fir_number}")
    print(f"[Email Success] FIR Status Update email dispatched to {recipient_email} for status '{current_status}'")
    return True
  except Exception as e:
    logger.error(f"Failed to send FIR status email to {crime.citizen.user.email}: {e}")
    print(f"[Email Error] FIR status email failed for {crime.crime_id}: {e}")
    return False

sendFirStatusEmail = send_fir_status_email


def send_evidence_request_email(crime, extra_details=None):
  """
  Requirement 6: EVIDENCE REQUEST EMAIL
  """
  if not crime or not crime.citizen or not crime.citizen.user or not crime.citizen.user.email:
    logger.warning("send_evidence_request_email skipped: No citizen or email attached to crime.")
    return False

  try:
    citizen_user = crime.citizen.user
    recipient_email = citizen_user.email
    recipient_name = citizen_user.name or "Citizen"

    fir_number = crime.crime_id or f"CP-FIR-{crime.id}"
    station_name = f"{crime.location.police_station}, {crime.location.city}" if crime.location else "Jurisdiction Station"
    officer_name = f"Inspector {crime.officer.user.name}" if crime.officer and crime.officer.user else "Investigating Officer"
    updated_on = timezone.now().strftime("%B %d, %Y %H:%M:%S UTC")

    subject = "Additional Evidence Required"
    banner_title = "Additional Evidence Required"
    banner_subtitle = f"Case Ref: {fir_number}"
    intro_message = f"Please upload the requested documents for FIR {fir_number}."

    details_list = [
      {'label': 'FIR Number:', 'value': fir_number, 'color': '#4DA3FF'},
      {'label': 'Current Status:', 'value': 'Evidence Requested', 'color': '#F59E0B'},
      {'label': 'Police Station:', 'value': station_name},
      {'label': 'Assigned Officer:', 'value': officer_name},
      {'label': 'Updated On:', 'value': updated_on}
    ]

    extra_box = {
      'title': 'Officer Instructions',
      'content': extra_details if extra_details else f"The investigating officer requires supporting documentation or proof files to proceed with FIR {fir_number}."
    }

    button_text = "Upload Evidence"
    button_url = f"{PORTAL_URL}/citizen/my-cases"

    html_content = get_base_email_html(
      recipient_name=recipient_name,
      subject_title=subject,
      banner_title=banner_title,
      banner_subtitle=banner_subtitle,
      intro_message=intro_message,
      details_list=details_list,
      extra_box=extra_box,
      button_text=button_text,
      button_url=button_url
    )
    text_content = strip_tags(html_content)

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'crimepilot111@gmail.com')
    msg = EmailMultiAlternatives(subject, text_content, from_email, [recipient_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    logger.info(f"Evidence request email sent to {recipient_email} for case {fir_number}")
    print(f"[Email Success] Evidence Request email dispatched to {recipient_email} for case {fir_number}")
    return True
  except Exception as e:
    logger.error(f"Failed to send evidence request email: {e}")
    print(f"[Email Error] Evidence request email failed for {crime.crime_id}: {e}")
    return False

sendEvidenceRequestEmail = send_evidence_request_email


def send_case_closed_email(crime):
  """
  Requirement 7: CASE CLOSED EMAIL
  """
  if not crime or not crime.citizen or not crime.citizen.user or not crime.citizen.user.email:
    logger.warning("send_case_closed_email skipped: No citizen or email attached to crime.")
    return False

  try:
    citizen_user = crime.citizen.user
    recipient_email = citizen_user.email
    recipient_name = citizen_user.name or "Citizen"

    fir_number = crime.crime_id or f"CP-FIR-{crime.id}"
    officer_name = f"Inspector {crime.officer.user.name}" if crime.officer and crime.officer.user else "Assigned Officer"
    closure_date = timezone.now().strftime("%B %d, %Y %H:%M:%S UTC")

    subject = "Your FIR Has Been Closed"
    banner_title = "Your FIR Has Been Closed"
    banner_subtitle = f"Archived Case: {fir_number}"
    intro_message = f"Your case FIR {fir_number} has been officially closed."

    details_list = [
      {'label': 'FIR Number:', 'value': fir_number, 'color': '#4DA3FF'},
      {'label': 'Officer:', 'value': officer_name},
      {'label': 'Closure Date:', 'value': closure_date},
      {'label': 'Final Status:', 'value': 'Closed', 'color': '#EF4444'}
    ]

    closing_note = "Thank you for using CrimePilot. We appreciate your cooperation throughout the investigation."
    button_text = "Track My FIR"
    button_url = f"{PORTAL_URL}/citizen/my-cases"

    html_content = get_base_email_html(
      recipient_name=recipient_name,
      subject_title=subject,
      banner_title=banner_title,
      banner_subtitle=banner_subtitle,
      intro_message=intro_message,
      details_list=details_list,
      closing_note=closing_note,
      button_text=button_text,
      button_url=button_url
    )
    text_content = strip_tags(html_content)

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'crimepilot111@gmail.com')
    msg = EmailMultiAlternatives(subject, text_content, from_email, [recipient_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    logger.info(f"Case closed email sent to {recipient_email} for case {fir_number}")
    print(f"[Email Success] Case Closed email dispatched to {recipient_email} for case {fir_number}")
    return True
  except Exception as e:
    logger.error(f"Failed to send case closed email: {e}")
    print(f"[Email Error] Case closed email failed for {crime.crime_id}: {e}")
    return False

sendCaseClosedEmail = send_case_closed_email


def send_case_progression_email(crime, event_type, extra_details=None):
  """
  Backwards compatibility dispatcher function.
  """
  if event_type == "FIR Submitted":
    return send_fir_submission_email(crime)
  elif event_type == "Evidence Requested":
    return send_evidence_request_email(crime, extra_details=extra_details)
  elif event_type == "Case Closed":
    return send_case_closed_email(crime)
  else:
    return send_fir_status_email(crime, event_type=event_type)
